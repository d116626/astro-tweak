"""Lab Astro Tweak: sandbox gravitacional do sistema solar."""

from pathlib import Path

from utils.labs.astrofisica.astro_tweak.solar_system import export_solar_system_dataset

AREA = "astrofisica"
SLUG = "astro-tweak"


def run() -> list[Path]:
    """Gera todos os datasets do lab em frontend/public/data/astrofisica/astro-tweak."""
    return [export_solar_system_dataset(AREA, SLUG)]
