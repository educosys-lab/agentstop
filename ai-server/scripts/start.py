import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv


def main():
    print("Starting server")

    if len(sys.argv) < 2:
        print("Usage: poetry run start [local|dev|prod]")
        return

    env = sys.argv[1]

    env_path = Path("/app/.env")
    if not env_path.exists():
        print(f"Env file not found at {env_path}")

    if not os.path.exists(env_path):
        print(f"Valid env file not found!")
        return

    print(f"Using environment: {env}")
    load_dotenv(dotenv_path=env_path)

    port = os.getenv("AI_PORT")
    if not port:
        print("AI_PORT is not set in the environment file!")
        return

    env_vars = os.environ.copy()

    command = ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port]

    if env == "local":
        command.insert(2, "--reload")

    try:
        subprocess.run(command, env=env_vars)
    except KeyboardInterrupt:
        print("Server stopped by user")


if __name__ == "__main__":
    main()
