import os
from pathlib import Path
from sqlmodel import Session, create_engine
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

DATABASE_URL: str = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL)


def get_db():
    with Session(engine) as session:
        yield session
