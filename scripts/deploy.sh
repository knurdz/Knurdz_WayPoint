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

echo "Step 3: Starting database and cache services"
docker compose up -d postgres redis
sleep 5

echo "Step 4: Applying database schema migrations"
docker compose run --rm web pnpm --filter @waypoint/database db:push

echo "Step 5: Seeding initial master data"
docker compose run --rm web pnpm --filter @waypoint/database db:seed

echo "Step 6: Launching application and reverse proxy"
docker compose up -d

echo "Step 7: Validating service health"
docker compose ps

echo "Waypoint deployment completed successfully"
