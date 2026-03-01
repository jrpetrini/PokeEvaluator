"""Specimen-level models: IV ranges, caught Pokémon, evaluation results."""

from __future__ import annotations

from dataclasses import dataclass

from pokeevaluator.models.pokemon import BaseStats, StatBlock, StatName


@dataclass(frozen=True, slots=True)
class IVRange:
    """Possible IV range for a single stat."""

    stat: StatName
    min_iv: int
    max_iv: int

    @property
    def exact(self) -> bool:
        return self.min_iv == self.max_iv

    @property
    def value(self) -> int:
        """Return the IV if exact, otherwise the midpoint."""
        return self.min_iv if self.exact else (self.min_iv + self.max_iv) // 2


@dataclass(frozen=True, slots=True)
class IVSet:
    """Complete set of recovered IVs (as ranges)."""

    hp: IVRange
    atk: IVRange
    def_: IVRange
    spatk: IVRange
    spdef: IVRange
    spe: IVRange

    def __getitem__(self, stat: StatName) -> IVRange:
        return {
            StatName.HP: self.hp,
            StatName.ATK: self.atk,
            StatName.DEF: self.def_,
            StatName.SPATK: self.spatk,
            StatName.SPDEF: self.spdef,
            StatName.SPE: self.spe,
        }[stat]

    def midpoint_block(self) -> StatBlock:
        """StatBlock of midpoint IV values."""
        return StatBlock(
            hp=float(self.hp.value),
            atk=float(self.atk.value),
            def_=float(self.def_.value),
            spatk=float(self.spatk.value),
            spdef=float(self.spdef.value),
            spe=float(self.spe.value),
        )


@dataclass(frozen=True, slots=True)
class CaughtPokemon:
    """A freshly caught Pokémon with observed stats."""

    species: str
    level: int
    nature: str
    base_stats: BaseStats
    observed: StatBlock
    gender: str | None = None     # "♂", "♀", or None
    ability: str | None = None    # Ability name or None


@dataclass(frozen=True, slots=True)
class EvaluationResult:
    """Full evaluation output."""

    pokemon: CaughtPokemon
    ivs: IVSet
    quality_score: float  # Q in [0, 1]
    percentile: float  # Monte Carlo percentile [0, 100]
    nature_assessment: str
    role_name: str
    # Planning
    catches_for_90: int
    catches_for_95: int
