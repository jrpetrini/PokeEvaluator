"""Gen III stat formulas and IV recovery."""

from __future__ import annotations

import math

from pokeevaluator.data.gen3 import DEFAULT_EV, IV_RANGE
from pokeevaluator.models.pokemon import BaseStats, StatBlock, StatName, STAT_ORDER
from pokeevaluator.models.specimen import IVRange, IVSet


def calc_hp(base: int, iv: int, level: int, ev: int = DEFAULT_EV) -> int:
    """Gen III HP formula: floor((2*Base + IV + floor(EV/4)) * Level / 100) + Level + 10."""
    return math.floor((2 * base + iv + math.floor(ev / 4)) * level / 100) + level + 10


def calc_other_stat(
    base: int, iv: int, level: int, nature_mod: float, ev: int = DEFAULT_EV
) -> int:
    """Gen III non-HP stat formula: floor((floor((2*Base + IV + floor(EV/4)) * Level / 100) + 5) * NatureMod)."""
    inner = math.floor((2 * base + iv + math.floor(ev / 4)) * level / 100) + 5
    return math.floor(inner * nature_mod)


def recover_iv_hp(base: int, level: int, observed: int, ev: int = DEFAULT_EV) -> IVRange:
    """Recover possible HP IVs by brute force."""
    candidates = [iv for iv in IV_RANGE if calc_hp(base, iv, level, ev) == observed]
    if not candidates:
        raise ValueError(f"Nenhum IV possível para HP observado={observed}")
    return IVRange(stat=StatName.HP, min_iv=candidates[0], max_iv=candidates[-1])


def recover_iv_other(
    stat: StatName,
    base: int,
    level: int,
    nature_mod: float,
    observed: int,
    ev: int = DEFAULT_EV,
) -> IVRange:
    """Recover possible IVs for a non-HP stat by brute force."""
    candidates = [
        iv
        for iv in IV_RANGE
        if calc_other_stat(base, iv, level, nature_mod, ev) == observed
    ]
    if not candidates:
        raise ValueError(f"Nenhum IV possível para {stat.value} observado={observed}")
    return IVRange(stat=stat, min_iv=candidates[0], max_iv=candidates[-1])


def recover_all_ivs(
    base_stats: BaseStats,
    level: int,
    nature_mods: StatBlock,
    observed: StatBlock,
) -> IVSet:
    """Recover IVs for all 6 stats."""
    hp_range = recover_iv_hp(
        base=base_stats.hp, level=level, observed=int(observed.hp)
    )

    other_ranges: dict[StatName, IVRange] = {}
    for stat in STAT_ORDER:
        if stat == StatName.HP:
            continue
        other_ranges[stat] = recover_iv_other(
            stat=stat,
            base=base_stats[stat],
            level=level,
            nature_mod=nature_mods[stat],
            observed=int(observed[stat]),
        )

    return IVSet(
        hp=hp_range,
        atk=other_ranges[StatName.ATK],
        def_=other_ranges[StatName.DEF],
        spatk=other_ranges[StatName.SPATK],
        spdef=other_ranges[StatName.SPDEF],
        spe=other_ranges[StatName.SPE],
    )
