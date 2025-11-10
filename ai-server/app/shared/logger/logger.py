import json
import inspect
import logging
from pathlib import Path
from typing import Dict, Literal, Union
from datetime import datetime, timezone

from app.shared.config.config import env
from app.shared.logger.logger_type import GetLogPathArgs, GetLoggerArgs, LogDataArgs, LogLevel

RESERVED_NAMES = {
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
}


is_prod = env.ENV == "prod"
log_root = Path(__file__).resolve().parents[3] / "logs"
logger_map: Dict[str, logging.Logger] = {}


def sanitize_filename(name: str) -> str:
    filename = "".join(char if char.isalnum() or char in "-_." else "_" for char in name).strip("_")

    if filename.upper() in RESERVED_NAMES:
        filename = f"_{filename}"
    return filename


def get_log_path(args: GetLogPathArgs) -> Path:
    sanitized_name = sanitize_filename(args.log_id or "undefined")
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H")
    return log_root / args.level / sanitized_name / f"{timestamp}.log"


def get_logger(args: GetLoggerArgs) -> logging.Logger:
    sanitized_name = sanitize_filename(args.log_id)
    logger_key = f"{args.level}:{sanitized_name}"

    if logger_key in logger_map:
        return logger_map[logger_key]

    logger = logging.getLogger(logger_key)
    logger.setLevel(getattr(logging, args.level.upper(), logging.INFO))

    log_path = get_log_path(GetLogPathArgs(level=args.level, log_id=args.log_id))
    log_path.parent.mkdir(parents=True, exist_ok=True)

    file_handler = logging.FileHandler(log_path, encoding="utf-8")
    formatter = logging.Formatter("%(asctime)s [%(levelname)s]: %(message)s")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    if not is_prod:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    logger.propagate = False
    logger_map[logger_key] = logger
    return logger


def get_caller_location() -> str:
    stack = inspect.stack()
    if len(stack) >= 3:
        frame = stack[2]
        return f"{frame.filename}:{frame.lineno}"
    return "unknown"


def log(id: Union[str, Literal["system", "access", "auth", "admin"]], level: LogLevel, log_data: LogDataArgs):
    location = get_caller_location()
    log_with_location = {**log_data.model_dump(), "location": location}

    logger = get_logger(GetLoggerArgs(level=level, log_id=id or "undefined"))
    logger.log(getattr(logging, level.upper(), logging.INFO), json.dumps(log_with_location, indent=2))


def info(
    id: Union[str, Literal["system", "access", "auth", "admin", "interact", "payment", "template", "user", "workflow"]],
    level: LogLevel,
    message: str,
):
    logger = get_logger(GetLoggerArgs(level=level, log_id=id or "undefined"))
    logger.log(getattr(logging, level.upper(), logging.INFO), json.dumps(message))


def console_log(message: str, **data):
    logger = logging.getLogger("uvicorn")

    extra_data = " | ".join(f"{key}={value}" for key, value in data.items())
    log_line = f"{message} | {extra_data}" if extra_data else message

    logger.info(log_line)
