"""Catch planning — probability models for n-catch strategy."""

from __future__ import annotations

import math


def p_at_least_one(p_single: float, n: int) -> float:
    """Probability of at least one success in n independent trials.

    P(>=1) = 1 - (1-p)^n
    """
    if p_single <= 0:
        return 0.0
    if p_single >= 1:
        return 1.0
    return 1.0 - (1.0 - p_single) ** n


def expected_catches(p_single: float) -> float:
    """Expected number of catches to get one success: E[X] = 1/p."""
    if p_single <= 0:
        return float("inf")
    return 1.0 / p_single


def catches_for_confidence(p_single: float, confidence: float) -> int:
    """Minimum catches needed to reach a given confidence level.

    n = ceil(log(1 - confidence) / log(1 - p_single))
    """
    if p_single <= 0:
        return -1  # impossible
    if p_single >= 1:
        return 1
    if confidence >= 1:
        return -1  # impossible
    return math.ceil(math.log(1.0 - confidence) / math.log(1.0 - p_single))
