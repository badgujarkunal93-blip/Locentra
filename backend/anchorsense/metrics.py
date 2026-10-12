"""
Evaluation metrics for position estimation accuracy.

All position errors are in metres.

Denominator conventions
-----------------------
- **valid_estimate_rate**: valid_count / total_count
  where total_count is ALL eligible timestamps (including failures).
- **failure_rate**: 1 - valid_estimate_rate
- Position error statistics (mean, median, p95, RMSE) are computed ONLY
  over the valid_count timestamps that produced a valid estimate.
  They are clearly labelled as "over valid estimates" and reported
  alongside the valid_estimate_rate so the reader can assess coverage.
"""

from __future__ import annotations

from typing import Optional, Sequence

import math
import numpy as np

from .models import EstimateStatus, PipelineMetrics, PositionEstimate


def _position_errors(
    estimates: Sequence[PositionEstimate],
    gt_xs: np.ndarray,
    gt_ys: np.ndarray,
) -> tuple[np.ndarray, int, int]:
    """
    Compute per-timestamp Euclidean errors for valid estimates.

    Returns
    -------
    errors     : 1-D array of errors (only for valid estimates)
    valid_count: number of valid estimates
    total_count: total eligible timestamps
    """
    total = len(estimates)
    errors = []
    for i, est in enumerate(estimates):
        if (
            est.status == EstimateStatus.VALID
            and est.x is not None
            and est.y is not None
        ):
            err = math.sqrt((est.x - gt_xs[i]) ** 2 + (est.y - gt_ys[i]) ** 2)
            errors.append(err)
    return np.array(errors), len(errors), total


def compute_metrics(
    estimates: Sequence[PositionEstimate],
    gt_xs: np.ndarray,
    gt_ys: np.ndarray,
) -> PipelineMetrics:
    """
    Compute aggregate position accuracy metrics.

    Parameters
    ----------
    estimates : sequence of PositionEstimate (one per timestamp)
    gt_xs     : ground-truth x positions (metres), same length as estimates
    gt_ys     : ground-truth y positions (metres), same length as estimates

    Returns
    -------
    PipelineMetrics with all fields populated.

    If there are no valid estimates, error statistics are None.
    """
    if len(estimates) == 0:
        return PipelineMetrics(total_count=0)

    if len(estimates) != len(gt_xs) or len(estimates) != len(gt_ys):
        raise ValueError(
            f"Length mismatch: {len(estimates)} estimates vs "
            f"{len(gt_xs)} gt_xs vs {len(gt_ys)} gt_ys"
        )

    errors, valid_count, total_count = _position_errors(estimates, gt_xs, gt_ys)
    failed_count = total_count - valid_count
    valid_rate = valid_count / total_count if total_count > 0 else 0.0

    if valid_count == 0:
        return PipelineMetrics(
            valid_estimate_rate=0.0,
            failure_rate=1.0,
            valid_count=0,
            failed_count=failed_count,
            total_count=total_count,
        )

    return PipelineMetrics(
        mean_error_m=float(np.mean(errors)),
        median_error_m=float(np.median(errors)),
        p95_error_m=float(np.percentile(errors, 95)),
        rmse_m=float(np.sqrt(np.mean(errors ** 2))),
        valid_estimate_rate=valid_rate,
        failure_rate=1.0 - valid_rate,
        valid_count=valid_count,
        failed_count=failed_count,
        total_count=total_count,
    )
