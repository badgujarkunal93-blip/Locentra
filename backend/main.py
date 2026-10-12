"""
Uvicorn entry point for AnchorSense FastAPI application.
Usage:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from anchorsense.api.app import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
