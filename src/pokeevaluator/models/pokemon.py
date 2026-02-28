"""Core Pokémon data structures."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Iterator

import numpy as np
from numpy.typing import NDArray


class StatName(Enum):
    HP = "hp"
    ATK = "atk"
    DEF = "def_"
    SPATK = "spatk"
    SPDEF = "spdef"
    SPE = "spe"


# Ordered list for consistent array indexing
STAT_ORDER: list[StatName] = list(StatName)
STAT_COUNT = len(STAT_ORDER)


@dataclass(frozen=True, slots=True)
class BaseStats:
    """Base stats for a Pokémon species."""

    hp: int
    atk: int
    def_: int
    spatk: int
    spdef: int
    spe: int

    def to_array(self) -> NDArray[np.int32]:
        return np.array(
            [self.hp, self.atk, self.def_, self.spatk, self.spdef, self.spe],
            dtype=np.int32,
        )

    def __getitem__(self, stat: StatName) -> int:
        return {
            StatName.HP: self.hp,
            StatName.ATK: self.atk,
            StatName.DEF: self.def_,
            StatName.SPATK: self.spatk,
            StatName.SPDEF: self.spdef,
            StatName.SPE: self.spe,
        }[stat]


@dataclass(frozen=True, slots=True)
class StatBlock:
    """Generic 6-stat block — used for IVs, observed stats, weights, nature mods."""

    hp: float
    atk: float
    def_: float
    spatk: float
    spdef: float
    spe: float

    def to_array(self) -> NDArray[np.float64]:
        return np.array(
            [self.hp, self.atk, self.def_, self.spatk, self.spdef, self.spe],
            dtype=np.float64,
        )

    @classmethod
    def from_array(cls, arr: NDArray) -> StatBlock:
        return cls(
            hp=float(arr[0]),
            atk=float(arr[1]),
            def_=float(arr[2]),
            spatk=float(arr[3]),
            spdef=float(arr[4]),
            spe=float(arr[5]),
        )

    @classmethod
    def uniform(cls, value: float) -> StatBlock:
        return cls(hp=value, atk=value, def_=value, spatk=value, spdef=value, spe=value)

    def __getitem__(self, stat: StatName) -> float:
        return {
            StatName.HP: self.hp,
            StatName.ATK: self.atk,
            StatName.DEF: self.def_,
            StatName.SPATK: self.spatk,
            StatName.SPDEF: self.spdef,
            StatName.SPE: self.spe,
        }[stat]

    def __iter__(self) -> Iterator[tuple[StatName, float]]:
        for stat in STAT_ORDER:
            yield stat, self[stat]
