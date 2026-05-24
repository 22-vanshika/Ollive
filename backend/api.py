# Vercel serverless entry point.
# This file sits at backend/ so the Python path root is backend/,
# making the `app` package importable as `from app.xxx import ...`.
from app.main import app  # noqa: F401  (Vercel detects the `app` name)
