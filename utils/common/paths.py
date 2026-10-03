"""Caminhos do repositório. Cada lab tem a própria pasta em data/raw, data/process e public/data."""

from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
FRONTEND_PUBLIC_DATA_DIR = ROOT_DIR / "frontend" / "public" / "data"


def raw_dir(lab: str) -> Path:
    """Downloads brutos do lab (não versionados)."""
    return DATA_DIR / "raw" / lab


def process_dir(lab: str) -> Path:
    """Dados intermediários e processados do lab (não versionados)."""
    return DATA_DIR / "process" / lab


def public_dir(lab: str) -> Path:
    """JSONs finais servidos pelo site estático para o lab."""
    return FRONTEND_PUBLIC_DATA_DIR / lab
