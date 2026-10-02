"""Schemas pydantic para validar os dados antes de exportar.
O JSON exportado usa camelCase (consumido pelo TypeScript).
"""

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class MoonConstants(CamelModel):
    moon_distance_km: float = Field(gt=0)
    moon_radius_km: float = Field(gt=0)
    moon_eccentricity: float = Field(ge=0, lt=1)
    earth_radius_km: float = Field(gt=0)
    sun_radius_km: float = Field(gt=0)
    sun_distance_km: float = Field(gt=0)
    mu_earth_moon: float = Field(gt=0)
    year_days: float = Field(gt=0)
    solar_tide_ratio: float = Field(ge=0)


class MoonDerived(CamelModel):
    roche_limit_km: float = Field(gt=0)
    geostationary_km: float = Field(gt=0)
    moon_angular_diameter_deg: float = Field(gt=0)
    sun_angular_diameter_deg: float = Field(gt=0)


class Anchor(CamelModel):
    id: str
    label: str
    distance_ratio: float = Field(gt=0)


class MoonDataset(CamelModel):
    constants: MoonConstants
    derived: MoonDerived
    anchors: list[Anchor]
