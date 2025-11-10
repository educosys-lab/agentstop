import json
import os
import requests
from mcp.server.fastmcp import FastMCP
from typing import Dict, Union
import urllib.parse

mcp = FastMCP("QuickChartTools")

# QuickChart base URL from environment or default
QUICKCHART_BASE_URL = os.getenv(
    "QUICKCHART_BASE_URL", "https://quickchart.io/chart")

# Supported chart types
VALID_CHART_TYPES = [
    "bar", "line", "pie", "doughnut", "radar",
    "polarArea", "scatter", "bubble", "radialGauge", "speedometer"
]


def validate_chart_type(chart_type: str) -> None:
    """Validate if the chart type is supported."""
    if chart_type not in VALID_CHART_TYPES:
        raise ValueError(
            f"Invalid chart type. Must be one of: {', '.join(VALID_CHART_TYPES)}")


@mcp.tool()
async def generate_chart(input_data: Union[str, Dict]) -> str:
    """Generate a chart URL using QuickChart.io."""
    try:
        # Handle input data (string or dict)
        if isinstance(input_data, dict):
            config = input_data
        elif isinstance(input_data, str):
            if not input_data.strip():
                return json.dumps({
                    "status": "failed",
                    "type": "text",
                    "data": "Chart configuration is required",
                    "message": "Chart configuration is required"
                })
            try:
                config = json.loads(input_data)
            except json.JSONDecodeError:
                return json.dumps({
                    "status": "failed",
                    "type": "text",
                    "data": "Invalid JSON in chart configuration",
                    "message": "Invalid JSON in chart configuration"
                })
        else:
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Input must be a JSON string or dictionary",
                "message": "Input must be a JSON string or dictionary"
            })

        # Validate required fields
        if not isinstance(config, dict) or not config.get("type") or not config.get("data", {}).get("datasets"):
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Config must include 'type' and 'data.datasets'",
                "message": "Config must include 'type' and 'data.datasets'"
            })

        # Validate chart type
        validate_chart_type(config["type"])

        # Validate datasets
        if not isinstance(config["data"]["datasets"], list) or not config["data"]["datasets"]:
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "data.datasets must be a non-empty array",
                "message": "data.datasets must be a non-empty array"
            })

        for dataset in config["data"]["datasets"]:
            if not isinstance(dataset, dict) or not dataset.get("data"):
                return json.dumps({
                    "status": "failed",
                    "type": "text",
                    "data": "Each dataset must have a 'data' property",
                    "message": "Each dataset must have a 'data' property"
                })

        # Handle special chart types
        if config["type"] in ["radialGauge", "speedometer"]:
            if not config["data"]["datasets"][0].get("data") or len(config["data"]["datasets"][0]["data"]) != 1:
                return json.dumps({
                    "status": "failed",
                    "type": "text",
                    "data": f"{config['type']} requires a single numeric value",
                    "message": f"{config['type']} requires a single numeric value"
                })

        elif config["type"] in ["scatter", "bubble"]:
            for dataset in config["data"]["datasets"]:
                for point in dataset["data"]:
                    if not isinstance(point, list) or len(point) < 2 or (config["type"] == "bubble" and len(point) < 3):
                        return json.dumps({
                            "status": "failed",
                            "type": "text",
                            "data": f"{config['type']} requires data points in [x, y{' , r' if config['type'] == 'bubble' else ''}] format",
                            "message": f"{config['type']} requires data points in [x, y{' , r' if config['type'] == 'bubble' else ''}] format"
                        })

        # Normalize config
        chart_config = {
            "type": config["type"],
            "data": {
                "labels": config["data"].get("labels", []),
                "datasets": [
                    {
                        "label": dataset.get("label", ""),
                        "data": dataset["data"],
                        "backgroundColor": dataset.get("backgroundColor"),
                        "borderColor": dataset.get("borderColor"),
                        **(dataset.get("additionalConfig", {}))
                    } for dataset in config["data"]["datasets"]
                ]
            },
            "options": {
                **config.get("options", {}),
                **({"title": {"display": True, "text": config["title"]}} if config.get("title") else {})
            }
        }

        # Generate chart URL
        encoded_config = urllib.parse.quote(json.dumps(chart_config))
        chart_url = f"{QUICKCHART_BASE_URL}?c={encoded_config}"

        # Return a response that signals completion to the agent
        return json.dumps({
            "status": "success",
            "type": "text",
            "data": chart_url,
            "message": f"Chart generated successfully: {chart_url}"
        })

    except Exception as e:
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": str(e),
            "message": f"Error generating chart: {str(e)}"
        })


@mcp.tool()
async def download_chart(input_data: Union[str, Dict]) -> str:
    """Download a chart image to a local file."""
    try:
        # Parse input data
        if isinstance(input_data, dict):
            params = input_data
        elif isinstance(input_data, str):
            if not input_data.strip():
                return json.dumps({
                    "status": "failed",
                    "type": "text",
                    "data": "Chart configuration and output path are required",
                    "message": "Chart configuration and output path are required"
                })
            try:
                params = json.loads(input_data)
            except json.JSONDecodeError:
                return json.dumps({
                    "status": "failed",
                    "type": "text",
                    "data": "Invalid JSON in input data",
                    "message": "Invalid JSON in input data"
                })
        else:
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Input must be a JSON string or dictionary",
                "message": "Input must be a JSON string or dictionary"
            })

        # Validate required fields
        if not isinstance(params, dict) or not params.get("config"):
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Config must be provided",
                "message": "Config must be provided"
            })

        config = params["config"]
        output_path = params.get("outputPath")

        # Normalize config if nested
        normalized_config = config.copy()
        if isinstance(config.get("data"), dict):
            if config["data"].get("datasets") and not normalized_config.get("datasets"):
                normalized_config["datasets"] = config["data"]["datasets"]
            if config["data"].get("labels") and not normalized_config.get("labels"):
                normalized_config["labels"] = config["data"]["labels"]
            if config["data"].get("type") and not normalized_config.get("type"):
                normalized_config["type"] = config["data"]["type"]

        # Validate normalized config
        if not normalized_config.get("type") or not normalized_config.get("datasets"):
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": "Config must include 'type' and 'datasets'",
                "message": "Config must include 'type' and 'datasets'"
            })

        # Generate chart URL
        chart_config = {
            "type": normalized_config["type"],
            "data": {
                "labels": normalized_config.get("labels", []),
                "datasets": [
                    {
                        "label": dataset.get("label", ""),
                        "data": dataset["data"],
                        "backgroundColor": dataset.get("backgroundColor"),
                        "borderColor": dataset.get("borderColor"),
                        **(dataset.get("additionalConfig", {}))
                    } for dataset in normalized_config["datasets"]
                ]
            },
            "options": {
                **normalized_config.get("options", {}),
                **({"title": {"display": True, "text": normalized_config["title"]}} if normalized_config.get("title") else {})
            }
        }

        encoded_config = urllib.parse.quote(json.dumps(chart_config))
        chart_url = f"{QUICKCHART_BASE_URL}?c={encoded_config}"

        # Generate default output path if not provided
        if not output_path:
            import os as os_module
            import datetime
            home_dir = os_module.path.expanduser("~")
            desktop_dir = os_module.path.join(home_dir, "Desktop")
            base_dir = desktop_dir if os_module.path.exists(
                desktop_dir) and os.access(desktop_dir, os.W_OK) else home_dir
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            chart_type = normalized_config["type"] or "chart"
            output_path = os_module.path.join(
                base_dir, f"{chart_type}_{timestamp}.png")

        # Check if output directory is writable
        output_dir = os.path.dirname(output_path)
        if not os.path.exists(output_dir) or not os.access(output_dir, os.W_OK):
            return json.dumps({
                "status": "failed",
                "type": "text",
                "data": f"Output directory does not exist or is not writable: {output_dir}",
                "message": f"Output directory does not exist or is not writable: {output_dir}"
            })

        # Download chart
        response = requests.get(chart_url, stream=True)
        response.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Return a response that signals completion
        return json.dumps({
            "status": "success",
            "type": "text",
            "data": f"Chart saved to {output_path}",
            "message": f"Chart downloaded successfully and saved to {output_path}"
        })

    except requests.RequestException as e:
        error_details = e.response.json() if e.response else {
            "message": str(e)}
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": error_details.get("message", str(e)),
            "message": f"Error downloading chart: {error_details.get('message', str(e))}"
        })

    except Exception as e:
        return json.dumps({
            "status": "failed",
            "type": "text",
            "data": str(e),
            "message": f"Unexpected error: {str(e)}"
        })

if __name__ == "__main__":
    mcp.run(transport="stdio")
