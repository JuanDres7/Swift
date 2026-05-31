from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import SQLModel

from auth import verificar_credenciales, crear_token, verificar_token

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(SQLModel):
    username: str
    password: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(datos: LoginRequest):
    if not verificar_credenciales(datos.username, datos.password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    return TokenResponse(access_token=crear_token(datos.username))


@router.get("/me")
def usuario_actual(usuario: str = Depends(verificar_token)):
    return {"usuario": usuario}
