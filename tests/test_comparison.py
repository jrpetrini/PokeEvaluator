"""Tests for the comparison table rendering."""

from __future__ import annotations

from io import StringIO

from rich.console import Console

from pokeevaluator.data.pokedex import get_base_stats
from pokeevaluator.models.pokemon import StatBlock, StatName
from pokeevaluator.models.specimen import (
    CaughtPokemon,
    EvaluationResult,
    IVRange,
    IVSet,
)
from pokeevaluator.ui import render_comparison, render_history


def _make_result(
    species: str = "Charizard",
    level: int = 36,
    nature: str = "Modest",
    gender: str | None = "♂",
    ability: str | None = "Blaze",
    q: float = 0.723,
    percentile: float = 64.2,
) -> EvaluationResult:
    base = get_base_stats(species)
    observed = StatBlock(hp=115.0, atk=70.0, def_=65.0, spatk=120.0, spdef=80.0, spe=95.0)
    pokemon = CaughtPokemon(
        species=species,
        level=level,
        nature=nature,
        base_stats=base,
        observed=observed,
        gender=gender,
        ability=ability,
    )
    ivs = IVSet(
        hp=IVRange(StatName.HP, 28, 31),
        atk=IVRange(StatName.ATK, 10, 12),
        def_=IVRange(StatName.DEF, 18, 20),
        spatk=IVRange(StatName.SPATK, 28, 31),
        spdef=IVRange(StatName.SPDEF, 20, 22),
        spe=IVRange(StatName.SPE, 25, 27),
    )
    return EvaluationResult(
        pokemon=pokemon,
        ivs=ivs,
        quality_score=q,
        percentile=percentile,
        nature_assessment="Excelente",
        role_name="Special Sweeper",
        catches_for_90=127,
        catches_for_95=289,
    )


def _capture_output(func, *args) -> str:
    """Capture Rich console output from a rendering function."""
    import pokeevaluator.ui as ui_module
    buf = StringIO()
    original_console = ui_module.console
    ui_module.console = Console(file=buf, force_terminal=True, width=120)
    try:
        func(*args)
    finally:
        ui_module.console = original_console
    return buf.getvalue()


class TestRenderComparison:
    def test_two_pokemon(self):
        results = [
            _make_result(species="Charizard", gender="♂", ability="Blaze"),
            _make_result(species="Pikachu", gender="♀", ability="Static", q=0.55, percentile=45.0),
        ]
        output = _capture_output(render_comparison, results)
        assert "Charizard" in output
        assert "Pikachu" in output
        assert "Comparativo" in output

    def test_contains_metrics(self):
        results = [
            _make_result(),
            _make_result(species="Pikachu", gender=None, ability="Static"),
        ]
        output = _capture_output(render_comparison, results)
        assert "Q Score" in output
        assert "Percentil" in output
        assert "Nat. Aval." in output

    def test_contains_iv_rows(self):
        results = [
            _make_result(),
            _make_result(species="Pikachu"),
        ]
        output = _capture_output(render_comparison, results)
        assert "HP IV" in output
        assert "Velocidade IV" in output

    def test_contains_planning(self):
        results = [
            _make_result(),
            _make_result(species="Pikachu"),
        ]
        output = _capture_output(render_comparison, results)
        assert "Capt. p/90%" in output
        assert "Capt. p/95%" in output

    def test_three_pokemon(self):
        results = [
            _make_result(species="Charizard"),
            _make_result(species="Pikachu"),
            _make_result(species="Gengar", gender="♀", ability="Levitate"),
        ]
        output = _capture_output(render_comparison, results)
        assert "Charizard" in output
        assert "Pikachu" in output
        assert "Gengar" in output


class TestRenderHistory:
    def test_render_history(self):
        sessions = [
            {"filename": "session_2026-03-01_14-30-00.json", "timestamp": "2026-03-01T14:30:00", "count": 3, "species": "Charizard, Pikachu, Gengar"},
            {"filename": "session_2026-03-01_10-00-00.json", "timestamp": "2026-03-01T10:00:00", "count": 1, "species": "Snorlax"},
        ]
        output = _capture_output(render_history, sessions)
        assert "Histórico" in output
        assert "Charizard" in output
        assert "Snorlax" in output
