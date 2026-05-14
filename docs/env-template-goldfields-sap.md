# ────────────────────────────────────────────────────────────────────
# Plantilla SAP Goldfields — pedir a Andrea + Jorge Alquinta en workshop
# Stack: AMS → OData REST → BTP Destination → Cloud Connector → SAP cliente
# ────────────────────────────────────────────────────────────────────

# Transport real (no dry_run). Cambiar a 'odata' cuando lleguen credenciales.
SAP_TRANSPORT=odata

# ── BTP Destination + Cloud Connector ──────────────────────────────
# URL del destination expuesto por SAP BTP (BTP Cockpit → Destinations).
# Ej: https://goldfields-btp.cfapps.us10.hana.ondemand.com/destinations/SAP_QAS
SAP_ODATA_BASE_URL=

# OAuth2 client credentials del named technical user creado por Goldfields IT.
# Lo entrega el equipo SAP del cliente al firmar el piloto.
SAP_ODATA_CLIENT_ID=
SAP_ODATA_CLIENT_SECRET=
SAP_ODATA_TOKEN_URL=
SAP_ODATA_SCOPE=

# ── Identificación cliente SAP ─────────────────────────────────────
SAP_TENANT=goldfields-salares-norte
SAP_SYSTEM=QAS                 # QAS para piloto, PRD cuando aprueben
SAP_CLIENT_MANDT=200           # mandante SAP — preguntar a Goldfields

# ── IP whitelist (que IT Goldfields nos agregue) ───────────────────
# VPS IP saliente de mageam.com:
SAP_OUTBOUND_IP=
# Whitelist por parte del cliente debe permitir esta IP hacia su BTP gateway.

# ── Plantas/Werks habilitadas (limitar scope piloto) ───────────────
# CSV. Ej: SN01,SN02 (Salares Norte)
SAP_ALLOWED_WERKS=

# ── Read-only mode (piloto fase 2) ─────────────────────────────────
# true = solo GET (BAPI_EQUI_GETLIST, BAPI_ALM_NOTIF_GET_LIST).
# false = permite POST/PUT (crear avisos Z1, OTs PM01/PM03 vía OData).
SAP_READ_ONLY=true

# ── Logging audit ──────────────────────────────────────────────────
# Cada llamada SAP debe quedar logueada con user + payload + response.
SAP_AUDIT_LOG=true
