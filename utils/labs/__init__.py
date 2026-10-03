"""Pipelines de dados, organizados como `utils/labs/<area>/<lab>/`.

Para criar um lab novo: crie o pacote `utils/labs/<area>/<lab>/` (nomes Python com `_`) com
`AREA`, `SLUG` e `run() -> list[Path]`, e registre abaixo. O id do lab é `<area>/<slug>`, o mesmo
usado nas pastas de `data/` e `frontend/public/data/` e nas rotas do frontend.
"""

from collections.abc import Callable
from pathlib import Path
from types import ModuleType

from utils.labs.astrofisica import astro_tweak


def _entry(lab: ModuleType) -> tuple[str, Callable[[], list[Path]]]:
    return f"{lab.AREA}/{lab.SLUG}", lab.run


# id do lab ("<area>/<slug>") -> pipeline
LABS: dict[str, Callable[[], list[Path]]] = dict(
    [
        _entry(astro_tweak),
    ]
)
