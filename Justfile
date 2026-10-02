# Astro Tweak command runner

default:
    @just --list

# Executa o servidor local de desenvolvimento do Next.js
run-frontend:
    cd frontend && npm run dev

# Executa o pipeline de dados Python (fetch -> process -> frontend/public/data)
pipeline:
    uv run python -m utils.pipeline

# Sincroniza dependências do Python via uv
py-sync:
    uv sync

# Verifica tipos TypeScript no frontend
typecheck:
    cd frontend && npm run typecheck

# Executa linter no frontend
lint:
    cd frontend && npm run lint
