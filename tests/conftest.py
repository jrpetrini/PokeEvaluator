"""Shared fixtures for tests."""

import pytest

from pokeevaluator.data.pokedex import get_base_stats
from pokeevaluator.data.natures import get_nature_modifiers
from pokeevaluator.models.pokemon import BaseStats, StatBlock


@pytest.fixture
def dugtrio_base() -> BaseStats:
    return get_base_stats("Dugtrio")


@pytest.fixture
def charizard_base() -> BaseStats:
    return get_base_stats("Charizard")


@pytest.fixture
def jolly_mods() -> StatBlock:
    return get_nature_modifiers("Jolly")


@pytest.fixture
def adamant_mods() -> StatBlock:
    return get_nature_modifiers("Adamant")


@pytest.fixture
def neutral_mods() -> StatBlock:
    return get_nature_modifiers("Hardy")
