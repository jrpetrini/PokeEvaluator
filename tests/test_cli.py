"""Integration tests for the CLI."""

from typer.testing import CliRunner

from pokeevaluator.cli import app

runner = CliRunner()


class TestEvaluateCommand:
    def test_valid_pokemon(self):
        """Full evaluation should succeed."""
        result = runner.invoke(
            app,
            [
                "evaluate", "Dugtrio", "25", "Jolly",
                "--hp", "57", "--atk", "51", "--def", "33",
                "--spatk", "28", "--spdef", "44", "--spe", "79",
            ],
        )
        assert result.exit_code == 0
        assert "Dugtrio" in result.output
        assert "Jolly" in result.output
        assert "IVs Recuperados" in result.output

    def test_unknown_pokemon(self):
        """Unknown species should fail gracefully."""
        result = runner.invoke(
            app,
            [
                "evaluate", "Missingno", "25", "Hardy",
                "--hp", "50", "--atk", "50", "--def", "50",
                "--spatk", "50", "--spdef", "50", "--spe", "50",
            ],
        )
        assert result.exit_code == 1
        assert "desconhecido" in result.output

    def test_unknown_nature(self):
        """Unknown nature should fail gracefully."""
        result = runner.invoke(
            app,
            [
                "evaluate", "Pikachu", "25", "FakeNature",
                "--hp", "50", "--atk", "50", "--def", "50",
                "--spatk", "50", "--spdef", "50", "--spe", "50",
            ],
        )
        assert result.exit_code == 1
        assert "desconhecida" in result.output

    def test_case_insensitive_species(self):
        """Species lookup should be case-insensitive."""
        result = runner.invoke(
            app,
            [
                "evaluate", "dugtrio", "25", "Jolly",
                "--hp", "57", "--atk", "51", "--def", "33",
                "--spatk", "28", "--spdef", "44", "--spe", "79",
            ],
        )
        assert result.exit_code == 0


class TestPokedexCommand:
    def test_pokedex(self):
        result = runner.invoke(app, ["pokedex"])
        assert result.exit_code == 0
        assert "Pikachu" in result.output
        assert "Charizard" in result.output
        assert "Mew" in result.output


class TestRolesCommand:
    def test_roles(self):
        result = runner.invoke(app, ["roles"])
        assert result.exit_code == 0
        assert "Physical Sweeper" in result.output
        assert "Balanced" in result.output


class TestNaturesCommand:
    def test_natures(self):
        result = runner.invoke(app, ["natures"])
        assert result.exit_code == 0
        assert "Adamant" in result.output
        assert "Jolly" in result.output
