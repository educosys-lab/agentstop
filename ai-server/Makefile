# === Basic Poetry + Uvicorn workflow ===
install:
	poetry install

start-local:
	poetry run python scripts/start.py local

format:
	poetry run black .

lint:
	poetry run flake8 .

clear-cache:
	poetry run python scripts/clear_cache.py

# freeze:
# 	poetry export --without-hashes -f requirements.txt > requirements.txt
