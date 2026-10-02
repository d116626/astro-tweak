from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT_DIR / "data" / "raw"
PROCESS_DIR = ROOT_DIR / "data" / "process"
FRONTEND_PUBLIC_DATA_DIR = ROOT_DIR / "frontend" / "public" / "data"

# Sites estáticos no GitHub Pages: manter JSONs finais pequenos.
MAX_PUBLIC_JSON_BYTES = 1_000_000
