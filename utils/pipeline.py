"""Orquestrador do pipeline de dados:
fetch -> data/raw -> process -> data/process -> export -> frontend/public/data
"""

from utils.constants import FRONTEND_PUBLIC_DATA_DIR, PROCESS_DIR, RAW_DIR
from utils.physics.solar_system import export_solar_system_dataset


def main() -> None:
    for directory in (RAW_DIR, PROCESS_DIR, FRONTEND_PUBLIC_DATA_DIR):
        directory.mkdir(parents=True, exist_ok=True)
    print(f"Exportado: {export_solar_system_dataset()}")


if __name__ == "__main__":
    main()
