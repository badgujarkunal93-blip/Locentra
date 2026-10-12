"""
API endpoint tests for AnchorSense FastAPI layer.
"""

import pytest
from fastapi.testclient import TestClient

from anchorsense.api.app import app
from anchorsense.models import DEFAULT_TAG_Z

client = TestClient(app)


class TestHealthAndConfigEndpoints:
    """Tests for system status and canonical configuration endpoints."""

    def test_health_endpoint(self):
        """GET /health returns healthy status and version."""
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["version"] == "0.1.0"
        assert "engine" in data

    def test_default_config_endpoint(self):
        """GET /api/v1/config/default returns canonical 12x8 room and 6 anchors."""
        res = client.get("/api/v1/config/default")
        assert res.status_code == 200
        data = res.json()

        # Canonical room
        assert data["room"]["width"] == 12.0
        assert data["room"]["length"] == 8.0
        assert data["room"]["height"] == 3.5

        # Canonical anchors
        assert len(data["anchors"]) == 6
        anchor_ids = [a["id"] for a in data["anchors"]]
        assert anchor_ids == ["A1", "A2", "A3", "A4", "A5", "A6"]

        # Tag height
        assert data["nominal_tag_height"] == DEFAULT_TAG_Z
        assert data["nominal_tag_height"] == 1.1

        # Defaults
        assert data["simulation_defaults"]["num_points"] == 80
        assert data["simulation_defaults"]["seed"] == 42

    def test_cors_headers_allowed_origin(self):
        """Vite local origin receives proper CORS response headers."""
        res = client.options(
            "/api/v1/config/default",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"
        assert "access-control-allow-credentials" in res.headers

    def test_cors_headers_unauthorized_origin(self):
        """Unauthorized external origin does not receive access-control-allow-origin header."""
        res = client.options(
            "/api/v1/config/default",
            headers={
                "Origin": "http://evil-attacker.example.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert res.headers.get("access-control-allow-origin") != "http://evil-attacker.example.com"


class TestSimulationRunEndpoint:
    """Tests for POST /api/v1/simulations/run."""

    def test_run_simulation_default_settings(self):
        """Runs simulation successfully with default payload."""
        payload = {}
        res = client.post("/api/v1/simulations/run", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["scenario_id"].startswith("sim-")
        assert data["num_points"] == 80
        assert len(data["timestamps"]) == 80
        assert len(data["ground_truth"]) == 80
        assert len(data["measurements"]) == 80
        assert len(data["estimates"]) == 80
        assert data["metrics"]["total_count"] == 80
        assert data["metrics"]["valid_estimate_rate"] > 0.8
        assert data["effective_config"]["seed"] == 42

    def test_run_simulation_solvers(self):
        """Can explicitly request ordinary NLS and Kalman-filtered solvers."""
        # NLS
        res_nls = client.post(
            "/api/v1/simulations/run",
            json={"solver": "nls", "num_points": 20},
        )
        assert res_nls.status_code == 200
        assert res_nls.json()["algorithm_name"] == "Ordinary NLS"

        # NLS + Kalman
        res_kalman = client.post(
            "/api/v1/simulations/run",
            json={"solver": "nls_kalman", "num_points": 20},
        )
        assert res_kalman.status_code == 200
        assert res_kalman.json()["algorithm_name"] == "NLS + Kalman"
        # At least one estimate should have is_kalman_updated=True
        estimates = res_kalman.json()["estimates"]
        assert any(e.get("is_kalman_updated") is True for e in estimates)

    def test_run_simulation_deterministic_seed(self):
        """Identical configurations and seeds produce identical outputs."""
        payload = {"seed": 1234, "num_points": 30}
        res1 = client.post("/api/v1/simulations/run", json=payload).json()
        res2 = client.post("/api/v1/simulations/run", json=payload).json()

        assert res1["ground_truth"] == res2["ground_truth"]
        assert res1["measurements"] == res2["measurements"]
        assert res1["estimates"] == res2["estimates"]
        assert res1["metrics"] == res2["metrics"]

    def test_run_simulation_different_seeds_differ(self):
        """Different seeds produce different measurement realisations and errors."""
        res1 = client.post("/api/v1/simulations/run", json={"seed": 10, "num_points": 30}).json()
        res2 = client.post("/api/v1/simulations/run", json={"seed": 99, "num_points": 30}).json()

        assert res1["measurements"] != res2["measurements"]
        assert res1["metrics"]["mean_error_m"] != res2["metrics"]["mean_error_m"]

    def test_run_simulation_handles_high_dropout(self):
        """High dropout probability produces missing measurements and degraded estimates without crashing."""
        res = client.post(
            "/api/v1/simulations/run",
            json={"dropout_rate": 0.8, "num_points": 25},
        )
        assert res.status_code == 200
        data = res.json()
        # Some measurements should be None (dropout)
        has_dropped_meas = any(
            m["measured_range"] is None
            for epoch in data["measurements"]
            for m in epoch
        )
        assert has_dropped_meas
        assert data["metrics"]["failed_count"] > 0

    def test_run_simulation_custom_anchors_and_room(self):
        """Can supply custom room and anchors."""
        payload = {
            "num_points": 10,
            "room": {"width": 10.0, "length": 6.0, "height": 3.0},
            "anchors": [
                {"id": "A1", "x": 1.0, "y": 1.0, "z": 2.5, "is_active": True},
                {"id": "A2", "x": 9.0, "y": 1.0, "z": 2.5, "is_active": True},
                {"id": "A3", "x": 5.0, "y": 5.0, "z": 2.5, "is_active": True},
            ],
        }
        res = client.post("/api/v1/simulations/run", json=payload)
        assert res.status_code == 200
        assert res.json()["num_points"] == 10

    def test_run_simulation_rejects_insufficient_active_anchors(self):
        """Fewer than 3 active anchors returns HTTP 400 Bad Request."""
        payload = {
            "num_points": 10,
            "anchors": [
                {"id": "A1", "x": 1.0, "y": 1.0, "z": 2.5, "is_active": True},
                {"id": "A2", "x": 9.0, "y": 1.0, "z": 2.5, "is_active": False},
            ],
        }
        res = client.post("/api/v1/simulations/run", json=payload)
        assert res.status_code == 400
        assert "At least 3 active anchors" in res.json()["detail"]


class TestSimulationCompareEndpoint:
    """Tests for POST /api/v1/simulations/compare."""

    def test_compare_simulations_success(self):
        """Comparison endpoint returns side-by-side solver results."""
        payload = {
            "num_points": 30,
            "enable_kalman": True,
            "robust_loss": "huber",
            "robust_f_scale": 0.5,
        }
        res = client.post("/api/v1/simulations/compare", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["scenario_id"].startswith("cmp-")
        assert "nls" in data["solvers"]
        assert "robust_nls" in data["solvers"]
        assert "nls_kalman" in data["solvers"]
        assert "robust_nls_kalman" in data["solvers"]

        assert len(data["solvers"]["nls"]["estimates"]) == 30
        assert len(data["solvers"]["robust_nls"]["estimates"]) == 30
        assert data["solvers"]["nls"]["metrics"]["total_count"] == 30

    def test_compare_simulations_kalman_disabled(self):
        """Disabling Kalman excludes Kalman entries from solvers map."""
        res = client.post(
            "/api/v1/simulations/compare",
            json={"num_points": 15, "enable_kalman": False},
        )
        assert res.status_code == 200
        data = res.json()
        assert "nls" in data["solvers"]
        assert "robust_nls" in data["solvers"]
        assert "nls_kalman" not in data["solvers"]


class TestValidationAndLimits:
    """Tests parameter bounds, malformed inputs, and exception safety."""

    def test_reject_excessive_num_points(self):
        """Trajectory length above 500 is rejected with HTTP 422."""
        res = client.post("/api/v1/simulations/run", json={"num_points": 501})
        assert res.status_code == 422
        assert "Request validation failed" in res.json()["detail"]

    def test_reject_negative_or_too_small_num_points(self):
        """Trajectory length below 2 is rejected with HTTP 422."""
        res = client.post("/api/v1/simulations/run", json={"num_points": 1})
        assert res.status_code == 422

    def test_reject_invalid_dropout_rate(self):
        """Dropout rate >= 1.0 is rejected with HTTP 422."""
        res = client.post("/api/v1/simulations/run", json={"dropout_rate": 1.0})
        assert res.status_code == 422

    def test_reject_invalid_trajectory_type(self):
        """Unknown trajectory type is rejected with HTTP 422."""
        res = client.post("/api/v1/simulations/run", json={"trajectory_type": "spiral"})
        assert res.status_code == 422

    def test_reject_invalid_robust_loss(self):
        """Unsupported robust loss is rejected with HTTP 422."""
        res = client.post("/api/v1/simulations/compare", json={"robust_loss": "invalid_loss"})
        assert res.status_code == 422

    def test_no_stack_trace_leakage_on_error(self):
        """Validation errors return clean message without Python tracebacks."""
        res = client.post("/api/v1/simulations/run", json={"num_points": "not-an-int"})
        assert res.status_code == 422
        body = res.text
        assert "Traceback (most recent call last)" not in body
        assert "File \"" not in body
