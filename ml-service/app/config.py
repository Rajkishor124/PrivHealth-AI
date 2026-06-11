"""Configuration for the ML service."""

import os


ML_PORT = int(os.environ.get("ML_PORT", "8000"))
