"""Tests for quality metric Q and assessments."""

import numpy as np
import pytest

from pokeevaluator.core.quality import (
    adjust_weights,
    assess_iv,
    assess_nature,
    compute_q,
    effective_nature_mods,
)
from pokeevaluator.data.gen3 import MAX_IV, NATURE_BOOST, NATURE_PENALTY
from pokeevaluator.models.pokemon import BaseStats, StatBlock


class TestComputeQ:
    def test_perfect_ivs_boosted(self):
        """All IVs at 31 with all natures boosted -> Q=1.0."""
        ivs = np.full(6, MAX_IV, dtype=np.float64)
        nature_mods = np.full(6, NATURE_BOOST, dtype=np.float64)
        weights = np.ones(6, dtype=np.float64)
        assert compute_q(ivs, nature_mods, weights) == pytest.approx(1.0)

    def test_zero_ivs(self):
        """All IVs at 0 -> Q=0.0."""
        ivs = np.zeros(6, dtype=np.float64)
        nature_mods = np.ones(6, dtype=np.float64)
        weights = np.ones(6, dtype=np.float64)
        assert compute_q(ivs, nature_mods, weights) == pytest.approx(0.0)

    def test_monotonic_in_ivs(self):
        """Higher IVs should give higher Q."""
        nature_mods = np.ones(6, dtype=np.float64)
        weights = np.ones(6, dtype=np.float64)

        q_low = compute_q(np.full(6, 5.0), nature_mods, weights)
        q_high = compute_q(np.full(6, 25.0), nature_mods, weights)
        assert q_high > q_low

    def test_zero_weights(self):
        """Zero weights should give Q=0."""
        ivs = np.full(6, MAX_IV, dtype=np.float64)
        nature_mods = np.full(6, NATURE_BOOST, dtype=np.float64)
        weights = np.zeros(6, dtype=np.float64)
        assert compute_q(ivs, nature_mods, weights) == 0.0

    def test_weighted_sensitivity(self):
        """Q should be more sensitive to stats with higher weights."""
        nature_mods = np.ones(6, dtype=np.float64)
        # Only ATK and SPE matter
        weights = np.array([0.0, 1.0, 0.0, 0.0, 0.0, 1.0], dtype=np.float64)

        # Good ATK/SPE, bad everything else
        ivs_focused = np.array([0, 31, 0, 0, 0, 31], dtype=np.float64)
        # Mediocre everything
        ivs_spread = np.full(6, 15.0, dtype=np.float64)

        q_focused = compute_q(ivs_focused, nature_mods, weights)
        q_spread = compute_q(ivs_spread, nature_mods, weights)
        assert q_focused > q_spread


class TestAssessNature:
    def test_excellent(self):
        """Boost on high-weight stat, penalty on low-weight -> Excelente."""
        # Jolly: +Spe, -SpAtk
        nature_mods = StatBlock(hp=1.0, atk=1.0, def_=1.0, spatk=0.9, spdef=1.0, spe=1.1)
        weights = StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.3, spdef=0.5, spe=0.8)
        assert assess_nature(nature_mods, weights) == "Excelente"

    def test_neutral(self, neutral_mods):
        """Neutral nature -> Neutra."""
        weights = StatBlock.uniform(1.0)
        assert assess_nature(neutral_mods, weights) == "Neutra"

    def test_bad(self):
        """Boost on low-weight, penalty on high-weight -> Ruim."""
        # Quiet: +SpAtk, -Spe
        nature_mods = StatBlock(hp=1.0, atk=1.0, def_=1.0, spatk=1.1, spdef=1.0, spe=0.9)
        # Physical sweeper weights
        weights = StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.3, spdef=0.5, spe=0.8)
        assert assess_nature(nature_mods, weights) == "Ruim"


    def test_asymmetric_penalty_in_q(self):
        """Bad nature should drop Q more than good nature raises it (equal-weight stats)."""
        # Weights where ATK and SPE are equally important
        weights = np.array([0.5, 0.8, 0.5, 0.3, 0.5, 0.8], dtype=np.float64)
        ivs = np.full(6, 15.0)  # average IVs
        neutral = np.ones(6, dtype=np.float64)

        # Adamant: +ATK -SpAtk (good — penalizes low-weight)
        adamant_mods = np.array([1.0, 1.1, 1.0, 0.9, 1.0, 1.0])
        # Timid: +SPE -ATK (bad — penalizes high-weight)
        timid_mods = np.array([1.0, 0.9, 1.0, 1.0, 1.0, 1.1])

        q_neutral = compute_q(ivs, neutral, weights)
        q_adamant = compute_q(ivs, adamant_mods, weights)
        q_timid = compute_q(ivs, timid_mods, weights)

        # Adamant should be better than neutral, Timid worse
        assert q_adamant > q_neutral
        assert q_timid < q_neutral
        # The drop from Timid is larger than the gain from Adamant
        assert (q_neutral - q_timid) > (q_adamant - q_neutral)

    def test_effective_nature_mods_boost_unchanged(self):
        """Boosts (>= 1.0) pass through unchanged."""
        mods = np.array([1.0, 1.1, 1.0, 1.0, 1.0, 1.0])
        eff = effective_nature_mods(mods)
        assert eff[1] == pytest.approx(1.1)
        assert eff[0] == pytest.approx(1.0)

    def test_effective_nature_mods_penalty_amplified(self):
        """Penalties (< 1.0) are amplified by NATURE_PENALTY_WEIGHT."""
        mods = np.array([1.0, 1.0, 1.0, NATURE_PENALTY, 1.0, 1.0])
        eff = effective_nature_mods(mods)
        # 0.9 -> 1.0 - 1.5 * 0.1 = 0.85
        assert eff[3] == pytest.approx(0.85)

    def test_assess_nature_timid_physical_sweeper_is_ruim(self):
        """Timid (+Spe -Atk) on Physical Sweeper should be Ruim, not Aceitável."""
        # Timid: boost Spe, penalize Atk
        timid_mods = StatBlock(hp=1.0, atk=0.9, def_=1.0, spatk=1.0, spdef=1.0, spe=1.1)
        # Physical sweeper weights (ATK and SPE both high)
        weights = StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.3, spdef=0.5, spe=0.8)
        assert assess_nature(timid_mods, weights) == "Ruim"


class TestAdjustWeights:
    def test_preserves_ranking(self):
        """Tilt should preserve relative ordering of weights."""
        weights = StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.3, spdef=0.5, spe=0.8)
        # Balanced base stats
        base = BaseStats(hp=80, atk=80, def_=80, spatk=80, spdef=80, spe=80)
        adjusted = adjust_weights(weights, base)
        # ATK should still be >= HP, SpAtk should still be the lowest non-spe
        assert adjusted.atk >= adjusted.hp
        assert adjusted.spatk <= adjusted.atk

    def test_slow_pokemon_reduces_spe(self):
        """Pokémon with base speed < 50 should have spe weight reduced."""
        weights = StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.3, spdef=0.5, spe=0.8)
        # Snorlax-like: very slow
        base = BaseStats(hp=160, atk=110, def_=65, spatk=65, spdef=110, spe=30)
        adjusted = adjust_weights(weights, base)
        # spe = 0.8 * 0.7 = 0.56, original was 0.8
        assert adjusted.spe < weights.spe

    def test_fast_pokemon_increases_spe(self):
        """Pokémon with base speed >= 90 should have spe weight increased."""
        weights = StatBlock(hp=0.5, atk=0.3, def_=0.5, spatk=0.8, spdef=0.5, spe=0.8)
        # Jolteon-like: very fast
        base = BaseStats(hp=65, atk=65, def_=60, spatk=110, spdef=95, spe=130)
        adjusted = adjust_weights(weights, base)
        # spe = 0.8 * 1.2 = 0.96
        assert adjusted.spe > weights.spe

    def test_medium_speed_unchanged(self):
        """Pokémon with speed 50-89 should keep spe weight unchanged."""
        weights = StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.3, spdef=0.5, spe=0.8)
        base = BaseStats(hp=80, atk=80, def_=80, spatk=80, spdef=80, spe=70)
        adjusted = adjust_weights(weights, base)
        # spe = 0.8 * 1.0 = 0.8 (unchanged by speed tilt)
        assert adjusted.spe == pytest.approx(weights.spe, abs=0.01)

    def test_clamped_to_range(self):
        """All adjusted weights should be in [0.1, 1.0]."""
        weights = StatBlock(hp=0.8, atk=0.8, def_=0.8, spatk=0.8, spdef=0.8, spe=0.8)
        base = BaseStats(hp=255, atk=10, def_=10, spatk=10, spdef=10, spe=150)
        adjusted = adjust_weights(weights, base)
        for _, val in adjusted:
            assert 0.1 <= val <= 1.0

    def test_dominant_stat_gets_higher_weight(self):
        """A species' dominant stat should tilt its weight upward."""
        weights = StatBlock.uniform(0.5)
        # ATK-dominant species
        base = BaseStats(hp=60, atk=130, def_=60, spatk=60, spdef=60, spe=70)
        adjusted = adjust_weights(weights, base)
        # ATK weight should be higher than DEF weight (same base weight, but ATK ratio is higher)
        assert adjusted.atk > adjusted.def_


class TestAssessIV:
    def test_excellent(self):
        assert assess_iv(31) == "Excelente"
        assert assess_iv(28) == "Excelente"

    def test_good(self):
        assert assess_iv(25) == "Bom"
        assert assess_iv(20) == "Bom"

    def test_mediocre(self):
        assert assess_iv(15) == "Mediano"
        assert assess_iv(10) == "Mediano"

    def test_weak(self):
        assert assess_iv(5) == "Fraco"
        assert assess_iv(0) == "Fraco"
