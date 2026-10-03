FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for build and curl healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged service user for container execution
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser

COPY packages/allocation/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY packages/allocation ./
RUN chown -R appuser:appgroup /app

USER appuser

ENV PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
