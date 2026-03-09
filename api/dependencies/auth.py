"""Auth dependencies — FastAPI Depends() for JWT protection & role checks."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import UserModel
from api.services.auth_service import decode_token, get_user_by_id

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> UserModel:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token invalido o expirado")
    user = get_user_by_id(db, payload["sub"])
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario no encontrado o desactivado")
    return user


def require_role(*allowed_roles: str):
    async def check_role(user: UserModel = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Rol '{user.role}' no tiene acceso. Roles permitidos: {', '.join(allowed_roles)}"
            )
        return user
    return check_role
