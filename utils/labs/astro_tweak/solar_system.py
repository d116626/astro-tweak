"""Sistema solar: elementos orbitais e propriedades físicas dos planetas.

Fontes: elementos keplerianos aproximados do JPL (Solar System Dynamics,
"Keplerian Elements for Approximate Positions of the Major Planets", 1800-2050)
e NASA Planetary Fact Sheet. A Terra usa os elementos do baricentro Terra-Lua.
"""

from pathlib import Path

from utils.common.export import export_dataset
from utils.labs.astro_tweak import constants as c
from utils.labs.astro_tweak.schemas import Planet, SolarSystemDataset

# id, nome, a (UA), e, I (°), Ω (°), ϖ (°), L (°), período (d), raio (km), massa (kg), rotação (h), obliquidade (°), temperatura média (°C), luas conhecidas
_PLANETS: list[tuple[str, str, float, float, float, float, float, float, float, float, float, float, float, float, int]] = [
    ("mercury", "Mercúrio", 0.38709927, 0.20563593, 7.00497902, 48.33076593, 77.45779628, 252.25032350, 87.969, 2439.7, 3.3011e23, 1407.6, 0.034, 167, 0),
    ("venus", "Vênus", 0.72333566, 0.00677672, 3.39467605, 76.67984255, 131.60246718, 181.97909950, 224.701, 6051.8, 4.8675e24, 5832.5, 177.36, 464, 0),
    ("earth", "Terra", 1.00000261, 0.01671123, 0.0, 0.0, 102.93768193, 100.46457166, 365.256, c.EARTH_RADIUS_KM, 5.9722e24, 23.9345, 23.44, 15, 1),
    ("mars", "Marte", 1.52371034, 0.09339410, 1.84969142, 49.55953891, -23.94362959, -4.55343205, 686.980, 3389.5, 6.4171e23, 24.6229, 25.19, -65, 2),
    ("jupiter", "Júpiter", 5.20288700, 0.04838624, 1.30439695, 100.47390909, 14.72847983, 34.39644051, 4332.589, 69911.0, 1.8982e27, 9.925, 3.13, -110, 95),
    ("saturn", "Saturno", 9.53667594, 0.05386179, 2.48599187, 113.66242448, 92.59887831, 49.95424423, 10759.22, 58232.0, 5.6834e26, 10.656, 26.73, -140, 146),
    ("uranus", "Urano", 19.18916464, 0.04725744, 0.77263783, 74.01692503, 170.95427630, 313.23810451, 30685.4, 25362.0, 8.6810e25, 17.24, 97.77, -195, 28),
    ("neptune", "Netuno", 30.06992276, 0.00859048, 1.77004347, 131.78422574, 44.96476227, -55.12002969, 60189.0, 24622.0, 1.02413e26, 16.11, 28.32, -200, 16),
]


def build_solar_system_dataset() -> SolarSystemDataset:
    return SolarSystemDataset(
        sun_radius_km=c.SUN_RADIUS_KM,
        sun_mass_kg=c.SUN_MASS_KG,
        gravitational_constant=c.GRAVITATIONAL_CONSTANT,
        planets=[
            Planet(
                id=id_,
                name=name,
                semi_major_axis_au=a,
                eccentricity=e,
                inclination_deg=inc,
                longitude_ascending_node_deg=node,
                longitude_perihelion_deg=peri,
                mean_longitude_deg=lon,
                orbital_period_days=period,
                radius_km=radius,
                mass_kg=mass,
                mean_temperature_c=temp,
                moons=moons,
                rotation_period_hours=rotation,
                axial_tilt_deg=tilt,
            )
            for id_, name, a, e, inc, node, peri, lon, period, radius, mass, rotation, tilt, temp, moons in _PLANETS
        ],
    )


def export_solar_system_dataset(lab: str) -> Path:
    return export_dataset(lab, "solar-system.json", build_solar_system_dataset())
