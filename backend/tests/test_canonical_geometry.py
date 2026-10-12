"""
Canonical geometry consistency tests.

Guarantees that the Python backend positioning engine never drifts
from the frontend single source of truth (12m x 8m room with 6 anchors A1-A6).
"""

from pathlib import Path
import re
import pytest

from anchorsense.models import (
    Anchor,
    DEFAULT_ANCHORS,
    DEFAULT_TAG_Z,
    RoomGeometry,
    SimulationConfig,
)


# Canonical ground-truth specifications matching frontend Zustand store
CANONICAL_ROOM = {
    "width": 12.0,
    "length": 8.0,
    "height": 3.5,
}

CANONICAL_ANCHORS = {
    "A1": (0.5, 0.5, 2.8),
    "A2": (11.5, 0.5, 2.8),
    "A3": (11.5, 7.5, 2.8),
    "A4": (0.5, 7.5, 2.8),
    "A5": (6.0, 0.2, 3.2),
    "A6": (6.0, 7.8, 3.2),
}


class TestCanonicalGeometryConsistency:
    """Verifies that backend geometry is strictly identical to canonical frontend specs."""

    def test_room_dimensions_match_canonical(self):
        """Room geometry must be 12.0m x 8.0m x 3.5m."""
        room = RoomGeometry()
        assert room.width == CANONICAL_ROOM["width"]
        assert room.length == CANONICAL_ROOM["length"]
        assert room.height == CANONICAL_ROOM["height"]

    def test_anchor_count_is_six(self):
        """Default anchor configuration must have exactly 6 anchors."""
        assert len(DEFAULT_ANCHORS) == 6

    def test_anchor_ids_and_coordinates_match_canonical(self):
        """All 6 anchors must have exact canonical IDs and 3D coordinates."""
        anchor_map = {a.id: (a.x, a.y, a.z) for a in DEFAULT_ANCHORS}
        assert set(anchor_map.keys()) == set(CANONICAL_ANCHORS.keys())

        for anchor_id, expected_coords in CANONICAL_ANCHORS.items():
            actual_coords = anchor_map[anchor_id]
            assert actual_coords == pytest.approx(expected_coords, abs=1e-5), (
                f"Anchor {anchor_id} coordinate mismatch: {actual_coords} != {expected_coords}"
            )

    def test_simulation_config_uses_canonical_defaults(self):
        """SimulationConfig default room, anchors, and tag height must match canonical defaults."""
        cfg = SimulationConfig()
        assert cfg.room.width == CANONICAL_ROOM["width"]
        assert cfg.room.length == CANONICAL_ROOM["length"]
        assert cfg.room.height == CANONICAL_ROOM["height"]
        assert len(cfg.anchors) == 6
        assert cfg.anchors == DEFAULT_ANCHORS
        assert cfg.target_z == DEFAULT_TAG_Z
        assert DEFAULT_TAG_Z == 1.1

    def test_cross_check_with_frontend_source_file(self):
        """
        Directly parses src/store/useAppStore.ts to ensure zero drift
        between frontend and backend definitions.
        """
        # Resolve path to frontend store relative to this test file
        store_path = Path(__file__).resolve().parent.parent.parent / "src" / "store" / "useAppStore.ts"
        assert store_path.exists(), f"Frontend store not found at {store_path}"

        content = store_path.read_text(encoding="utf-8")

        # Extract room width and length
        width_match = re.search(r"width:\s*([0-9.]+)", content)
        length_match = re.search(r"length:\s*([0-9.]+)", content)
        height_match = re.search(r"height:\s*([0-9.]+)", content)

        assert width_match, "Room width not found in useAppStore.ts"
        assert length_match, "Room length not found in useAppStore.ts"
        assert height_match, "Room height not found in useAppStore.ts"

        fe_width = float(width_match.group(1))
        fe_length = float(length_match.group(1))
        fe_height = float(height_match.group(1))

        room = RoomGeometry()
        assert room.width == pytest.approx(fe_width)
        assert room.length == pytest.approx(fe_length)
        assert room.height == pytest.approx(fe_height)

        # Extract all anchor definitions
        anchor_pattern = re.compile(
            r"id:\s*'(A\d+)',[^}]+?x:\s*([0-9.]+),\s*y:\s*([0-9.]+),\s*z:\s*([0-9.]+)"
        )
        found_anchors = anchor_pattern.findall(content)
        assert len(found_anchors) == 6, f"Expected 6 anchors in useAppStore.ts, found {len(found_anchors)}"

        fe_anchor_map = {
            aid: (float(x), float(y), float(z))
            for aid, x, y, z in found_anchors
        }

        # Compare every backend anchor directly with frontend parsed values
        for anchor in DEFAULT_ANCHORS:
            assert anchor.id in fe_anchor_map, f"Anchor {anchor.id} missing from frontend store"
            fe_coords = fe_anchor_map[anchor.id]
            assert (anchor.x, anchor.y, anchor.z) == pytest.approx(fe_coords, abs=1e-5), (
                f"Drift detected for {anchor.id}: backend {(anchor.x, anchor.y, anchor.z)} "
                f"!= frontend {fe_coords}"
            )

    def test_drift_detection_fails_on_tampered_coordinates(self):
        """Simulate geometry drift to verify assertion failure."""
        tampered_anchors = list(DEFAULT_ANCHORS)
        tampered_anchors[0] = Anchor(id="A1", x=1.0, y=0.5, z=2.8)  # x drifted from 0.5 to 1.0

        anchor_map = {a.id: (a.x, a.y, a.z) for a in tampered_anchors}
        with pytest.raises(AssertionError):
            for anchor_id, expected_coords in CANONICAL_ANCHORS.items():
                assert anchor_map[anchor_id] == expected_coords
