.PHONY: help install qa qa-fix lint test coverage docker-up docker-down docker-build

help:
	@echo "AMS — Targets disponibles:"
	@echo ""
	@echo "  make install        Instala deps + workspace packages"
	@echo "  make qa             Corre suite QA completa (ruff + pytest-cov)"
	@echo "  make qa-fix         Igual que qa pero auto-arregla lo que pueda"
	@echo "  make lint           Solo Ruff (rápido)"
	@echo "  make test           Solo pytest"
	@echo "  make coverage       Test + cobertura en HTML (htmlcov/index.html)"
	@echo ""
	@echo "  make docker-build   Build de todos los servicios"
	@echo "  make docker-up      Levanta stack split (todos los servicios)"
	@echo "  make docker-down    Detiene stack split"

install:
	pip install -e packages/tools -e packages/agents -e packages/skills
	pip install -r requirements.txt
	pip install ruff pytest-cov

qa:
	bash scripts/qa.sh

qa-fix:
	bash scripts/qa.sh --fix

lint:
	ruff check .

test:
	pytest tests/test_api/ -q

coverage:
	pytest tests/test_api/ --cov=api --cov=tools --cov-report=html --cov-report=term
	@echo "👀 Abrir htmlcov/index.html en el browser"

docker-build:
	docker compose -f docker-compose.split.yml --profile all build

docker-up:
	docker compose -f docker-compose.split.yml --profile all up -d

docker-down:
	docker compose -f docker-compose.split.yml --profile all down
