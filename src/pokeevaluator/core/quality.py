"""Quality metric Q and nature/IV assessment."""

from __future__ import annotations

import numpy as np
from numpy.typing import NDArray

from pokeevaluator.data.gen3 import (
    MAX_IV,
    NATURE_BOOST,
    NATURE_PENALTY,
    NATURE_PENALTY_WEIGHT,
)
from pokeevaluator.models.pokemon import BaseStats, StatBlock, StatName, STAT_ORDER


# ---------------------------------------------------------------------------
# Asymmetric effective nature modifiers
# ---------------------------------------------------------------------------

def effective_nature_mods(mods: NDArray[np.float64]) -> NDArray[np.float64]:
    """Apply asymmetric penalty: nature penalties hurt more than boosts help.

    Boosts stay at 1.1 (10% gain).
    Penalties become 1.0 - 1.5 * 0.1 = 0.85 (15% loss instead of 10%).

    Works for both (6,) and (N, 6) arrays.
    """
    return np.where(
        mods >= 1.0,
        mods,
        1.0 - NATURE_PENALTY_WEIGHT * (1.0 - mods),
    )


def _compute_q_max(weights: NDArray[np.float64]) -> float:
    """Realistic Q ceiling: perfect IVs + optimal nature for these weights.

    Finds the nature allocation (boost one non-HP stat, penalize another)
    that maximises the numerator.  Falls back to neutral if no nature
    beats the all-1.0 baseline (e.g. perfectly balanced weights).
    """
    neutral_max = float(np.sum(weights * MAX_IV))

    non_hp = weights[1:]  # indices 0=HP excluded; 1..5 = ATK..SPE
    if len(non_hp) == 0 or non_hp.max() == non_hp.min():
        # All non-HP weights identical → any nature is a net loss; neutral best
        boost_gain = NATURE_BOOST - 1.0                             # 0.1
        penalty_cost = NATURE_PENALTY_WEIGHT * (1.0 - NATURE_PENALTY)  # 0.15
        increment = MAX_IV * non_hp[0] * (boost_gain - penalty_cost)
        return neutral_max + max(0.0, increment)

    best_idx = 1 + int(np.argmax(non_hp))
    worst_idx = 1 + int(np.argmin(non_hp))

    optimal_mods = np.ones_like(weights)
    optimal_mods[best_idx] = NATURE_BOOST
    optimal_mods[worst_idx] = 1.0 - NATURE_PENALTY_WEIGHT * (1.0 - NATURE_PENALTY)

    q_max_nature = float(np.sum(weights * MAX_IV * optimal_mods))
    return max(neutral_max, q_max_nature)


# ---------------------------------------------------------------------------
# Quality score Q
# ---------------------------------------------------------------------------

def compute_q(
    ivs: NDArray[np.float64],
    nature_mods: NDArray[np.float64],
    weights: NDArray[np.float64],
) -> float:
    """Compute quality score Q in [0, 1].

    Uses asymmetric effective nature modifiers and a realistic Q_max
    (perfect IVs + optimal nature for the role weights).
    """
    eff = effective_nature_mods(nature_mods)
    actual = np.sum(weights * ivs * eff)
    q_max = _compute_q_max(weights)
    if q_max == 0:
        return 0.0
    return float(np.clip(actual / q_max, 0.0, 1.0))


def compute_q_batch(
    ivs: NDArray[np.float64],
    nature_mods: NDArray[np.float64],
    weights: NDArray[np.float64],
) -> NDArray[np.float64]:
    """Vectorized Q for (N, 6) arrays of IVs and nature_mods.

    Parameters
    ----------
    ivs : (N, 6) array
    nature_mods : (N, 6) array
    weights : (6,) array

    Returns
    -------
    (N,) array of Q values
    """
    eff = effective_nature_mods(nature_mods)
    actual = np.sum(weights * ivs * eff, axis=1)
    q_max = _compute_q_max(weights)
    return np.clip(actual / q_max, 0.0, 1.0)


# ---------------------------------------------------------------------------
# Weight adjustment
# ---------------------------------------------------------------------------

def adjust_weights(weights: StatBlock, base_stats: BaseStats) -> StatBlock:
    """Adjust role weights dynamically based on species base stats.

    General stats (HP, ATK, DEF, SPATK, SPDEF) get a proportional tilt
    based on how significant they are relative to the species' BST.
    Speed uses absolute thresholds for a more aggressive tilt.
    """
    base_arr = base_stats.to_array().astype(np.float64)
    bst = float(base_arr.sum())
    if bst == 0:
        return weights

    ratios = base_arr / bst
    max_ratio = float(ratios[:5].max())  # max among HP..SPDEF (indices 0-4)

    adjusted = np.empty(6, dtype=np.float64)
    weight_arr = weights.to_array()

    # HP, ATK, DEF, SPATK, SPDEF — proportional tilt
    for i in range(5):
        tilt = 0.8 + 0.4 * (ratios[i] / max_ratio) if max_ratio > 0 else 1.0
        adjusted[i] = np.clip(weight_arr[i] * tilt, 0.1, 1.0)

    # SPE — threshold-based tilt
    base_spe = int(base_arr[5])
    if base_spe >= 90:
        speed_tilt = 1.2
    elif base_spe >= 50:
        speed_tilt = 1.0
    else:
        speed_tilt = 0.7
    adjusted[5] = np.clip(weight_arr[5] * speed_tilt, 0.1, 1.0)

    return StatBlock.from_array(adjusted)


# ---------------------------------------------------------------------------
# Nature assessment
# ---------------------------------------------------------------------------

def assess_nature(nature_mods: StatBlock, weights: StatBlock) -> str:
    """Assess how well a nature matches the role weights.

    Uses an asymmetric score: penalties on high-weight stats hurt more
    than boosts on equivalent-weight stats help.

        score = w_boost - NATURE_PENALTY_WEIGHT * w_penalty

    Thresholds:
        >= 0.3  Excelente   (boost important, penalize unimportant)
        >= 0.0  Boa         (mild favorable trade)
        >= -0.3 Aceitável   (mild unfavorable trade)
        < -0.3  Ruim        (penalize important stat)
    """
    boosted = None
    penalized = None
    for stat in STAT_ORDER:
        if stat == StatName.HP:
            continue
        mod = nature_mods[stat]
        if mod > 1.0:
            boosted = stat
        elif mod < 1.0:
            penalized = stat

    if boosted is None:
        return "Neutra"

    score = weights[boosted] - NATURE_PENALTY_WEIGHT * weights[penalized]

    if score >= 0.3:
        return "Excelente"
    elif score >= 0.0:
        return "Boa"
    elif score >= -0.3:
        return "Aceitável"
    else:
        return "Ruim"


# ---------------------------------------------------------------------------
# IV assessment
# ---------------------------------------------------------------------------

def assess_iv(iv_value: int) -> str:
    """Human-readable IV quality label."""
    if iv_value >= 28:
        return "Excelente"
    elif iv_value >= 20:
        return "Bom"
    elif iv_value >= 10:
        return "Mediano"
    else:
        return "Fraco"
