"""
SAP RFC Connector for OCP Maintenance AI
=========================================
Ready-to-use connector using PyRFC library.
Requires: pyrfc package + SAP NW RFC SDK installed on server.

Usage:
  connector = SAPRFCConnector(config)
  result = await connector.create_maintenance_plan(plan_data)

Configuration via environment variables:
  SAP_ASHOST, SAP_SYSNR, SAP_CLIENT, SAP_USER, SAP_PASSWD, SAP_LANG

When SAP is not available, the module exports SAP_AVAILABLE = False and all
methods operate in dry_run mode automatically, logging what would be sent.
"""

from __future__ import annotations

import logging
import os
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Generator

# ---------------------------------------------------------------------------
# Availability flag — allows the rest of the app to gracefully degrade
# ---------------------------------------------------------------------------
try:
    import pyrfc  # type: ignore[import-untyped]

    SAP_AVAILABLE = True
except ImportError:
    pyrfc = None  # type: ignore[assignment]
    SAP_AVAILABLE = False

logger = logging.getLogger(__name__)


# ============================================================
# Result types
# ============================================================

class RFCStatus(str, Enum):
    """Outcome of an RFC call."""
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"
    DRY_RUN = "DRY_RUN"


@dataclass
class BAPIReturn:
    """Parsed BAPIRET2 message from SAP."""
    type: str = ""        # S=Success, E=Error, W=Warning, I=Info, A=Abort
    id: str = ""          # Message class
    number: str = ""      # Message number
    message: str = ""     # Long text
    log_no: str = ""
    log_msg_no: str = ""
    message_v1: str = ""
    message_v2: str = ""
    message_v3: str = ""
    message_v4: str = ""

    @classmethod
    def from_sap(cls, raw: dict[str, Any]) -> BAPIReturn:
        """Create from SAP BAPIRET2 structure (upper-case keys)."""
        return cls(
            type=raw.get("TYPE", ""),
            id=raw.get("ID", ""),
            number=raw.get("NUMBER", ""),
            message=raw.get("MESSAGE", ""),
            log_no=raw.get("LOG_NO", ""),
            log_msg_no=raw.get("LOG_MSG_NO", ""),
            message_v1=raw.get("MESSAGE_V1", ""),
            message_v2=raw.get("MESSAGE_V2", ""),
            message_v3=raw.get("MESSAGE_V3", ""),
            message_v4=raw.get("MESSAGE_V4", ""),
        )

    @property
    def is_error(self) -> bool:
        return self.type in ("E", "A")

    @property
    def is_success(self) -> bool:
        return self.type == "S"


@dataclass
class RFCResult:
    """Standardised result from any RFC call."""
    status: RFCStatus
    data: dict[str, Any] = field(default_factory=dict)
    messages: list[BAPIReturn] = field(default_factory=list)
    elapsed_ms: float = 0.0
    function_module: str = ""
    sap_object_id: str = ""  # e.g. plan number, order number created

    @property
    def has_errors(self) -> bool:
        return any(m.is_error for m in self.messages)

    @property
    def error_text(self) -> str:
        return "; ".join(m.message for m in self.messages if m.is_error)


# ============================================================
# Field-mapping helpers  (internal model -> SAP field names)
# ============================================================

# Maps our SAPMaintenancePlan fields to BAPI_MAINTENANCEPLAN_CREATE params
PLAN_FIELD_MAP: dict[str, str] = {
    "plan_id":            "PLAN_NUMBER",
    "description":        "PLAN_TEXT",
    "category":           "PLAN_CATEGORY",
    "cycle_value":        "CYCLE",
    "cycle_unit":         "CYCLE_UNIT",
    "call_horizon_pct":   "CALL_HORIZON",
    "scheduling_period":  "SCHED_PERIOD",
    "scheduling_unit":    "SCHED_PERIOD_UNIT",
}

# Maps our SAPMaintenanceItem fields to BAPI_MAINTENANCEITEM_CREATE params
ITEM_FIELD_MAP: dict[str, str] = {
    "item_ref":           "ITEM_NUMBER",
    "description":        "ITEM_TEXT",
    "order_type":         "ORDER_TYPE",
    "func_loc":           "FUNC_LOC",
    "main_work_center":   "MN_WK_CTR",
    "planner_group":      "PLNR_GRP",
    "task_list_ref":      "TASK_LIST_NO",
    "priority":           "PRIORITY",
}

# Maps our SAPOperation fields to ALM order operation structure
OPERATION_FIELD_MAP: dict[str, str] = {
    "operation_number":   "ACTIVITY",
    "work_centre":        "WORK_CNTR",
    "control_key":        "CONTROL_KEY",
    "short_text":         "DESCRIPTION",
    "duration_hours":     "DURATION",
    "unit":               "DURATION_UNIT",
    "num_workers":        "NUMBER_OF_CAPACITIES",
}

# Maps our SAPTaskList fields to IA05/IP11-equivalent BAPI params
TASK_LIST_FIELD_MAP: dict[str, str] = {
    "list_ref":           "GROUP",
    "description":        "PLANNER_GROUP_DESC",
    "func_loc":           "FUNC_LOC",
    "system_condition":   "SYS_COND",
}

# Frequency unit mapping (mirrors sap_export_engine.py)
FREQ_UNIT_TO_SAP: dict[str, str] = {
    "DAYS": "DAY",
    "WEEKS": "WK",
    "MONTHS": "MON",
    "YEARS": "YR",
    "HOURS": "H",
    "OPERATING_HOURS": "H",
}


def _map_fields(source: dict[str, Any], mapping: dict[str, str]) -> dict[str, Any]:
    """Translate internal field names to SAP BAPI parameter names."""
    return {mapping[k]: v for k, v in source.items() if k in mapping}


# ============================================================
# Connection configuration
# ============================================================

@dataclass(frozen=True)
class SAPConnectionConfig:
    """SAP RFC connection parameters — loaded from environment."""
    ashost: str
    sysnr: str
    client: str
    user: str
    passwd: str
    lang: str = "EN"

    # Connection pool settings
    pool_size: int = 5
    max_retries: int = 3
    retry_delay_s: float = 2.0

    @classmethod
    def from_env(cls) -> SAPConnectionConfig:
        """
        Build config from environment variables.

        Required env vars: SAP_ASHOST, SAP_SYSNR, SAP_CLIENT, SAP_USER, SAP_PASSWD
        Optional: SAP_LANG (default EN), SAP_POOL_SIZE (default 5)
        """
        ashost = os.getenv("SAP_ASHOST", "")
        sysnr = os.getenv("SAP_SYSNR", "00")
        client = os.getenv("SAP_CLIENT", "100")
        user = os.getenv("SAP_USER", "")
        passwd = os.getenv("SAP_PASSWD", "")
        lang = os.getenv("SAP_LANG", "EN")
        pool_size = int(os.getenv("SAP_POOL_SIZE", "5"))

        if not ashost or not user or not passwd:
            logger.warning(
                "SAP RFC credentials incomplete (SAP_ASHOST/SAP_USER/SAP_PASSWD). "
                "Connector will operate in dry_run mode only."
            )

        return cls(
            ashost=ashost,
            sysnr=sysnr,
            client=client,
            user=user,
            passwd=passwd,
            lang=lang,
            pool_size=pool_size,
        )

    @property
    def is_configured(self) -> bool:
        return bool(self.ashost and self.user and self.passwd)

    def to_connection_params(self) -> dict[str, str]:
        """Return dict suitable for pyrfc.Connection()."""
        return {
            "ashost": self.ashost,
            "sysnr": self.sysnr,
            "client": self.client,
            "user": self.user,
            "passwd": self.passwd,
            "lang": self.lang,
        }


# ============================================================
# Custom exceptions
# ============================================================

class SAPRFCError(Exception):
    """Base exception for SAP RFC operations."""

    def __init__(self, message: str, function_module: str = "", bapi_return: list[BAPIReturn] | None = None):
        self.function_module = function_module
        self.bapi_return = bapi_return or []
        super().__init__(message)


class SAPConnectionError(SAPRFCError):
    """Raised when connection to SAP cannot be established."""


class SAPBAPIError(SAPRFCError):
    """Raised when a BAPI call returns error-type messages."""


# ============================================================
# Main connector class
# ============================================================

class SAPRFCConnector:
    """
    Production-ready SAP RFC connector for OCP Maintenance AI.

    Provides methods to create/read SAP PM objects via BAPI calls.
    Supports dry_run mode (logging only) and connection pooling.

    Usage:
        config = SAPConnectionConfig.from_env()
        connector = SAPRFCConnector(config)

        # Test connectivity
        result = connector.test_connection()

        # Create a full maintenance package
        result = connector.upload_package(package_dict)

        # Read data
        wo = connector.read_work_order("000004001234")
        locs = connector.list_functional_locations("1000")
    """

    def __init__(self, config: SAPConnectionConfig | None = None):
        self._config = config or SAPConnectionConfig.from_env()
        self._pool: list[Any] = []  # Simple connection pool
        self._pool_max = self._config.pool_size

        if not SAP_AVAILABLE:
            logger.info(
                "pyrfc not installed — SAPRFCConnector will operate in dry_run mode. "
                "Install with: pip install pyrfc (requires SAP NW RFC SDK)."
            )
        elif not self._config.is_configured:
            logger.info(
                "SAP credentials not configured — SAPRFCConnector will operate in dry_run mode."
            )
        else:
            logger.info(
                "SAPRFCConnector initialised for %s (client %s).",
                self._config.ashost,
                self._config.client,
            )

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    @property
    def can_connect(self) -> bool:
        """True if pyrfc is installed AND credentials are configured."""
        return SAP_AVAILABLE and self._config.is_configured

    # ------------------------------------------------------------------
    # Connection management
    # ------------------------------------------------------------------

    @contextmanager
    def _get_connection(self) -> Generator[Any, None, None]:
        """
        Context manager that provides a pyrfc.Connection with retry logic.

        Implements simple pool: reuses connections when available,
        creates new ones up to pool_max, retries on transient failures.

        Yields:
            pyrfc.Connection instance

        Raises:
            SAPConnectionError: if connection cannot be established after retries.
        """
        if not SAP_AVAILABLE:
            raise SAPConnectionError(
                "pyrfc is not installed. Install with: pip install pyrfc",
                function_module="CONNECTION",
            )
        if not self._config.is_configured:
            raise SAPConnectionError(
                "SAP credentials not configured. Set SAP_ASHOST, SAP_USER, SAP_PASSWD env vars.",
                function_module="CONNECTION",
            )

        conn = None
        last_error: Exception | None = None

        # Try to reuse a pooled connection
        if self._pool:
            conn = self._pool.pop()
            try:
                conn.ping()  # Verify it's still alive
            except Exception:
                conn = None  # Discard stale connection

        # Create new connection with retry
        if conn is None:
            for attempt in range(1, self._config.max_retries + 1):
                try:
                    conn = pyrfc.Connection(**self._config.to_connection_params())
                    logger.debug(
                        "SAP RFC connection established (attempt %d/%d).",
                        attempt,
                        self._config.max_retries,
                    )
                    break
                except Exception as exc:
                    last_error = exc
                    logger.warning(
                        "SAP RFC connection attempt %d/%d failed: %s",
                        attempt,
                        self._config.max_retries,
                        exc,
                    )
                    if attempt < self._config.max_retries:
                        time.sleep(self._config.retry_delay_s * attempt)  # Linear backoff

            if conn is None:
                raise SAPConnectionError(
                    f"Failed to connect to SAP after {self._config.max_retries} attempts: {last_error}",
                    function_module="CONNECTION",
                )

        try:
            yield conn
        finally:
            # Return connection to pool if pool is not full
            if conn is not None and len(self._pool) < self._pool_max:
                try:
                    conn.ping()
                    self._pool.append(conn)
                except Exception:
                    try:
                        conn.close()
                    except Exception:
                        pass
            elif conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass

    def _call_bapi(
        self,
        function_module: str,
        params: dict[str, Any],
        *,
        dry_run: bool = False,
        commit: bool = True,
    ) -> RFCResult:
        """
        Low-level BAPI call wrapper with timing, logging, error parsing, and optional COMMIT.

        Args:
            function_module: SAP function module name (e.g. BAPI_MAINTENANCEPLAN_CREATE).
            params: Dict of import/table parameters for the FM.
            dry_run: If True, log the call but do not execute.
            commit: If True, call BAPI_TRANSACTION_COMMIT after a successful call.

        Returns:
            RFCResult with parsed data and messages.
        """
        if dry_run or not self.can_connect:
            mode = "DRY_RUN" if dry_run else "NO_SAP_CONNECTION"
            logger.info(
                "[%s] %s would be called with params: %s",
                mode,
                function_module,
                _sanitise_log(params),
            )
            return RFCResult(
                status=RFCStatus.DRY_RUN,
                data=params,
                function_module=function_module,
            )

        t0 = time.monotonic()
        try:
            with self._get_connection() as conn:
                raw_result = conn.call(function_module, **params)
                elapsed = (time.monotonic() - t0) * 1000

                # Parse BAPIRET2 messages (various return param names)
                messages = _extract_bapi_messages(raw_result)

                result = RFCResult(
                    status=RFCStatus.SUCCESS,
                    data=raw_result,
                    messages=messages,
                    elapsed_ms=round(elapsed, 2),
                    function_module=function_module,
                )

                if result.has_errors:
                    result.status = RFCStatus.ERROR
                    logger.error(
                        "%s returned errors (%.0fms): %s",
                        function_module,
                        elapsed,
                        result.error_text,
                    )
                else:
                    logger.info(
                        "%s completed successfully (%.0fms).",
                        function_module,
                        elapsed,
                    )
                    # Commit the LUW if requested and no errors
                    if commit:
                        conn.call("BAPI_TRANSACTION_COMMIT", WAIT="X")
                        logger.debug("BAPI_TRANSACTION_COMMIT executed.")

                return result

        except SAPConnectionError:
            raise
        except Exception as exc:
            elapsed = (time.monotonic() - t0) * 1000
            logger.exception(
                "%s failed after %.0fms: %s", function_module, elapsed, exc
            )
            raise SAPRFCError(
                f"{function_module} call failed: {exc}",
                function_module=function_module,
            ) from exc

    # ------------------------------------------------------------------
    # Public methods
    # ------------------------------------------------------------------

    def test_connection(self, *, dry_run: bool = False) -> RFCResult:
        """
        Ping SAP system to verify RFC connectivity.

        SAP Transaction: SM59 (RFC Destinations)
        Function Module: RFC_PING

        Args:
            dry_run: If True, log the intent without calling SAP.

        Returns:
            RFCResult with SUCCESS if ping responds, ERROR otherwise.
        """
        logger.info("Testing SAP RFC connection...")
        return self._call_bapi("RFC_PING", {}, dry_run=dry_run, commit=False)

    def create_maintenance_plan(
        self,
        plan: dict[str, Any],
        *,
        dry_run: bool = False,
    ) -> RFCResult:
        """
        Create a Maintenance Plan in SAP PM.

        SAP Transaction: IP01 (Create Maintenance Plan)
        Function Module: BAPI_MAINTENANCEPLAN_CREATE

        Expected input fields (our internal model):
            plan_id, description, category, cycle_value, cycle_unit,
            call_horizon_pct, scheduling_period, scheduling_unit

        Args:
            plan: Dict with maintenance plan fields from SAPMaintenancePlan schema.
            dry_run: If True, log the mapped payload without calling SAP.

        Returns:
            RFCResult — on success, sap_object_id contains the new plan number.
        """
        sap_params = _map_fields(plan, PLAN_FIELD_MAP)

        # Build the BAPI import structure
        bapi_params = {
            "HEADERDATA": {
                "PLAN_TEXT": sap_params.get("PLAN_TEXT", ""),
                "PLAN_CATEGORY": sap_params.get("PLAN_CATEGORY", "PM"),
            },
            "CYCLE": {
                "CYCLE": sap_params.get("CYCLE", 0),
                "CYCLE_UNIT": sap_params.get("CYCLE_UNIT", "DAY"),
            },
            "SCHEDULING": {
                "CALL_HORIZON": sap_params.get("CALL_HORIZON", 50),
                "SCHED_PERIOD": sap_params.get("SCHED_PERIOD", 14),
                "SCHED_PERIOD_UNIT": sap_params.get("SCHED_PERIOD_UNIT", "DAY"),
            },
        }

        logger.info(
            "Creating maintenance plan: %s (cycle: %s %s).",
            plan.get("description", "N/A"),
            plan.get("cycle_value"),
            plan.get("cycle_unit"),
        )

        result = self._call_bapi(
            "BAPI_MAINTENANCEPLAN_CREATE",
            bapi_params,
            dry_run=dry_run,
        )

        # Extract the created plan number from the result
        if result.status == RFCStatus.SUCCESS and not result.has_errors:
            result.sap_object_id = result.data.get("PLAN_NUMBER", "")

        return result

    def create_maintenance_item(
        self,
        item: dict[str, Any],
        plan_number: str = "",
        *,
        dry_run: bool = False,
    ) -> RFCResult:
        """
        Create a Maintenance Item linked to a Maintenance Plan.

        SAP Transaction: IP04 (Create Maintenance Item)
        Function Module: BAPI_MAINTENANCEITEM_CREATE

        Expected input fields (our internal model):
            item_ref, description, order_type, func_loc, main_work_center,
            planner_group, task_list_ref, priority

        Args:
            item: Dict with maintenance item fields from SAPMaintenanceItem schema.
            plan_number: SAP plan number to attach this item to (from create_maintenance_plan).
            dry_run: If True, log the mapped payload without calling SAP.

        Returns:
            RFCResult — on success, sap_object_id contains the new item number.
        """
        sap_params = _map_fields(item, ITEM_FIELD_MAP)

        bapi_params = {
            "HEADERDATA": {
                "ITEM_TEXT": sap_params.get("ITEM_TEXT", ""),
                "ORDER_TYPE": sap_params.get("ORDER_TYPE", "PM03"),
                "FUNC_LOC": sap_params.get("FUNC_LOC", ""),
                "MN_WK_CTR": sap_params.get("MN_WK_CTR", ""),
                "PLNR_GRP": sap_params.get("PLNR_GRP", ""),
                "PRIORITY": sap_params.get("PRIORITY", "4"),
                "TASK_LIST_NO": sap_params.get("TASK_LIST_NO", ""),
            },
        }

        if plan_number:
            bapi_params["HEADERDATA"]["PLAN_NUMBER"] = plan_number

        logger.info(
            "Creating maintenance item: %s (order_type: %s, func_loc: %s).",
            item.get("description", "N/A"),
            item.get("order_type", "PM03"),
            item.get("func_loc", ""),
        )

        result = self._call_bapi(
            "BAPI_MAINTENANCEITEM_CREATE",
            bapi_params,
            dry_run=dry_run,
        )

        if result.status == RFCStatus.SUCCESS and not result.has_errors:
            result.sap_object_id = result.data.get("ITEM_NUMBER", "")

        return result

    def create_task_list(
        self,
        task_list: dict[str, Any],
        *,
        dry_run: bool = False,
    ) -> RFCResult:
        """
        Create a Task List (Maintenance Assembly) with operations in SAP PM.

        SAP Transaction: IA05 (Create General Task List) / IP11 (Task List for Maint. Plan)
        Function Module: BAPI_ALM_ORDER_MAINTAIN

        Note: SAP does not expose a single clean BAPI for task list creation in all
        versions. BAPI_ALM_ORDER_MAINTAIN is used with method TASKLIST to create task
        list headers and operations. In some implementations, direct table writes via
        custom Z-functions may be needed.

        Expected input fields (our internal model):
            list_ref, description, func_loc, system_condition, operations[]

        Each operation:
            operation_number, work_centre, control_key, short_text,
            duration_hours, unit, num_workers

        Args:
            task_list: Dict with task list fields from SAPTaskList schema.
            dry_run: If True, log the mapped payload without calling SAP.

        Returns:
            RFCResult — on success, sap_object_id contains the task list group key.
        """
        sap_header = _map_fields(task_list, TASK_LIST_FIELD_MAP)

        # Build operations table
        operations_table = []
        for op in task_list.get("operations", []):
            sap_op = _map_fields(op, OPERATION_FIELD_MAP)
            operations_table.append({
                "ACTIVITY": str(sap_op.get("ACTIVITY", "0010")).zfill(4),
                "WORK_CNTR": sap_op.get("WORK_CNTR", ""),
                "CONTROL_KEY": sap_op.get("CONTROL_KEY", "PMIN"),
                "DESCRIPTION": sap_op.get("DESCRIPTION", "")[:72],  # SAP max 72 chars
                "DURATION": sap_op.get("DURATION", 0),
                "DURATION_UNIT": sap_op.get("DURATION_UNIT", "H"),
                "NUMBER_OF_CAPACITIES": sap_op.get("NUMBER_OF_CAPACITIES", 1),
            })

        bapi_params = {
            "HEADERDATA": {
                "GROUP": sap_header.get("GROUP", ""),
                "PLANNER_GROUP_DESC": sap_header.get("PLANNER_GROUP_DESC", ""),
                "FUNC_LOC": sap_header.get("FUNC_LOC", ""),
                "SYS_COND": sap_header.get("SYS_COND", 1),
            },
            "OPERATIONS": operations_table,
        }

        logger.info(
            "Creating task list: %s (%d operations, func_loc: %s).",
            task_list.get("description", "N/A"),
            len(operations_table),
            task_list.get("func_loc", ""),
        )

        result = self._call_bapi(
            "BAPI_ALM_ORDER_MAINTAIN",
            bapi_params,
            dry_run=dry_run,
        )

        if result.status == RFCStatus.SUCCESS and not result.has_errors:
            result.sap_object_id = result.data.get("GROUP", "")

        return result

    def upload_package(
        self,
        package: dict[str, Any],
        *,
        dry_run: bool = False,
    ) -> RFCResult:
        """
        Upload a complete SAP maintenance package: plan + items + task lists.

        Orchestrates the creation sequence:
          1. Create all Task Lists (must exist before items reference them)
          2. Create Maintenance Plan (parent container)
          3. Create Maintenance Items linked to plan + task lists

        This mirrors the SAPUploadPackage schema from tools.models.schemas.

        SAP Transactions: IP01, IP04, IA05
        Function Modules: BAPI_MAINTENANCEPLAN_CREATE, BAPI_MAINTENANCEITEM_CREATE,
                          BAPI_ALM_ORDER_MAINTAIN

        Args:
            package: Dict matching SAPUploadPackage structure with keys:
                     plant_code, maintenance_plan, maintenance_items, task_lists
            dry_run: If True, log all calls without executing.

        Returns:
            RFCResult — aggregated result with all created object IDs.
        """
        plant_code = package.get("plant_code", "")
        plan_data = package.get("maintenance_plan", {})
        items_data = package.get("maintenance_items", [])
        task_lists_data = package.get("task_lists", [])

        logger.info(
            "Uploading SAP package for plant %s: 1 plan, %d items, %d task lists.",
            plant_code,
            len(items_data),
            len(task_lists_data),
        )

        created_objects: dict[str, Any] = {
            "plant_code": plant_code,
            "task_lists": [],
            "plan_number": "",
            "items": [],
        }
        all_messages: list[BAPIReturn] = []
        total_elapsed = 0.0

        # --- Step 1: Create Task Lists ---
        task_list_map: dict[str, str] = {}  # internal ref -> SAP group key
        for tl in task_lists_data:
            tl_result = self.create_task_list(tl, dry_run=dry_run)
            total_elapsed += tl_result.elapsed_ms
            all_messages.extend(tl_result.messages)

            if tl_result.has_errors:
                logger.error(
                    "Task list creation failed for %s — aborting package upload.",
                    tl.get("list_ref", "?"),
                )
                return RFCResult(
                    status=RFCStatus.ERROR,
                    data=created_objects,
                    messages=all_messages,
                    elapsed_ms=total_elapsed,
                    function_module="upload_package",
                )

            sap_group = tl_result.sap_object_id
            internal_ref = tl.get("list_ref", "")
            task_list_map[internal_ref] = sap_group
            created_objects["task_lists"].append({
                "internal_ref": internal_ref,
                "sap_group": sap_group,
            })

        # --- Step 2: Create Maintenance Plan ---
        plan_result = self.create_maintenance_plan(plan_data, dry_run=dry_run)
        total_elapsed += plan_result.elapsed_ms
        all_messages.extend(plan_result.messages)

        if plan_result.has_errors:
            logger.error("Maintenance plan creation failed — aborting package upload.")
            return RFCResult(
                status=RFCStatus.ERROR,
                data=created_objects,
                messages=all_messages,
                elapsed_ms=total_elapsed,
                function_module="upload_package",
            )

        plan_number = plan_result.sap_object_id
        created_objects["plan_number"] = plan_number

        # --- Step 3: Create Maintenance Items ---
        for mi in items_data:
            # Resolve task list reference to SAP group key
            internal_tl_ref = mi.get("task_list_ref", "")
            if internal_tl_ref in task_list_map:
                mi = {**mi, "task_list_ref": task_list_map[internal_tl_ref]}

            mi_result = self.create_maintenance_item(
                mi,
                plan_number=plan_number,
                dry_run=dry_run,
            )
            total_elapsed += mi_result.elapsed_ms
            all_messages.extend(mi_result.messages)

            if mi_result.has_errors:
                logger.error(
                    "Maintenance item creation failed for %s — continuing with remaining items.",
                    mi.get("item_ref", "?"),
                )

            created_objects["items"].append({
                "internal_ref": mi.get("item_ref", ""),
                "sap_item_number": mi_result.sap_object_id,
                "status": mi_result.status.value,
            })

        # --- Determine overall status ---
        has_any_error = any(m.is_error for m in all_messages)
        overall_status = (
            RFCStatus.DRY_RUN if dry_run or not self.can_connect
            else RFCStatus.ERROR if has_any_error
            else RFCStatus.SUCCESS
        )

        logger.info(
            "Package upload %s: plan=%s, %d task lists, %d items (%.0fms total).",
            overall_status.value,
            plan_number or "(dry_run)",
            len(task_lists_data),
            len(items_data),
            total_elapsed,
        )

        return RFCResult(
            status=overall_status,
            data=created_objects,
            messages=all_messages,
            elapsed_ms=round(total_elapsed, 2),
            function_module="upload_package",
            sap_object_id=plan_number,
        )

    def read_work_order(
        self,
        order_number: str,
        *,
        dry_run: bool = False,
    ) -> RFCResult:
        """
        Read a Work Order's full detail from SAP PM.

        SAP Transaction: IW33 (Display PM Order)
        Function Module: BAPI_ALM_ORDER_GET_DETAIL

        Args:
            order_number: SAP work order number (12 digits, e.g. "000004001234").
            dry_run: If True, log the intent without calling SAP.

        Returns:
            RFCResult — data contains order header, operations, components, etc.
        """
        # SAP expects 12-digit zero-padded order number
        padded_order = order_number.strip().zfill(12)

        bapi_params = {
            "NUMBER": padded_order,
        }

        logger.info("Reading work order %s from SAP.", padded_order)

        result = self._call_bapi(
            "BAPI_ALM_ORDER_GET_DETAIL",
            bapi_params,
            dry_run=dry_run,
            commit=False,  # Read-only, no commit needed
        )

        if result.status == RFCStatus.SUCCESS and not result.has_errors:
            result.sap_object_id = padded_order

        return result

    def list_functional_locations(
        self,
        plant: str,
        *,
        dry_run: bool = False,
    ) -> RFCResult:
        """
        List all Functional Locations for a given plant.

        SAP Transaction: IL03 (Display Functional Location) / IL06 (List)
        Function Module: BAPI_FUNCLOC_GETLIST

        Args:
            plant: SAP plant code (e.g. "1000", "BRY").
            dry_run: If True, log the intent without calling SAP.

        Returns:
            RFCResult — data["FUNCLOC_LIST"] contains the functional location table.
        """
        bapi_params = {
            "FUNCLOC_LIST_RA": [
                {"SIGN": "I", "OPTION": "CP", "LOW": f"{plant}*", "HIGH": ""},
            ],
        }

        logger.info("Listing functional locations for plant %s.", plant)

        result = self._call_bapi(
            "BAPI_FUNCLOC_GETLIST",
            bapi_params,
            dry_run=dry_run,
            commit=False,  # Read-only
        )

        return result

    def get_equipment_master(
        self,
        equipment_id: str,
        *,
        dry_run: bool = False,
    ) -> RFCResult:
        """
        Read Equipment Master record from SAP PM.

        SAP Transaction: IE03 (Display Equipment)
        Function Module: BAPI_EQUI_GETDETAIL

        Args:
            equipment_id: SAP equipment number (18 digits, e.g. "000000000010000001").
            dry_run: If True, log the intent without calling SAP.

        Returns:
            RFCResult — data contains equipment header, classification, etc.
        """
        # SAP expects 18-digit zero-padded equipment number
        padded_id = equipment_id.strip().zfill(18)

        bapi_params = {
            "EQUIPMENT": padded_id,
        }

        logger.info("Reading equipment master %s from SAP.", padded_id)

        result = self._call_bapi(
            "BAPI_EQUI_GETDETAIL",
            bapi_params,
            dry_run=dry_run,
            commit=False,  # Read-only
        )

        if result.status == RFCStatus.SUCCESS and not result.has_errors:
            result.sap_object_id = padded_id

        return result

    # ------------------------------------------------------------------
    # Pool cleanup
    # ------------------------------------------------------------------

    def close(self) -> None:
        """Close all pooled connections."""
        for conn in self._pool:
            try:
                conn.close()
            except Exception:
                pass
        self._pool.clear()
        logger.info("SAP RFC connection pool closed.")

    def __del__(self) -> None:
        self.close()

    def __repr__(self) -> str:
        status = "connected" if self.can_connect else "dry_run"
        return (
            f"<SAPRFCConnector host={self._config.ashost!r} "
            f"client={self._config.client!r} status={status}>"
        )


# ============================================================
# Module-level helpers
# ============================================================

def _extract_bapi_messages(raw_result: dict[str, Any]) -> list[BAPIReturn]:
    """
    Extract BAPIRET2 messages from RFC result.

    SAP BAPIs return messages under various keys:
    RETURN, BAPIRET2, RETURN_TAB, MESSAGES, etc.
    """
    messages: list[BAPIReturn] = []

    for key in ("RETURN", "BAPIRET2", "RETURN_TAB", "MESSAGES", "ET_RETURN"):
        value = raw_result.get(key)
        if value is None:
            continue
        if isinstance(value, dict):
            # Single return structure
            if value.get("TYPE"):
                messages.append(BAPIReturn.from_sap(value))
        elif isinstance(value, list):
            # Table of return structures
            for entry in value:
                if isinstance(entry, dict) and entry.get("TYPE"):
                    messages.append(BAPIReturn.from_sap(entry))

    return messages


def _sanitise_log(params: dict[str, Any], max_str_len: int = 200) -> dict[str, Any]:
    """
    Sanitise parameters for safe logging (truncate long strings, mask passwords).
    """
    safe = {}
    for k, v in params.items():
        if "PASSWD" in k.upper() or "PASSWORD" in k.upper():
            safe[k] = "***"
        elif isinstance(v, str) and len(v) > max_str_len:
            safe[k] = v[:max_str_len] + "..."
        elif isinstance(v, dict):
            safe[k] = _sanitise_log(v, max_str_len)
        elif isinstance(v, list) and len(v) > 10:
            safe[k] = f"[{len(v)} items]"
        else:
            safe[k] = v
    return safe
