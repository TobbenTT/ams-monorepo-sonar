"""Auth router — registration, login, token refresh, user management."""

import os
import time
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from api.database.connection import get_db
from api.database.models import UserModel
from api.schemas import UserRegister, UserLogin, PasswordChange, UserRoleUpdate, RefreshRequest, UserProfileUpdate, AdminUserUpdate
from api.services import auth_service
from api.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# Auditoría 2026-04-22 — rate limit estricto por IP para /auth/login.
# In-memory: 10 intentos / 60s por IP (complementa brute-force por usuario en auth_service).
_LOGIN_IP_ATTEMPTS: dict[str, list[float]] = {}
_LOGIN_IP_WINDOW = 60.0   # seconds
_LOGIN_IP_MAX = 10

def _check_ip_throttle(ip: str) -> None:
    now = time.time()
    attempts = _LOGIN_IP_ATTEMPTS.setdefault(ip, [])
    attempts[:] = [t for t in attempts if now - t < _LOGIN_IP_WINDOW]
    if len(attempts) >= _LOGIN_IP_MAX:
        logger.warning("Login rate limit por IP disparado: %s (%d attempts)", ip, len(attempts))
        raise HTTPException(status_code=429, detail="Demasiados intentos. Esperá un minuto e intentá de nuevo.")
    attempts.append(now)


def _user_to_dict(u: UserModel) -> dict:
    return {
        "user_id": u.user_id,
        "email": u.email,
        "username": u.username,
        "full_name": u.full_name,
        "role": u.role,
        "plant_id": u.plant_id,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "last_login": u.last_login.isoformat() if u.last_login else None,
    }


@router.post("/login")
def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    from fastapi.responses import JSONResponse as JR
    # Rate limit por IP antes de tocar la BD (mitigación DoS / brute-force)
    client_ip = (request.client.host if request.client else "unknown")
    _check_ip_throttle(client_ip)
    user = auth_service.authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Auditoría 2026-04-22 — MFA obligatorio para admins/managers cuando
    # MFA_ENFORCED=1 en el entorno (off por default para no romper dev).
    ENFORCED_MFA_ROLES = {"admin", "manager"}
    mfa_enforced = os.environ.get("MFA_ENFORCED", "0") == "1"
    mfa_required = bool(getattr(user, "mfa_secret", None))
    if mfa_enforced and user.role in ENFORCED_MFA_ROLES and not mfa_required:
        logger.warning("Login blocked: user=%s role=%s needs MFA enrollment", user.user_id, user.role)
        raise HTTPException(
            status_code=403,
            detail="MFA enrollment required for admin/manager roles. Enrolá vía /mfa/setup antes de iniciar sesión.",
        )
    access = auth_service.create_access_token({"sub": user.user_id, "role": user.role})
    refresh = auth_service.create_refresh_token({"sub": user.user_id, "role": user.role})
    # Auditoría 2026-04-22 — registrar logins exitosos (IP + user-agent)
    try:
        from api.services.audit_service import log_action
        log_action(db, "user", user.user_id, "LOGIN", payload={
            "ip": client_ip,
            "user_agent": request.headers.get("user-agent", "")[:200],
            "role": user.role,
        }, user=user.user_id)
        db.commit()
    except Exception as _e:
        logger.warning("audit log_action failed on login: %s", _e)
    response_data = {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": _user_to_dict(user),
        "mfa_required": mfa_required,
    }
    response = JR(content=response_data)
    # Also set HTTP-only cookies for enhanced security
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="lax", max_age=3600)
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="lax", max_age=86400 * 7)
    return response


@router.post("/refresh")
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = auth_service.decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token invalido")
    user = auth_service.get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    new_access = auth_service.create_access_token({"sub": user.user_id, "role": user.role})
    new_refresh = auth_service.create_refresh_token({"sub": user.user_id, "role": user.role})
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }


@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db), user: UserModel = Depends(require_role("admin"))):
    try:
        new_user = auth_service.register_user(
            db, data.email, data.username, data.password,
            data.full_name, data.role, data.plant_id,
        )
        # Also create workforce entry so user appears in Scheduling
        from api.database.models import WorkforceModel
        existing_wf = db.query(WorkforceModel).filter(WorkforceModel.worker_id == new_user.user_id).first()
        if not existing_wf:
            role_specialty = {"tecnico": "Mechanical", "planner": "Planning", "manager": "Supervision", "admin": "Administration"}
            db.add(WorkforceModel(
                worker_id=new_user.user_id,
                name=new_user.full_name or new_user.username,
                specialty=role_specialty.get(new_user.role, "General"),
                shift="MORNING",
                plant_id=new_user.plant_id or "",
                available=True,
            ))
            db.commit()
        return _user_to_dict(new_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
def get_me(user: UserModel = Depends(get_current_user)):
    return _user_to_dict(user)


@router.put("/me")
def update_profile(data: UserProfileUpdate, user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        updated = auth_service.update_profile(db, user.user_id, data.full_name, data.email)
        return _user_to_dict(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/change-password")
def change_password(data: PasswordChange, user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    success = auth_service.change_password(db, user.user_id, data.current_password, data.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Contrasena actual incorrecta")
    return {"status": "Password actualizado"}


@router.get("/users")
def list_users(role: str | None = None, plant_id: str | None = None, db: Session = Depends(get_db), user: UserModel = Depends(require_role("admin"))):
    q = db.query(UserModel).filter(UserModel.is_active == True)
    if role:
        q = q.filter(UserModel.role == role)
    if plant_id:
        q = q.filter(UserModel.plant_id == plant_id)
    users = q.all()
    return [_user_to_dict(u) for u in users]


@router.put("/users/{user_id}")
def admin_update_user(user_id: str, data: AdminUserUpdate, db: Session = Depends(get_db), user: UserModel = Depends(require_role("admin", "manager"))):
    target = db.query(UserModel).filter(UserModel.user_id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if data.username is not None:
        target.username = data.username
    if data.full_name is not None:
        target.full_name = data.full_name
    if data.email is not None:
        target.email = data.email
    if data.plant_id is not None:
        target.plant_id = data.plant_id
    if data.role is not None:
        target.role = data.role
    db.commit()
    db.refresh(target)
    return _user_to_dict(target)


@router.put("/users/{user_id}/role")
def update_role(user_id: str, data: UserRoleUpdate, db: Session = Depends(get_db), user: UserModel = Depends(require_role("admin"))):
    try:
        updated = auth_service.update_user_role(db, user_id, data.role)
        return _user_to_dict(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/users/{user_id}/deactivate")
def deactivate_user(user_id: str, db: Session = Depends(get_db), user: UserModel = Depends(require_role("admin"))):
    try:
        updated = auth_service.deactivate_user(db, user_id)
        return _user_to_dict(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/users/{user_id}/activate")
def activate_user(user_id: str, db: Session = Depends(get_db), user: UserModel = Depends(require_role("admin"))):
    try:
        updated = auth_service.activate_user(db, user_id)
        return _user_to_dict(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
