#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_VARS_DIR="$SCRIPT_DIR/../../votrix-env-vars"

cp "$ENV_VARS_DIR/user-web-app-local" apps/web/.env
cp "$ENV_VARS_DIR/user-mobile-app-local" apps/mobile/.env

echo "Done — copied .env files for web and mobile"
