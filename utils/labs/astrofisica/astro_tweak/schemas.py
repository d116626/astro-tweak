from pydantic import Field

from utils.common.schemas import CamelModel


class Planet(CamelModel):
    id: str
    name: str
    semi_major_axis_au: float = Field(gt=0)
    eccentricity: float = Field(ge=0, lt=1)
    inclination_deg: float
    longitude_ascending_node_deg: float
    longitude_perihelion_deg: float
    mean_longitude_deg: float  # época J2000
    orbital_period_days: float = Field(gt=0)
    radius_km: float = Field(gt=0)
    mass_kg: float = Field(gt=0)
    mean_temperature_c: float
    moons: int = Field(ge=0)
    rotation_period_hours: float = Field(gt=0)  # módulo; o sentido vem da inclinação axial
    axial_tilt_deg: float = Field(ge=0, le=180)


class SolarSystemDataset(CamelModel):
    sun_radius_km: float = Field(gt=0)
    sun_mass_kg: float = Field(gt=0)
    gravitational_constant: float = Field(gt=0)
    planets: list[Planet]
