"""
FastAPI application for fuzzy logic controller.
Provides REST API for educational fuzzy logic demonstrations.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List
import numpy as np
import os
from pathlib import Path
from dotenv import load_dotenv

from ..fuzzy import create_washing_machine_engine, create_washing_machine_variables

# Load .env from project root
project_root = Path(__file__).parent.parent.parent.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)


app = FastAPI(
    title="Fuzzy Logic Controller API",
    description="Educational API for fuzzy logic control demonstrations",
    version="0.1.0",
    root_path="/api"
)

# Enable CORS for frontend
import json
cors_origins = json.loads(os.getenv("CORS_ORIGINS", '["*"]'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize fuzzy engine
fuzzy_engine = create_washing_machine_engine()


class WashingMachineInput(BaseModel):
    """Input model for washing machine controller."""
    dirt_level: float = Field(..., ge=0, le=200, description="Dirt level (0-200)")
    grease_level: float = Field(..., ge=0, le=200, description="Grease level (0-200)")


class WashingMachineOutput(BaseModel):
    """Output model for washing machine controller."""
    wash_time: float = Field(..., description="Washing time in minutes")
    fuzzified_inputs: Dict[str, Dict[str, float]]
    rule_activations: List[Dict]
    aggregated_output: Dict[str, Dict[str, float]]


@app.get("/")
async def root():
    """API root endpoint."""
    return {
        "message": "Fuzzy Logic Controller API",
        "version": "0.1.0",
        "endpoints": {
            "POST /fuzzy/washing-machine": "Calculate washing time",
            "GET /fuzzy/membership-functions": "Get membership function definitions",
            "GET /fuzzy/rules": "Get fuzzy rule base",
            "POST /fuzzy/visualize": "Get visualization data"
        }
    }


@app.post("/fuzzy/washing-machine", response_model=WashingMachineOutput)
async def calculate_washing_time(input_data: WashingMachineInput):
    """
    Calculate washing time using fuzzy logic controller.

    Args:
        input_data: Dirt and grease levels

    Returns:
        Fuzzy inference results including wash time
    """
    result = fuzzy_engine.infer({
        "dirt": input_data.dirt_level,
        "grease": input_data.grease_level
    })

    return WashingMachineOutput(
        wash_time=result["output"]["wash_time"],
        fuzzified_inputs=result["fuzzified_inputs"],
        rule_activations=result["rule_activations"],
        aggregated_output=result["aggregated_output"]
    )


@app.get("/fuzzy/membership-functions")
async def get_membership_functions():
    """
    Get all membership function definitions.

    Returns:
        Dictionary of fuzzy variables with their membership functions
    """
    dirt, grease, wash_time = create_washing_machine_variables()

    return {
        "inputs": {
            "dirt": dirt.to_dict(),
            "grease": grease.to_dict()
        },
        "outputs": {
            "wash_time": wash_time.to_dict()
        }
    }


@app.get("/fuzzy/rules")
async def get_fuzzy_rules():
    """
    Get the fuzzy rule base.

    Returns:
        List of fuzzy rules in readable format
    """
    return {
        "rules": [str(rule) for rule in fuzzy_engine.rules],
        "count": len(fuzzy_engine.rules)
    }


class VisualizationInput(BaseModel):
    """Input for visualization data request."""
    dirt_level: float = Field(..., ge=0, le=200)
    grease_level: float = Field(..., ge=0, le=200)
    num_points: int = Field(default=200, ge=50, le=500)


@app.post("/fuzzy/visualize")
async def get_visualization_data(input_data: VisualizationInput):
    """
    Get detailed visualization data for the fuzzy inference process.

    Args:
        input_data: Input values and visualization parameters

    Returns:
        Complete data for visualizing membership functions and inference
    """
    # Perform inference
    result = fuzzy_engine.infer({
        "dirt": input_data.dirt_level,
        "grease": input_data.grease_level
    })

    # Get membership function curves
    dirt, grease, wash_time = create_washing_machine_variables()

    dirt_x = np.linspace(0, 200, input_data.num_points)
    grease_x = np.linspace(0, 200, input_data.num_points)
    wash_time_x = np.linspace(0, 60, input_data.num_points)

    # Get aggregated output curve
    agg_x, agg_y = fuzzy_engine.get_aggregated_output_curve(
        "wash_time",
        result["aggregated_output"]["wash_time"],
        input_data.num_points
    )

    return {
        "inference_result": result,
        "membership_curves": {
            "dirt": {
                "x_values": dirt_x.tolist(),
                "curves": {
                    name: [mf.membership(x) for x in dirt_x]
                    for name, mf in dirt.membership_functions.items()
                }
            },
            "grease": {
                "x_values": grease_x.tolist(),
                "curves": {
                    name: [mf.membership(x) for x in grease_x]
                    for name, mf in grease.membership_functions.items()
                }
            },
            "wash_time": {
                "x_values": wash_time_x.tolist(),
                "curves": {
                    name: [mf.membership(x) for x in wash_time_x]
                    for name, mf in wash_time.membership_functions.items()
                }
            }
        },
        "aggregated_output": {
            "x_values": agg_x.tolist(),
            "y_values": agg_y.tolist(),
            "centroid": result["output"]["wash_time"]
        }
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("API_RELOAD", "true").lower() == "true"
    uvicorn.run(app, host=host, port=port, reload=reload)
