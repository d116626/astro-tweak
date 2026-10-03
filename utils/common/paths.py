"""Caminhos do repositório. Tudo é organizado por área da física e, dentro dela, por lab:
`<pasta>/<area>/<lab>`, sempre com os mesmos ids usados no frontend (ex.: astrofisica/astro-tweak).
"""

from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
FRONTEND_PUBLIC_DATA_DIR = ROOT_DIR / "frontend" / "public" / "data"


def raw_dir(area: str, lab: str) -> Path:
    """Downloads brutos do lab (não versionados)."""
    return DATA_DIR / "raw" / area / lab


def process_dir(area: str, lab: str) -> Path:
    """Dados intermediários e processados do lab (não versionados)."""
    return DATA_DIR / "process" / area / lab


def public_dir(area: str, lab: str) -> Path:
    """JSONs finais servidos pelo site estático para o lab."""
    return FRONTEND_PUBLIC_DATA_DIR / area / lab
