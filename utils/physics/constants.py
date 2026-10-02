"""Fonte única das constantes físicas (NASA Planetary Fact Sheet e afins).
Distâncias em km, densidades em kg/m³, GM em km³/s², tempos em dias/segundos.
"""

# Terra
EARTH_RADIUS_KM = 6_371.0
EARTH_DENSITY = 5_514.0
EARTH_GM = 3.986004e5
SIDEREAL_DAY_S = 86_164.1
YEAR_DAYS = 365.256

# Lua
MOON_DISTANCE_KM = 384_400.0
MOON_RADIUS_KM = 1_737.4
MOON_DENSITY = 3_344.0
MOON_GM = 4.9028e3
MOON_ECCENTRICITY = 0.0549

# Sol
SUN_RADIUS_KM = 695_700.0
SUN_DISTANCE_KM = 149_597_870.0

# Maré solar relativa à lunar de hoje (~0,46)
SOLAR_TIDE_RATIO = 0.46

# Coeficiente do limite de Roche para corpo fluido
ROCHE_FLUID_COEFF = 2.44
