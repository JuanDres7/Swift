from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import clientes, categorias, productos, pedidos, envios, reportes

app = FastAPI(
    title="Swift API",
    description="API de gestión de pedidos para tienda de tecnología",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(envios.router)
app.include_router(reportes.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "Swift API"}
