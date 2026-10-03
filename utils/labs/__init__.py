"""Pipelines de dados, um pacote por lab. Para criar um lab novo:
crie `utils/labs/<nome>/` com uma função `run() -> list[Path]` e registre aqui.
"""

from collections.abc import Callable
from pathlib import Path

from utils.labs import astro_tweak

# slug do lab (mesmo nome das pastas em data/ e frontend/public/data/) -> pipeline
LABS: dict[str, Callable[[], list[Path]]] = {
    astro_tweak.SLUG: astro_tweak.run,
}
