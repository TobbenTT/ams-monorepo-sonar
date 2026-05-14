"""Auth service — user CRUD, password hashing, JWT token management."""

import logging
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_
import bcrypt
import jwt
from jwt.exceptions import PyJWTError as JWTError

from api.config import settings
from api.database.models import UserModel

logger = logging.getLogger(__name__)

VALID_ROLES = {"admin", "manager", "planner", "tecnico"}

# Brute-force protection: {username: [(timestamp, failed), ...]}
_login_attempts: dict[str, list[float]] = {}
_LOCKOUT_WINDOW = 300  # 5 minutes
_MAX_FAILED_ATTEMPTS = 5


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def register_user(
    db: Session,
    email: str,
    username: str,
    password: str,
    full_name: str = "",
    role: str = "tecnico",
    plant_id: str | None = None,
) -> UserModel:
    if role not in VALID_ROLES:
        raise ValueError(f"Rol invalido: {role}. Roles permitidos: {', '.join(VALID_ROLES)}")

    existing = db.query(UserModel).filter(
        or_(UserModel.email == email, UserModel.username == username)
    ).first()
    if existing:
        raise ValueError("Email o username ya existe")

    user = UserModel(
        email=email,
        username=username,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=role,
        plant_id=plant_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _check_lockout(username: str) -> bool:
    """Return True if username is locked out due to too many failed attempts."""
    now = time.time()
    if username in _login_attempts:
        _login_attempts[username] = [t for t in _login_attempts[username] if now - t < _LOCKOUT_WINDOW]
        if len(_login_attempts[username]) >= _MAX_FAILED_ATTEMPTS:
            return True
    return False


def _record_failed_attempt(username: str) -> None:
    """Record a failed login attempt."""
    if username not in _login_attempts:
        _login_attempts[username] = []
    _login_attempts[username].append(time.time())
    logger.warning("Failed login attempt for '%s' (%d/%d)", username, len(_login_attempts[username]), _MAX_FAILED_ATTEMPTS)


def _clear_attempts(username: str) -> None:
    """Clear failed attempts on successful login."""
    _login_attempts.pop(username, None)


def authenticate_user(db: Session, username: str, password: str) -> UserModel | None:
    if _check_lockout(username):
        logger.warning("Login locked out for '%s' — too many failed attempts", username)
        return None
    user = db.query(UserModel).filter(
        or_(UserModel.username == username, UserModel.email == username)
    ).first()
    if not user or not user.is_active:
        # Constant-time: always run bcrypt to prevent timing-based user enumeration
        _dummy_hash = "$2b$12$LJ3m4ys3Lz0Y1r3XkRjv7eUuPOBEuoH7V3IjL.8lhHhVxH9mKJTy"
        verify_password(password, _dummy_hash)
        _record_failed_attempt(username)
        return None
    if not verify_password(password, user.hashed_password):
        _record_failed_attempt(username)
        return None
    _clear_attempts(username)
    user.last_login = datetime.now()
    db.commit()
    return user


def get_user_by_id(db: Session, user_id: str) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.user_id == user_id).first()


def list_users(db: Session, role: str | None = None) -> list[UserModel]:
    q = db.query(UserModel)
    if role:
        q = q.filter(UserModel.role == role)
    return q.order_by(UserModel.created_at.desc()).all()


def update_user_role(db: Session, user_id: str, new_role: str) -> UserModel:
    if new_role not in VALID_ROLES:
        raise ValueError(f"Rol invalido: {new_role}")
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("Usuario no encontrado")
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user_id: str, current_password: str, new_password: str) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    if not verify_password(current_password, user.hashed_password):
        return False
    user.hashed_password = hash_password(new_password)
    db.commit()
    return True


def update_profile(db: Session, user_id: str, full_name: str | None = None, email: str | None = None) -> UserModel:
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("Usuario no encontrado")
    if full_name is not None:
        user.full_name = full_name
    if email is not None:
        existing = db.query(UserModel).filter(UserModel.email == email, UserModel.user_id != user_id).first()
        if existing:
            raise ValueError("Email ya esta en uso por otro usuario")
        user.email = email
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: str) -> UserModel:
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("Usuario no encontrado")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user_id: str) -> UserModel:
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("Usuario no encontrado")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
