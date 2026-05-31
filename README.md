# Swift

Aplicación web de gestión de pedidos para una tienda de tecnología (backend FastAPI + frontend React).

## Requisitos previos

- **Python 3.11+**
- **Node.js 18+** (incluye npm)
- Una cuenta y un proyecto en **Supabase**

## 1. Clonar el repositorio

```bash
git clone <URL-DEL-REPOSITORIO>
cd Swift
```

## 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Aplica las migraciones de `supabase/migrations/` para crear la base de datos:

   **Opción A — Supabase CLI:**
   ```bash
   supabase link --project-ref <TU-PROJECT-REF>
   supabase db push
   ```

   **Opción B — SQL Editor (manual):** abre el **SQL Editor** de tu proyecto y ejecuta el contenido de cada archivo de `supabase/migrations/` en orden cronológico (por la fecha del nombre).

3. Anota tus credenciales desde **Project Settings → API** y **Project Settings → Database** (las necesitarás en el siguiente paso).

## 3. Backend (FastAPI)

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1     # Windows (PowerShell)
# source .venv/bin/activate      # macOS / Linux

# Instalar dependencias
pip install -r requirements.txt
```

Crea el archivo `backend/.env` (puedes copiar `backend/.env.example`) con tus credenciales:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key
DATABASE_URL=postgresql://...

# Autenticación (admin único)
JWT_SECRET=una_cadena_secreta_larga_y_aleatoria
ADMIN_USERNAME=admin
ADMIN_PASSWORD=la_contraseña_que_quieras
```

> ⚠️ El `.env` contiene secretos: no lo subas al repositorio.

Levanta el servidor:

```bash
uvicorn main:app --reload
```

- API: **http://127.0.0.1:8000**
- Documentación (Swagger): **http://127.0.0.1:8000/docs**

> En Windows, si PowerShell bloquea la activación del entorno virtual, ejecuta una vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

## 4. Frontend (React + Vite)

En **otra terminal**, desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

- App: **http://localhost:5173** (Vite indicará el puerto exacto).

> El frontend apunta al backend en `http://localhost:8000` (configurado en `src/services/api.js`). Si cambias el host o puerto del backend, actualiza ese archivo.

## 5. Iniciar sesión

Abre la app en el navegador e inicia sesión con el `ADMIN_USERNAME` y `ADMIN_PASSWORD` que definiste en el `.env` del backend.
</content>
