"""All 25 Gen III natures with stat modifiers."""

from __future__ import annotations

from dataclasses import dataclass

from pokeevaluator.data.gen3 import NATURE_BOOST, NATURE_NEUTRAL, NATURE_PENALTY
from pokeevaluator.models.pokemon import StatBlock, StatName


@dataclass(frozen=True, slots=True)
class Nature:
    name: str
    boost: StatName | None  # None for neutral natures
    penalty: StatName | None

    def modifiers(self) -> StatBlock:
        """Return a StatBlock of nature multipliers (HP is always 1.0)."""
        mods = {s: NATURE_NEUTRAL for s in StatName}
        if self.boost and self.penalty:
            mods[self.boost] = NATURE_BOOST
            mods[self.penalty] = NATURE_PENALTY
        return StatBlock(
            hp=mods[StatName.HP],
            atk=mods[StatName.ATK],
            def_=mods[StatName.DEF],
            spatk=mods[StatName.SPATK],
            spdef=mods[StatName.SPDEF],
            spe=mods[StatName.SPE],
        )


# fmt: off
NATURES: dict[str, Nature] = {n.name: n for n in [
    Nature("Hardy",   None,           None),
    Nature("Lonely",  StatName.ATK,   StatName.DEF),
    Nature("Brave",   StatName.ATK,   StatName.SPE),
    Nature("Adamant", StatName.ATK,   StatName.SPATK),
    Nature("Naughty", StatName.ATK,   StatName.SPDEF),
    Nature("Bold",    StatName.DEF,   StatName.ATK),
    Nature("Docile",  None,           None),
    Nature("Relaxed", StatName.DEF,   StatName.SPE),
    Nature("Impish",  StatName.DEF,   StatName.SPATK),
    Nature("Lax",     StatName.DEF,   StatName.SPDEF),
    Nature("Timid",   StatName.SPE,   StatName.ATK),
    Nature("Hasty",   StatName.SPE,   StatName.DEF),
    Nature("Serious", None,           None),
    Nature("Jolly",   StatName.SPE,   StatName.SPATK),
    Nature("Naive",   StatName.SPE,   StatName.SPDEF),
    Nature("Modest",  StatName.SPATK, StatName.ATK),
    Nature("Mild",    StatName.SPATK, StatName.DEF),
    Nature("Quiet",   StatName.SPATK, StatName.SPE),
    Nature("Bashful", None,           None),
    Nature("Rash",    StatName.SPATK, StatName.SPDEF),
    Nature("Calm",    StatName.SPDEF, StatName.ATK),
    Nature("Gentle",  StatName.SPDEF, StatName.DEF),
    Nature("Sassy",   StatName.SPDEF, StatName.SPE),
    Nature("Careful", StatName.SPDEF, StatName.SPATK),
    Nature("Quirky",  None,           None),
]}
# fmt: on


def get_nature(name: str) -> Nature:
    """Look up a nature by name (case-insensitive)."""
    key = name.capitalize()
    if key not in NATURES:
        raise ValueError(f"Natureza desconhecida: {name!r}")
    return NATURES[key]


def get_nature_modifiers(name: str) -> StatBlock:
    """Shortcut: return the modifier StatBlock for a nature name."""
    return get_nature(name).modifiers()
