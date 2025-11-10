from dataclasses import dataclass


@dataclass(frozen=True)
class Paths:
    TOOL_BASE_DIR: str = "app/tools"
    TOOLS_CONFIG_PATH: str = f"{TOOL_BASE_DIR}/tools_config.json"
    TOOLS_RESOLVED_CONFIG_PATH: str = f"{TOOL_BASE_DIR}/resolved_tools_config.json"
    TOOLS_RESOLVED_VERSIONS_PATH: str = f"{TOOL_BASE_DIR}/resolved_versions.json"


PATHS = Paths()
