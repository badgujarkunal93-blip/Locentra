"""
Constant-velocity 2D Kalman filter for indoor position tracking.

State vector: [x, y, vx, vy]

The filter uses a time-aware transition model based on actual inter-frame
time deltas.  Process noise is modelled as a piecewise-constant white-noise
jerk acceleration using the standard kinematic block matrix.

Assumptions
-----------
- 2D motion only.
- Observation is a 2D position (x, y) — typically the output of a
  range-based solver such as NLS.
- Missing or invalid observations trigger prediction-only frames where
  covariance grows.
- The filter must be explicitly reset between independent trajectories.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import numpy as np

from .models import EstimateStatus, PositionEstimate


@dataclass
class KalmanConfig:
    """Tunable parameters for the constant-velocity Kalman filter."""
    process_noise_std: float = 0.5     # m/s²  (acceleration uncertainty)
    measurement_noise_std: float = 0.3  # m     (position observation noise)
    max_prediction_gap: float = 5.0     # seconds — beyond this, reset filter


@dataclass
class KalmanState:
    """Internal filter state.  Not intended for external construction."""
    x: np.ndarray = field(default_factory=lambda: np.zeros(4))  # [x, y, vx, vy]
    P: np.ndarray = field(default_factory=lambda: np.eye(4) * 100.0)
    initialised: bool = False
    last_timestamp: Optional[float] = None


class KalmanTracker:
    """
    2D constant-velocity Kalman filter.

    Usage
    -----
    >>> tracker = KalmanTracker()
    >>> tracker.reset()
    >>> for estimate in per_epoch_estimates:
    ...     tracked = tracker.step(estimate)
    """

    def __init__(self, config: KalmanConfig | None = None) -> None:
        self.config = config or KalmanConfig()
        self._state = KalmanState()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def reset(self) -> None:
        """Reset filter state for a new trajectory."""
        self._state = KalmanState()

    def step(self, estimate: PositionEstimate) -> PositionEstimate:
        """
        Process one epoch and return a (possibly smoothed) position estimate.

        Parameters
        ----------
        estimate : PositionEstimate
            The raw solver output for this timestamp.  If the estimate is
            invalid (status ≠ VALID), the filter performs a prediction-only
            step.

        Returns
        -------
        PositionEstimate
            A new estimate with the Kalman-filtered position (if valid) or
            the predicted position (if observation was missing).
        """
        ts = estimate.timestamp

        has_observation = (
            estimate.status == EstimateStatus.VALID
            and estimate.x is not None
            and estimate.y is not None
        )

        # Initialise on first valid observation
        if not self._state.initialised:
            if has_observation:
                self._state.x = np.array([estimate.x, estimate.y, 0.0, 0.0])
                self._state.P = np.diag([
                    self.config.measurement_noise_std ** 2,
                    self.config.measurement_noise_std ** 2,
                    1.0,  # initial velocity uncertainty
                    1.0,
                ])
                self._state.initialised = True
                self._state.last_timestamp = ts
                return PositionEstimate(
                    timestamp=ts,
                    x=estimate.x,
                    y=estimate.y,
                    status=EstimateStatus.VALID,
                    solver_cost=estimate.solver_cost,
                    num_valid_measurements=estimate.num_valid_measurements,
                    residuals=estimate.residuals,
                    convergence_message=estimate.convergence_message,
                    is_kalman_updated=True,
                )
            else:
                # Cannot initialise without a valid observation
                return PositionEstimate(
                    timestamp=ts,
                    status=estimate.status,
                    num_valid_measurements=estimate.num_valid_measurements,
                    convergence_message="Kalman not yet initialised",
                    is_kalman_updated=False,
                )

        # Compute dt
        dt = ts - self._state.last_timestamp if self._state.last_timestamp is not None else 0.0

        # Guard against non-positive or excessively large gaps
        if dt < 0:
            dt = 0.0
        if dt > self.config.max_prediction_gap:
            # Gap too large — reset and reinitialise
            self.reset()
            if has_observation:
                self._state.x = np.array([estimate.x, estimate.y, 0.0, 0.0])
                self._state.P = np.diag([
                    self.config.measurement_noise_std ** 2,
                    self.config.measurement_noise_std ** 2,
                    1.0,
                    1.0,
                ])
                self._state.initialised = True
                self._state.last_timestamp = ts
                return PositionEstimate(
                    timestamp=ts,
                    x=estimate.x,
                    y=estimate.y,
                    status=EstimateStatus.VALID,
                    solver_cost=estimate.solver_cost,
                    num_valid_measurements=estimate.num_valid_measurements,
                    is_kalman_updated=True,
                    convergence_message="Kalman reset due to large time gap",
                )
            else:
                return PositionEstimate(
                    timestamp=ts,
                    status=estimate.status,
                    num_valid_measurements=estimate.num_valid_measurements,
                    is_kalman_updated=False,
                    convergence_message="Kalman reset; waiting for valid observation",
                )

        # --- Predict ---
        F = self._transition_matrix(dt)
        Q = self._process_noise_matrix(dt)
        x_pred = F @ self._state.x
        P_pred = F @ self._state.P @ F.T + Q

        if has_observation:
            # --- Update ---
            H = self._observation_matrix()
            R = self._measurement_noise_matrix()
            z = np.array([estimate.x, estimate.y])

            y_innov = z - H @ x_pred
            S = H @ P_pred @ H.T + R
            K = P_pred @ H.T @ np.linalg.inv(S)

            x_upd = x_pred + K @ y_innov
            P_upd = (np.eye(4) - K @ H) @ P_pred

            self._state.x = x_upd
            self._state.P = P_upd
            self._state.last_timestamp = ts

            return PositionEstimate(
                timestamp=ts,
                x=float(x_upd[0]),
                y=float(x_upd[1]),
                status=EstimateStatus.VALID,
                solver_cost=estimate.solver_cost,
                num_valid_measurements=estimate.num_valid_measurements,
                residuals=estimate.residuals,
                convergence_message=estimate.convergence_message,
                is_kalman_updated=True,
            )
        else:
            # --- Prediction only ---
            self._state.x = x_pred
            self._state.P = P_pred
            self._state.last_timestamp = ts

            return PositionEstimate(
                timestamp=ts,
                x=float(x_pred[0]),
                y=float(x_pred[1]),
                status=EstimateStatus.VALID,
                num_valid_measurements=estimate.num_valid_measurements,
                convergence_message="Kalman prediction only (no observation)",
                is_kalman_updated=False,
            )

    # ------------------------------------------------------------------
    # Matrix builders
    # ------------------------------------------------------------------

    def _transition_matrix(self, dt: float) -> np.ndarray:
        """Constant-velocity state transition F."""
        return np.array([
            [1, 0, dt, 0],
            [0, 1, 0, dt],
            [0, 0, 1,  0],
            [0, 0, 0,  1],
        ])

    def _process_noise_matrix(self, dt: float) -> np.ndarray:
        """
        Discrete process noise Q using piecewise-constant white-noise
        jerk model.
        """
        q = self.config.process_noise_std ** 2
        dt2 = dt * dt
        dt3 = dt2 * dt
        dt4 = dt3 * dt
        return q * np.array([
            [dt4 / 4, 0,       dt3 / 2, 0      ],
            [0,       dt4 / 4, 0,       dt3 / 2],
            [dt3 / 2, 0,       dt2,     0      ],
            [0,       dt3 / 2, 0,       dt2    ],
        ])

    def _observation_matrix(self) -> np.ndarray:
        """Observation model H — we observe position only."""
        return np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
        ])

    def _measurement_noise_matrix(self) -> np.ndarray:
        """Measurement noise R."""
        r = self.config.measurement_noise_std ** 2
        return np.array([
            [r, 0],
            [0, r],
        ])

    @property
    def covariance(self) -> np.ndarray:
        """Current covariance matrix (for testing / diagnostics)."""
        return self._state.P.copy()

    @property
    def is_initialised(self) -> bool:
        return self._state.initialised
