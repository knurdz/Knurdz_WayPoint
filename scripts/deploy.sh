#!/bin/bash
set -e

echo "Starting Waypoint Intelligent Enterprise production deployment"

echo "Step 1: Validating environment configuration"
if [ ! -f .env ]; then
  echo "Generating .env from template"
  cp .env.example .env
fi

echo "Step 2: Building container images"
docker compose build --no-cache

echo "Step 3: Starting all services"
docker compose up -d

echo "Step 4: Validating service health"
docker compose ps

echo "Waypoint deployment completed successfully"

