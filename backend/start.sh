#!/bin/bash

# Load environment variables from parent directory
if [ -f "../.env" ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Start uvicorn with environment variables
uv run uvicorn src.api.main:app --reload --host "${API_HOST:-0.0.0.0}" --port "${API_PORT:-8000}"
