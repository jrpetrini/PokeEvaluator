"""Monte Carlo simulation for percentile estimation."""

from __future__ import annotations

import numpy as np
from numpy.typing import NDArray

from pokeevaluator.data.gen3 import MAX_IV
from pokeevaluator.data.natures import NATURES
from pokeevaluator.models.pokemon import StatBlock, STAT_COUNT
from pokeevaluator.core.quality import compute_q_batch

DEFAULT_N_SAMPLES = 200_000


def _build_nature_table() -> NDArray[np.float64]:
    """Build a (25, 6) table of nature modifiers."""
    table = np.empty((len(NATURES), STAT_COUNT), dtype=np.float64)
    for i, nature in enumerate(NATURES.values()):
        table[i] = nature.modifiers().to_array()
    return table


_NATURE_TABLE: NDArray[np.float64] | None = None


def _get_nature_table() -> NDArray[np.float64]:
    global _NATURE_TABLE
    if _NATURE_TABLE is None:
        _NATURE_TABLE = _build_nature_table()
    return _NATURE_TABLE


def simulate_q_distribution(
    weights: StatBlock,
    n_samples: int = DEFAULT_N_SAMPLES,
    seed: int | None = None,
) -> NDArray[np.float64]:
    """Simulate Q values for random Pokémon.

    Draws random natures and IVs, computes Q for each.

    Returns
    -------
    Sorted (n_samples,) array of Q values.
    """
    rng = np.random.default_rng(seed)
    nature_table = _get_nature_table()
    w = weights.to_array()

    # Random IVs: uniform [0, MAX_IV] for each stat
    ivs = rng.integers(0, MAX_IV + 1, size=(n_samples, STAT_COUNT)).astype(np.float64)

    # Random natures: uniform from 25 natures
    nature_indices = rng.integers(0, len(nature_table), size=n_samples)
    nature_mods = nature_table[nature_indices]

    q_values = compute_q_batch(ivs, nature_mods, w)
    q_values.sort()
    return q_values


def compute_percentile(q: float, q_distribution: NDArray[np.float64]) -> float:
    """Compute the percentile of a Q value within the simulated distribution.

    Returns a value in [0, 100].
    """
    idx = np.searchsorted(q_distribution, q, side="right")
    return float(idx / len(q_distribution) * 100)
