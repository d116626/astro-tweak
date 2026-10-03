# SciHub command runner

default:
    @just --list

# Executa o servidor local de desenvolvimento do Next.js
run-frontend:
    cd frontend && npm run dev

# Executa o pipeline de dados Python. Sem argumento roda todos os labs; ex.: `just pipeline astrofisica` ou `just pipeline astrofisica/astro-tweak`
pipeline *alvos:
    uv run python -m utils.pipeline {{alvos}}

# Sincroniza dependências do Python via uv
py-sync:
    uv sync

# Verifica tipos TypeScript no frontend
typecheck:
    cd frontend && npm run typecheck

# Executa linter no frontend
lint:
    cd frontend && npm run lint
