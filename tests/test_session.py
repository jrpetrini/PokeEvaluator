"""Tests for session persistence (save/load/list)."""

from __future__ import annotations

import json

import pytest

from pokeevaluator.data.pokedex import get_base_stats
from pokeevaluator.models.pokemon import StatBlock, StatName
from pokeevaluator.models.specimen import (
    CaughtPokemon,
    EvaluationResult,
    IVRange,
    IVSet,
)
from pokeevaluator.session import (
    SESSIONS_DIR,
    _deserialize_result,
    _serialize_result,
    list_sessions,
    load_session,
    save_session,
)


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


class TestSerialization:
    def test_serialize_roundtrip(self):
        """Serialize and deserialize should produce equivalent results."""
        original = _make_result()
        data = _serialize_result(original)
        restored = _deserialize_result(data)

        assert restored.pokemon.species == original.pokemon.species
        assert restored.pokemon.level == original.pokemon.level
        assert restored.pokemon.nature == original.pokemon.nature
        assert restored.pokemon.gender == original.pokemon.gender
        assert restored.pokemon.ability == original.pokemon.ability
        assert restored.quality_score == original.quality_score
        assert restored.percentile == original.percentile
        assert restored.nature_assessment == original.nature_assessment
        assert restored.role_name == original.role_name
        assert restored.catches_for_90 == original.catches_for_90
        assert restored.catches_for_95 == original.catches_for_95

    def test_serialize_ivs_roundtrip(self):
        original = _make_result()
        data = _serialize_result(original)
        restored = _deserialize_result(data)

        for stat in StatName:
            orig_iv = original.ivs[stat]
            rest_iv = restored.ivs[stat]
            assert rest_iv.min_iv == orig_iv.min_iv
            assert rest_iv.max_iv == orig_iv.max_iv

    def test_serialize_none_gender_ability(self):
        """None gender/ability should serialize and deserialize correctly."""
        original = _make_result(gender=None, ability=None)
        data = _serialize_result(original)
        assert data["gender"] is None
        assert data["ability"] is None
        restored = _deserialize_result(data)
        assert restored.pokemon.gender is None
        assert restored.pokemon.ability is None

    def test_json_valid(self):
        """Serialized data should be valid JSON."""
        result = _make_result()
        data = _serialize_result(result)
        json_str = json.dumps(data, ensure_ascii=False)
        parsed = json.loads(json_str)
        assert parsed["species"] == "Charizard"


class TestSaveLoadSession:
    def test_save_and_load(self, tmp_path, monkeypatch):
        """Save a session and load it back."""
        monkeypatch.setattr("pokeevaluator.session.SESSIONS_DIR", tmp_path)
        results = [_make_result(), _make_result(species="Pikachu", gender=None, ability="Static")]
        path = save_session(results)

        assert path.exists()
        loaded = load_session(path.name)
        assert len(loaded) == 2
        assert loaded[0].pokemon.species == "Charizard"
        assert loaded[1].pokemon.species == "Pikachu"

    def test_load_not_found(self, tmp_path, monkeypatch):
        monkeypatch.setattr("pokeevaluator.session.SESSIONS_DIR", tmp_path)
        with pytest.raises(FileNotFoundError):
            load_session("nonexistent.json")

    def test_load_without_json_suffix(self, tmp_path, monkeypatch):
        monkeypatch.setattr("pokeevaluator.session.SESSIONS_DIR", tmp_path)
        results = [_make_result()]
        path = save_session(results)
        # Load without .json
        stem = path.stem
        loaded = load_session(stem)
        assert len(loaded) == 1


class TestListSessions:
    def test_list_empty(self, tmp_path, monkeypatch):
        monkeypatch.setattr("pokeevaluator.session.SESSIONS_DIR", tmp_path)
        assert list_sessions() == []

    def test_list_sessions(self, tmp_path, monkeypatch):
        monkeypatch.setattr("pokeevaluator.session.SESSIONS_DIR", tmp_path)
        # Manually create two session files to avoid same-second collision
        import json
        (tmp_path / "session_2026-03-01_10-00-00.json").write_text(json.dumps({
            "timestamp": "2026-03-01T10:00:00",
            "evaluations": [_serialize_result(_make_result())],
        }))
        (tmp_path / "session_2026-03-01_14-30-00.json").write_text(json.dumps({
            "timestamp": "2026-03-01T14:30:00",
            "evaluations": [
                _serialize_result(_make_result()),
                _serialize_result(_make_result(species="Pikachu", gender=None, ability="Static")),
            ],
        }))

        sessions = list_sessions()
        assert len(sessions) == 2
        # Most recent first (reverse sorted)
        assert sessions[0]["count"] == 2
        assert sessions[1]["count"] == 1
