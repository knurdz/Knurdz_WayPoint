.PHONY: test lint run clean

test:
	.venv/bin/pytest tests/

lint:
	.venv/bin/python -m py_compile main.py

run:
	.venv/bin/uvicorn main:app --port 8000 --reload

clean:
	rm -rf .pytest_cache __pycache__ tests/__pycache__ rules/__pycache__ services/__pycache__
