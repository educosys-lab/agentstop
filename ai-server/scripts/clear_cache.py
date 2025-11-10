import os
import shutil


# Recursively deletes all __pycache__ folders from the given root directory, while ignoring the .venv directory.
# This is useful to clear the cache when you are developing and want to make sure you are using the latest code.
def clear_pycache(root_dir="."):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip .venv directory
        if ".venv" in dirnames:
            dirnames.remove(".venv")

        if "__pycache__" in dirnames:
            pycache_path = os.path.join(dirpath, "__pycache__")
            print(f"Removing: {pycache_path}")
            shutil.rmtree(pycache_path, ignore_errors=True)


if __name__ == "__main__":
    # change to your project path if needed
    project_root = "."
    clear_pycache(project_root)
    print("✅ All __pycache__ folders (excluding .venv) have been cleared.")
