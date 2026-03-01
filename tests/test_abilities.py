"""Tests for abilities data and lookup."""

from pokeevaluator.data.abilities import ABILITIES, get_abilities


class TestAbilitiesData:
    def test_all_species_have_abilities(self):
        """Every entry should have at least one ability."""
        for species, abilities in ABILITIES.items():
            assert len(abilities) >= 1, f"{species} has no abilities"

    def test_single_ability_species(self):
        assert get_abilities("Charizard") == ("Blaze",)
        assert get_abilities("Pikachu") == ("Static",)

    def test_dual_ability_species(self):
        abilities = get_abilities("Alakazam")
        assert abilities == ("Synchronize", "Inner Focus")

    def test_gengar_levitate(self):
        assert get_abilities("Gengar") == ("Levitate",)


class TestGetAbilities:
    def test_case_insensitive(self):
        assert get_abilities("charizard") == ("Blaze",)
        assert get_abilities("CHARIZARD") == ("Blaze",)
        assert get_abilities("ChArIzArD") == ("Blaze",)

    def test_unknown_species_returns_empty(self):
        assert get_abilities("Missingno") == ()
        assert get_abilities("") == ()

    def test_nidoran_variants(self):
        assert len(get_abilities("Nidoran-F")) >= 1
        assert len(get_abilities("Nidoran-M")) >= 1
