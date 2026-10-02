"""Cenário Lua: constantes e valores derivados exportados para o frontend.
As fórmulas dependentes do slider ficam no TypeScript (frontend/scenarios/moon).
"""

import json
import math
from pathlib import Path

from utils.constants import FRONTEND_PUBLIC_DATA_DIR, MAX_PUBLIC_JSON_BYTES, PROCESS_DIR
from utils.physics import constants as c
from utils.schemas import Anchor, MoonConstants, MoonDataset, MoonDerived


def angular_diameter_deg(radius_km: float, distance_km: float) -> float:
    return math.degrees(2 * math.atan(radius_km / distance_km))


def roche_limit_km() -> float:
    return c.ROCHE_FLUID_COEFF * c.EARTH_RADIUS_KM * (c.EARTH_DENSITY / c.MOON_DENSITY) ** (1 / 3)


def geostationary_km() -> float:
    return (c.EARTH_GM * (c.SIDEREAL_DAY_S / (2 * math.pi)) ** 2) ** (1 / 3)


def build_moon_dataset() -> MoonDataset:
    roche = roche_limit_km()
    geo = geostationary_km()
    return MoonDataset(
        constants=MoonConstants(
            moon_distance_km=c.MOON_DISTANCE_KM,
            moon_radius_km=c.MOON_RADIUS_KM,
            moon_eccentricity=c.MOON_ECCENTRICITY,
            earth_radius_km=c.EARTH_RADIUS_KM,
            sun_radius_km=c.SUN_RADIUS_KM,
            sun_distance_km=c.SUN_DISTANCE_KM,
            mu_earth_moon=c.EARTH_GM + c.MOON_GM,
            year_days=c.YEAR_DAYS,
            solar_tide_ratio=c.SOLAR_TIDE_RATIO,
        ),
        derived=MoonDerived(
            roche_limit_km=roche,
            geostationary_km=geo,
            moon_angular_diameter_deg=angular_diameter_deg(c.MOON_RADIUS_KM, c.MOON_DISTANCE_KM),
            sun_angular_diameter_deg=angular_diameter_deg(c.SUN_RADIUS_KM, c.SUN_DISTANCE_KM),
        ),
        anchors=[
            Anchor(id="roche", label="Limite de Roche", distance_ratio=roche / c.MOON_DISTANCE_KM),
            Anchor(id="geostationary", label="Órbita geoestacionária", distance_ratio=geo / c.MOON_DISTANCE_KM),
            Anchor(id="today", label="Hoje", distance_ratio=1.0),
        ],
    )


def export_moon_dataset() -> Path:
    """Valida e exporta para data/process e frontend/public/data."""
    payload = build_moon_dataset().model_dump_json(by_alias=True, indent=2)
    (PROCESS_DIR / "moon.json").write_text(payload, encoding="utf-8")
    out = FRONTEND_PUBLIC_DATA_DIR / "moon.json"
    out.write_text(payload, encoding="utf-8")
    if out.stat().st_size > MAX_PUBLIC_JSON_BYTES:
        raise ValueError(f"{out} excede {MAX_PUBLIC_JSON_BYTES} bytes")
    return out
