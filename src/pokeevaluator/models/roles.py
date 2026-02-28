"""Role profiles — stat weight distributions for quality evaluation."""

from __future__ import annotations

from dataclasses import dataclass

from pokeevaluator.data.evolutions import get_final_evolution
from pokeevaluator.models.pokemon import StatBlock


@dataclass(frozen=True, slots=True)
class RoleProfile:
    name: str
    description: str
    weights: StatBlock


# Pre-defined role profiles
ROLES: dict[str, RoleProfile] = {
    "physical_sweeper": RoleProfile(
        name="Physical Sweeper",
        description="Ataque físico + velocidade",
        weights=StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.3, spdef=0.5, spe=0.8),
    ),
    "special_sweeper": RoleProfile(
        name="Special Sweeper",
        description="Ataque especial + velocidade",
        weights=StatBlock(hp=0.5, atk=0.3, def_=0.5, spatk=0.8, spdef=0.5, spe=0.8),
    ),
    "physical_tank": RoleProfile(
        name="Physical Tank",
        description="HP + defesa física",
        weights=StatBlock(hp=0.8, atk=0.5, def_=0.8, spatk=0.3, spdef=0.5, spe=0.3),
    ),
    "special_tank": RoleProfile(
        name="Special Tank",
        description="HP + defesa especial",
        weights=StatBlock(hp=0.8, atk=0.3, def_=0.5, spatk=0.5, spdef=0.8, spe=0.3),
    ),
    "mixed_attacker": RoleProfile(
        name="Mixed Attacker",
        description="Ataque físico + especial + velocidade",
        weights=StatBlock(hp=0.5, atk=0.8, def_=0.5, spatk=0.8, spdef=0.5, spe=0.8),
    ),
    "balanced": RoleProfile(
        name="Balanced",
        description="Todos os stats com peso igual",
        weights=StatBlock(hp=0.5, atk=0.5, def_=0.5, spatk=0.5, spdef=0.5, spe=0.5),
    ),
}

# Default species -> role mapping (lowercase keys)
_SPECIES_ROLES: dict[str, str] = {
    "dugtrio": "physical_sweeper",
    "poliwrath": "physical_tank",
    "jolteon": "special_sweeper",
    "dodrio": "physical_sweeper",
    "snorlax": "special_tank",
    "charizard": "special_sweeper",
}


def get_role(name: str) -> RoleProfile:
    """Get a role profile by key."""
    if name not in ROLES:
        raise ValueError(f"Role desconhecida: {name!r}. Disponíveis: {', '.join(sorted(ROLES))}")
    return ROLES[name]


def get_species_role(species: str) -> RoleProfile:
    """Get the default role for a species, falling back to balanced.

    Pre-evolutions inherit the role of their final evolution
    (e.g. Charmander → Charizard → special_sweeper).
    """
    final = get_final_evolution(species)
    role_key = _SPECIES_ROLES.get(final, "balanced")
    return ROLES[role_key]
