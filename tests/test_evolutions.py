"""Tests for evolution chain lookups and role inheritance."""

from pokeevaluator.data.evolutions import get_final_evolution
from pokeevaluator.models.roles import get_species_role


class TestGetFinalEvolution:
    def test_pre_evolution(self):
        assert get_final_evolution("charmander") == "charizard"

    def test_already_final(self):
        assert get_final_evolution("charizard") == "charizard"

    def test_single_stage(self):
        assert get_final_evolution("tauros") == "tauros"

    def test_middle_of_chain(self):
        assert get_final_evolution("charmeleon") == "charizard"

    def test_case_insensitive(self):
        assert get_final_evolution("Charmander") == "charizard"
        assert get_final_evolution("PIDGEY") == "pidgeot"


class TestRoleInheritance:
    def test_pre_evolution_inherits_role(self):
        """Charmander should inherit Charizard's special_sweeper role."""
        role = get_species_role("Charmander")
        assert role.name == "Special Sweeper"

    def test_final_evolution_role(self):
        role = get_species_role("Charizard")
        assert role.name == "Special Sweeper"

    def test_unmapped_species_gets_balanced(self):
        role = get_species_role("Tauros")
        assert role.name == "Balanced"

    def test_pre_evolution_of_mapped_species(self):
        """Diglett should inherit Dugtrio's physical_sweeper role."""
        role = get_species_role("Diglett")
        assert role.name == "Physical Sweeper"
