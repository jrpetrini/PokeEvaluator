"""Tests for stat formulas and IV recovery."""

import pytest

from pokeevaluator.core.stats import (
    calc_hp,
    calc_other_stat,
    recover_all_ivs,
    recover_iv_hp,
    recover_iv_other,
)
from pokeevaluator.data.gen3 import IV_RANGE
from pokeevaluator.models.pokemon import BaseStats, StatBlock, StatName


class TestCalcHP:
    def test_known_value(self, dugtrio_base):
        """Dugtrio base HP=35, IV=20, level=25 -> 57."""
        assert calc_hp(dugtrio_base.hp, 20, 25) == 57

    def test_min_iv(self, dugtrio_base):
        """Min IV should produce lowest stat."""
        min_hp = calc_hp(dugtrio_base.hp, 0, 25)
        max_hp = calc_hp(dugtrio_base.hp, 31, 25)
        assert min_hp < max_hp

    def test_monotonic(self, dugtrio_base):
        """Higher IV -> higher or equal HP."""
        values = [calc_hp(dugtrio_base.hp, iv, 50) for iv in IV_RANGE]
        for a, b in zip(values, values[1:]):
            assert b >= a


class TestCalcOtherStat:
    def test_known_value_neutral(self, dugtrio_base):
        """Dugtrio base ATK=80, IV=25, level=25, neutral -> 51 with Jolly (+Spe)."""
        # Jolly is neutral on ATK
        assert calc_other_stat(dugtrio_base.atk, 25, 25, 1.0) == 51

    def test_nature_boost(self, dugtrio_base):
        """Boosted nature gives higher stat."""
        neutral = calc_other_stat(dugtrio_base.spe, 31, 25, 1.0)
        boosted = calc_other_stat(dugtrio_base.spe, 31, 25, 1.1)
        assert boosted > neutral

    def test_nature_penalty(self, dugtrio_base):
        """Penalized nature gives lower stat."""
        neutral = calc_other_stat(dugtrio_base.spe, 31, 25, 1.0)
        penalized = calc_other_stat(dugtrio_base.spe, 31, 25, 0.9)
        assert penalized < neutral


class TestIVRecovery:
    def test_round_trip_hp(self, dugtrio_base):
        """Forward calc -> recover should include original IV."""
        original_iv = 20
        observed = calc_hp(dugtrio_base.hp, original_iv, 25)
        recovered = recover_iv_hp(dugtrio_base.hp, 25, observed)
        assert recovered.min_iv <= original_iv <= recovered.max_iv

    def test_round_trip_other(self, dugtrio_base):
        """Forward calc -> recover for non-HP stat."""
        original_iv = 25
        observed = calc_other_stat(dugtrio_base.atk, original_iv, 25, 1.0)
        recovered = recover_iv_other(StatName.ATK, dugtrio_base.atk, 25, 1.0, observed)
        assert recovered.min_iv <= original_iv <= recovered.max_iv

    def test_round_trip_all(self, dugtrio_base, jolly_mods):
        """Full IV recovery round-trip for Dugtrio Jolly."""
        ivs_original = [20, 25, 15, 10, 18, 31]
        level = 25

        observed = StatBlock(
            hp=float(calc_hp(dugtrio_base.hp, ivs_original[0], level)),
            atk=float(calc_other_stat(dugtrio_base.atk, ivs_original[1], level, jolly_mods.atk)),
            def_=float(calc_other_stat(dugtrio_base.def_, ivs_original[2], level, jolly_mods.def_)),
            spatk=float(calc_other_stat(dugtrio_base[StatName.SPATK], ivs_original[3], level, jolly_mods.spatk)),
            spdef=float(calc_other_stat(dugtrio_base[StatName.SPDEF], ivs_original[4], level, jolly_mods.spdef)),
            spe=float(calc_other_stat(dugtrio_base.spe, ivs_original[5], level, jolly_mods.spe)),
        )

        recovered = recover_all_ivs(dugtrio_base, level, jolly_mods, observed)

        for i, stat in enumerate(StatName):
            iv_range = recovered[stat]
            assert iv_range.min_iv <= ivs_original[i] <= iv_range.max_iv, (
                f"{stat.value}: IV={ivs_original[i]} not in [{iv_range.min_iv}, {iv_range.max_iv}]"
            )

    def test_invalid_stat_raises(self, dugtrio_base):
        """Impossible observed stat should raise ValueError."""
        with pytest.raises(ValueError, match="Nenhum IV possível"):
            recover_iv_hp(dugtrio_base.hp, 25, 999)

    def test_higher_level_narrows_range(self, charizard_base, neutral_mods):
        """At higher levels, IV ranges should be narrower (or equal)."""
        observed_low = calc_hp(charizard_base.hp, 15, 10)
        observed_high = calc_hp(charizard_base.hp, 15, 50)

        range_low = recover_iv_hp(charizard_base.hp, 10, observed_low)
        range_high = recover_iv_hp(charizard_base.hp, 50, observed_high)

        width_low = range_low.max_iv - range_low.min_iv
        width_high = range_high.max_iv - range_high.min_iv
        assert width_high <= width_low
