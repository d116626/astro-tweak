"""Orquestrador do pipeline de dados.

    uv run python -m utils.pipeline              # todos os labs
    uv run python -m utils.pipeline astro-tweak  # só um lab

Fluxo de cada lab: fetch -> data/raw/<lab> -> process -> data/process/<lab> -> frontend/public/data/<lab>
"""

import sys

from utils.labs import LABS


def main(selected: list[str]) -> None:
    unknown = [slug for slug in selected if slug not in LABS]
    if unknown:
        raise SystemExit(f"Lab desconhecido: {', '.join(unknown)}. Disponíveis: {', '.join(LABS)}")
    for slug in selected or list(LABS):
        for path in LABS[slug]():
            print(f"[{slug}] exportado: {path}")


if __name__ == "__main__":
    main(sys.argv[1:])
