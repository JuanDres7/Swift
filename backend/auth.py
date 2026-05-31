import os
import secrets
from pathlib import Path
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=True)

# ── Configuración ───────────────────────────────────────────────────────────
JWT_SECRET: str = os.environ.get("JWT_SECRET", "dev-secret-cambiar-en-produccion")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 8  # 8 horas

ADMIN_USERNAME: str = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD: str = os.environ.get("ADMIN_PASSWORD", "admin123")

# tokenUrl solo es metadata para la doc de Swagger; el login real recibe JSON.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ── Funciones ─────────────────────────────────────────────────────────────────
def verificar_credenciales(username: str, password: str) -> bool:
    """Compara credenciales contra el admin del .env (tiempo constante)."""
    user_ok = secrets.compare_digest(username, ADMIN_USERNAME)
    pass_ok = secrets.compare_digest(password, ADMIN_PASSWORD)
    return user_ok and pass_ok


def crear_token(username: str) -> str:
    """Genera un JWT firmado con expiración."""
    expira = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expira}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verificar_token(token: str = Depends(oauth2_scheme)) -> str:
    """Dependencia de FastAPI: valida el JWT y devuelve el usuario."""
    excepcion = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise excepcion
        return username
    except JWTError:
        raise excepcion
