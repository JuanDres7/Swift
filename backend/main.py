from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers import clientes, categorias, productos, pedidos, envios, reportes, auth
from auth import verificar_token

app = FastAPI(
    title="Swift API",
    description="API de gestión de pedidos para tienda de tecnología",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    # Permite cualquier puerto de localhost/127.0.0.1 (Vite puede usar 5173, 5174, etc.)
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas públicas
app.include_router(auth.router)

# Rutas protegidas: requieren JWT válido
protegido = [Depends(verificar_token)]
app.include_router(clientes.router, dependencies=protegido)
app.include_router(categorias.router, dependencies=protegido)
app.include_router(productos.router, dependencies=protegido)
app.include_router(pedidos.router, dependencies=protegido)
app.include_router(envios.router, dependencies=protegido)
app.include_router(reportes.router, dependencies=protegido)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "Swift API"}
