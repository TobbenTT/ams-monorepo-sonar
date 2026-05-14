"""Planificador Agent endpoints — Excel Jorge r30."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.dependencies.auth import get_current_user
from api.database.connection import get_db
from api.services import planificador_agent_service as svc

router = APIRouter(prefix="/planificador-agent", tags=["planificador-agent"])


class AnalyzeWORequest(BaseModel):
    wo_id: str
    use_claude: bool = True


@router.post("/analyze-wo")
def analyze_wo(body: AnalyzeWORequest, _user=Depends(get_current_user), db: Session = Depends(get_db)):
    """r30 #2/#4/#5/#6/#7 — análisis pre-liberación: presupuesto, materiales, riesgo, SAP PM."""
    return svc.analyze_pre_release(db, body.wo_id, body.use_claude)
