from pathlib import Path

import requests


def fetch_file_if_missing(url: str, dest: Path, timeout: int = 60) -> Path:
    """Baixa `url` para `dest` apenas se o arquivo ainda não existir (idempotente)."""
    if dest.exists():
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    dest.write_bytes(response.content)
    return dest
