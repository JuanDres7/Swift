import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env", override=True)

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
# Prefiere la service_role key (solo servidor, bypassa RLS). Cae a anon si no existe.
SUPABASE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
if not SUPABASE_KEY:
    raise RuntimeError("Define SUPABASE_SERVICE_KEY (recomendado) o SUPABASE_ANON_KEY en backend/.env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
