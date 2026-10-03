"""Lab Astro Tweak: sandbox gravitacional do sistema solar."""

from pathlib import Path

from utils.labs.astro_tweak.solar_system import export_solar_system_dataset

SLUG = "astro-tweak"


def run() -> list[Path]:
    """Gera todos os datasets do lab em frontend/public/data/astro-tweak."""
    return [export_solar_system_dataset(SLUG)]
