# Fuzzy Logic Controller Backend

Educational demonstration backend for fuzzy logic control systems.

## Features
- Mamdani fuzzy inference engine
- Max-Min composition method
- Center of Gravity defuzzification
- Washing machine control example

## Setup

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Run development server
uv run uvicorn src.api.main:app --reload --port 8000
```

## API Endpoints

- `GET /` - API documentation
- `POST /fuzzy/washing-machine` - Calculate washing time based on dirt and grease levels
- `GET /fuzzy/membership-functions` - Get membership function definitions
