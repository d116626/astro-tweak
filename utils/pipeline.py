"""Orquestrador do pipeline de dados.

    uv run python -m utils.pipeline                           # todos os labs
    uv run python -m utils.pipeline astrofisica               # todos os labs de uma área
    uv run python -m utils.pipeline astrofisica/astro-tweak   # só um lab

Fluxo de cada lab: fetch -> data/raw/<area>/<lab> -> process -> data/process/<area>/<lab>
-> frontend/public/data/<area>/<lab>
"""

import sys

from utils.labs import LABS


def resolve(targets: list[str]) -> list[str]:
    """Converte áreas (`astrofisica`) e ids (`astrofisica/astro-tweak`) em ids de labs."""
    if not targets:
        return list(LABS)
    ids: list[str] = []
    for target in targets:
        matches = [lab_id for lab_id in LABS if lab_id == target or lab_id.split("/")[0] == target]
        if not matches:
            raise SystemExit(f"Alvo desconhecido: {target}. Disponíveis: {', '.join(LABS)}")
        ids.extend(m for m in matches if m not in ids)
    return ids


def main(targets: list[str]) -> None:
    for lab_id in resolve(targets):
        for path in LABS[lab_id]():
            print(f"[{lab_id}] exportado: {path}")


if __name__ == "__main__":
    main(sys.argv[1:])
