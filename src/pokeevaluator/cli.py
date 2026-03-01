"""CLI entry point — Typer commands."""

from __future__ import annotations

from typing import Optional

import typer
from rich.console import Console

from pokeevaluator import i18n, ui
from pokeevaluator.core.montecarlo import compute_percentile, simulate_q_distribution
from pokeevaluator.core.planning import catches_for_confidence
from pokeevaluator.core.quality import adjust_weights, assess_nature, compute_q
from pokeevaluator.core.stats import recover_all_ivs
from pokeevaluator.data.natures import get_nature
from pokeevaluator.data.pokedex import get_base_stats
from pokeevaluator.models.pokemon import StatBlock
from pokeevaluator.models.roles import get_species_role
from pokeevaluator.models.specimen import CaughtPokemon, EvaluationResult

app = typer.Typer(
    name="pokeval",
    help="Avaliador de qualidade de Pokémon recém-capturados (Gen III).",
    add_completion=False,
)
console = Console()


def _run_evaluate(
    species: str,
    level: int,
    nature: str,
    stats_dict: dict[str, int],
    role: str | None = None,
    gender: str | None = None,
    ability: str | None = None,
) -> EvaluationResult:
    """Core evaluation logic, reusable from CLI and interactive mode."""
    base_stats = get_base_stats(species)
    nature_obj = get_nature(nature)
    nature_mods = nature_obj.modifiers()

    observed = StatBlock(
        hp=float(stats_dict["hp"]),
        atk=float(stats_dict["atk"]),
        def_=float(stats_dict["def"]),
        spatk=float(stats_dict["spatk"]),
        spdef=float(stats_dict["spdef"]),
        spe=float(stats_dict["spe"]),
    )

    ivs = recover_all_ivs(base_stats, level, nature_mods, observed)

    # Get role
    if role:
        from pokeevaluator.models.roles import get_role
        role_profile = get_role(role)
    else:
        role_profile = get_species_role(species)

    weights = adjust_weights(role_profile.weights, base_stats)

    # Compute Q
    iv_arr = ivs.midpoint_block().to_array()
    nature_arr = nature_mods.to_array()
    weights_arr = weights.to_array()
    q = compute_q(iv_arr, nature_arr, weights_arr)

    # Monte Carlo percentile
    console.print(f"[dim]{i18n.MSG_SIMULATING}[/dim]")
    q_dist = simulate_q_distribution(weights)
    percentile = compute_percentile(q, q_dist)

    # Nature assessment
    nat_assessment = assess_nature(nature_mods, weights)

    # Planning
    p_single = percentile / 100.0
    p_better = 1.0 - p_single
    if p_better > 0:
        c90 = catches_for_confidence(p_better, 0.90)
        c95 = catches_for_confidence(p_better, 0.95)
    else:
        c90 = 1
        c95 = 1


    caught = CaughtPokemon(
        species=species.capitalize(),
        level=level,
        nature=nature_obj.name,
        base_stats=base_stats,
        observed=observed,
        gender=gender,
        ability=ability,
    )

    return EvaluationResult(
        pokemon=caught,
        ivs=ivs,
        quality_score=q,
        percentile=percentile,
        nature_assessment=nat_assessment,
        role_name=role_profile.name,
        catches_for_90=c90,
        catches_for_95=c95,
    )


@app.command()
def evaluate(
    species: str = typer.Argument(..., help="Nome do Pokémon"),
    level: int = typer.Argument(..., help="Nível do Pokémon"),
    nature: str = typer.Argument(..., help="Natureza do Pokémon"),
    hp: int = typer.Option(..., "--hp", help="HP observado"),
    atk: int = typer.Option(..., "--atk", help="Ataque observado"),
    def_: int = typer.Option(..., "--def", help="Defesa observada"),
    spatk: int = typer.Option(..., "--spatk", help="Atq. Esp. observado"),
    spdef: int = typer.Option(..., "--spdef", help="Def. Esp. observada"),
    spe: int = typer.Option(..., "--spe", help="Velocidade observada"),
    role: Optional[str] = typer.Option(None, "--role", help="Role override"),
    gender: Optional[str] = typer.Option(None, "--gender", help="Gênero (♂/♀)"),
    ability: Optional[str] = typer.Option(None, "--ability", help="Habilidade"),
) -> None:
    """Avaliar um Pokémon recém-capturado."""
    stats_dict = {
        "hp": hp, "atk": atk, "def": def_,
        "spatk": spatk, "spdef": spdef, "spe": spe,
    }
    try:
        result = _run_evaluate(species, level, nature, stats_dict, role, gender, ability)
    except ValueError as e:
        console.print(f"[red]{e}[/red]")
        raise typer.Exit(1)
    ui.render_evaluation(result)


@app.command()
def pokedex() -> None:
    """Listar Pokémon disponíveis e seus base stats."""
    ui.render_pokedex()


@app.command()
def roles() -> None:
    """Listar perfis de role disponíveis."""
    ui.render_roles()


@app.command()
def natures() -> None:
    """Listar todas as naturezas e seus modificadores."""
    ui.render_natures()


@app.command()
def history(
    session_id: Optional[str] = typer.Argument(None, help="Arquivo ou índice da sessão"),
) -> None:
    """Ver histórico de sessões ou detalhe de uma sessão."""
    from pokeevaluator.session import list_sessions, load_session

    if session_id is None:
        sessions = list_sessions()
        if not sessions:
            console.print(f"[yellow]{i18n.MSG_NO_SESSIONS}[/yellow]")
            return
        ui.render_history(sessions)
    else:
        try:
            results = load_session(session_id)
        except FileNotFoundError:
            console.print(f"[red]{i18n.MSG_SESSION_NOT_FOUND.format(session_id=session_id)}[/red]")
            raise typer.Exit(1)
        if len(results) >= 2:
            ui.render_comparison(results)
        elif len(results) == 1:
            ui.render_evaluation(results[0])
        else:
            console.print("[yellow]Sessão vazia.[/yellow]")


@app.command()
def interactive() -> None:
    """Modo interativo com autocomplete."""
    from pokeevaluator.interactive import run

    run()


if __name__ == "__main__":
    app()
