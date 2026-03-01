"""Session persistence — save/load evaluation sessions as JSON."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from pokeevaluator.data.pokedex import get_base_stats
from pokeevaluator.models.pokemon import STAT_ORDER, StatBlock
from pokeevaluator.models.specimen import (
    CaughtPokemon,
    EvaluationResult,
    IVRange,
    IVSet,
)

SESSIONS_DIR = Path("./logs")


def _iv_range_str(iv_range: IVRange) -> str:
    if iv_range.exact:
        return str(iv_range.min_iv)
    return f"{iv_range.min_iv}-{iv_range.max_iv}"


def _serialize_result(result: EvaluationResult) -> dict:
    pokemon = result.pokemon
    ivs = result.ivs
    return {
        "species": pokemon.species,
        "level": pokemon.level,
        "nature": pokemon.nature,
        "gender": pokemon.gender,
        "ability": pokemon.ability,
        "role": result.role_name,
        "stats": {
            "hp": int(pokemon.observed.hp),
            "atk": int(pokemon.observed.atk),
            "def": int(pokemon.observed.def_),
            "spatk": int(pokemon.observed.spatk),
            "spdef": int(pokemon.observed.spdef),
            "spe": int(pokemon.observed.spe),
        },
        "ivs": {
            "hp": _iv_range_str(ivs.hp),
            "atk": _iv_range_str(ivs.atk),
            "def": _iv_range_str(ivs.def_),
            "spatk": _iv_range_str(ivs.spatk),
            "spdef": _iv_range_str(ivs.spdef),
            "spe": _iv_range_str(ivs.spe),
        },
        "quality_score": result.quality_score,
        "percentile": result.percentile,
        "nature_assessment": result.nature_assessment,
        "catches_for_90": result.catches_for_90,
        "catches_for_95": result.catches_for_95,
    }


def _parse_iv_range(stat_name, value: str) -> IVRange:
    from pokeevaluator.models.pokemon import StatName

    stat = StatName(stat_name)
    if "-" in value:
        lo, hi = value.split("-", 1)
        return IVRange(stat=stat, min_iv=int(lo), max_iv=int(hi))
    v = int(value)
    return IVRange(stat=stat, min_iv=v, max_iv=v)


_IV_FIELD_TO_STAT = {
    "hp": "hp",
    "atk": "atk",
    "def": "def_",
    "spatk": "spatk",
    "spdef": "spdef",
    "spe": "spe",
}


def _deserialize_result(data: dict) -> EvaluationResult:
    base_stats = get_base_stats(data["species"])
    observed = StatBlock(
        hp=float(data["stats"]["hp"]),
        atk=float(data["stats"]["atk"]),
        def_=float(data["stats"]["def"]),
        spatk=float(data["stats"]["spatk"]),
        spdef=float(data["stats"]["spdef"]),
        spe=float(data["stats"]["spe"]),
    )
    pokemon = CaughtPokemon(
        species=data["species"],
        level=data["level"],
        nature=data["nature"],
        base_stats=base_stats,
        observed=observed,
        gender=data.get("gender"),
        ability=data.get("ability"),
    )
    iv_data = data["ivs"]
    ivs = IVSet(
        hp=_parse_iv_range("hp", iv_data["hp"]),
        atk=_parse_iv_range("atk", iv_data["atk"]),
        def_=_parse_iv_range("def_", iv_data["def"]),
        spatk=_parse_iv_range("spatk", iv_data["spatk"]),
        spdef=_parse_iv_range("spdef", iv_data["spdef"]),
        spe=_parse_iv_range("spe", iv_data["spe"]),
    )
    return EvaluationResult(
        pokemon=pokemon,
        ivs=ivs,
        quality_score=data["quality_score"],
        percentile=data["percentile"],
        nature_assessment=data["nature_assessment"],
        role_name=data["role"],
        catches_for_90=data["catches_for_90"],
        catches_for_95=data["catches_for_95"],
    )


def save_session(results: list[EvaluationResult]) -> Path:
    """Save a list of evaluation results to a JSON log file."""
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.now()
    filename = f"session_{now.strftime('%Y-%m-%d_%H-%M-%S')}.json"
    filepath = SESSIONS_DIR / filename

    payload = {
        "timestamp": now.isoformat(timespec="seconds"),
        "evaluations": [_serialize_result(r) for r in results],
    }

    filepath.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return filepath


def list_sessions() -> list[dict]:
    """List saved sessions with summary info.

    Returns a list of dicts with keys: filename, timestamp, count, species.
    """
    if not SESSIONS_DIR.exists():
        return []

    sessions = []
    for path in sorted(SESSIONS_DIR.glob("session_*.json"), reverse=True):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        evals = data.get("evaluations", [])
        species_list = [e.get("species", "?") for e in evals]
        sessions.append({
            "filename": path.name,
            "timestamp": data.get("timestamp", "?"),
            "count": len(evals),
            "species": ", ".join(species_list),
        })

    return sessions


def load_session(session_id: str) -> list[EvaluationResult]:
    """Load a session by filename and reconstruct EvaluationResults.

    Raises FileNotFoundError if the session file does not exist.
    """
    # Try as-is first, then with .json suffix
    filepath = SESSIONS_DIR / session_id
    if not filepath.exists() and not session_id.endswith(".json"):
        filepath = SESSIONS_DIR / f"{session_id}.json"
    if not filepath.exists():
        raise FileNotFoundError(session_id)

    data = json.loads(filepath.read_text(encoding="utf-8"))
    return [_deserialize_result(e) for e in data.get("evaluations", [])]
