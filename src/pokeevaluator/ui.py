"""Rich rendering — tables, panels, quality bar."""

from __future__ import annotations

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from pokeevaluator import i18n
from pokeevaluator.data.natures import NATURES, Nature
from pokeevaluator.data.pokedex import POKEDEX
from pokeevaluator.models.pokemon import STAT_ORDER, StatName
from pokeevaluator.models.roles import ROLES, RoleProfile
from pokeevaluator.models.specimen import EvaluationResult, IVSet
from pokeevaluator.core.quality import assess_iv

console = Console()


def _stat_label(stat: StatName) -> str:
    return i18n.STAT_LABELS[stat.value]


def _iv_color(iv: int) -> str:
    if iv >= 28:
        return "green"
    elif iv >= 20:
        return "cyan"
    elif iv >= 10:
        return "yellow"
    else:
        return "red"


def _quality_bar(q: float, width: int = 30) -> Text:
    """Render a colored quality bar."""
    filled = int(q * width)
    if q >= 0.8:
        color = "green"
    elif q >= 0.6:
        color = "cyan"
    elif q >= 0.4:
        color = "yellow"
    else:
        color = "red"
    bar = Text()
    bar.append("█" * filled, style=color)
    bar.append("░" * (width - filled), style="dim")
    bar.append(f" {q * 100:.1f}%", style="bold " + color)
    return bar


def render_iv_table(ivs: IVSet) -> Table:
    """Render a table of recovered IVs."""
    table = Table(title=i18n.IV_TABLE_HEADER, show_header=True)
    table.add_column(i18n.IV_COL_STAT, style="bold")
    table.add_column(i18n.IV_COL_RANGE, justify="center")
    table.add_column(i18n.IV_COL_VALUE, justify="center")
    table.add_column(i18n.IV_COL_QUALITY, justify="center")

    for stat in STAT_ORDER:
        iv_range = ivs[stat]
        if iv_range.exact:
            range_str = str(iv_range.min_iv)
        else:
            range_str = f"{iv_range.min_iv}-{iv_range.max_iv}"

        val = iv_range.value
        color = _iv_color(val)
        quality = assess_iv(val)

        table.add_row(
            _stat_label(stat),
            range_str,
            f"[{color}]{val}[/{color}]",
            f"[{color}]{quality}[/{color}]",
        )
    return table


def render_evaluation(result: EvaluationResult) -> None:
    """Render the full evaluation output."""
    pokemon = result.pokemon
    console.print()
    console.rule(f"[bold]{pokemon.species}[/bold] — Lv.{pokemon.level} ({pokemon.nature})")
    console.print()

    # IV table
    console.print(render_iv_table(result.ivs))
    console.print()

    # Quality panel
    q_bar = _quality_bar(result.quality_score)
    lines = Text()
    lines.append(f"{i18n.QUALITY_LABEL}: ")
    lines.append_text(q_bar)
    lines.append(f"\n{i18n.PERCENTILE_LABEL}: ")
    lines.append(f"{result.percentile:.1f}%", style="bold")
    lines.append(f"\n{i18n.ROLE_LABEL}: ")
    lines.append(result.role_name, style="bold cyan")
    lines.append(f"\n{i18n.NATURE_ASSESSMENT_LABEL}: ")
    lines.append(result.nature_assessment, style="bold")

    console.print(Panel(lines, title=i18n.TITLE_EVALUATE, border_style="blue"))
    console.print()

    # Planning panel
    planning = Table(title=i18n.PLANNING_HEADER, show_header=False)
    planning.add_column("Métrica", style="bold")
    planning.add_column("Valor", justify="right")
    planning.add_row(i18n.CATCHES_90, str(result.catches_for_90))
    planning.add_row(i18n.CATCHES_95, str(result.catches_for_95))
    console.print(planning)
    console.print()


def render_pokedex() -> None:
    """Render the Pokédex table."""
    table = Table(title=i18n.TITLE_POKEDEX, show_header=True)
    table.add_column("Pokémon", style="bold")
    table.add_column("HP", justify="right")
    table.add_column("Atk", justify="right")
    table.add_column("Def", justify="right")
    table.add_column("SpAtk", justify="right")
    table.add_column("SpDef", justify="right")
    table.add_column("Spe", justify="right")
    table.add_column("Total", justify="right", style="bold")

    for name, stats in sorted(POKEDEX.items()):
        total = stats.hp + stats.atk + stats.def_ + stats.spatk + stats.spdef + stats.spe
        table.add_row(
            name,
            str(stats.hp),
            str(stats.atk),
            str(stats.def_),
            str(stats.spatk),
            str(stats.spdef),
            str(stats.spe),
            str(total),
        )

    console.print(table)


def render_roles() -> None:
    """Render the roles table."""
    table = Table(title=i18n.TITLE_ROLES, show_header=True)
    table.add_column("Role", style="bold")
    table.add_column("Descrição")
    table.add_column("HP", justify="right")
    table.add_column("Atk", justify="right")
    table.add_column("Def", justify="right")
    table.add_column("SpAtk", justify="right")
    table.add_column("SpDef", justify="right")
    table.add_column("Spe", justify="right")

    for role in ROLES.values():
        w = role.weights
        table.add_row(
            role.name,
            role.description,
            f"{w.hp:.1f}",
            f"{w.atk:.1f}",
            f"{w.def_:.1f}",
            f"{w.spatk:.1f}",
            f"{w.spdef:.1f}",
            f"{w.spe:.1f}",
        )

    console.print(table)


def render_natures() -> None:
    """Render the natures table."""
    table = Table(title=i18n.TITLE_NATURES, show_header=True)
    table.add_column("Natureza", style="bold")
    table.add_column("Boost", style="green")
    table.add_column("Penalty", style="red")

    for nature in NATURES.values():
        boost = _stat_label(nature.boost) if nature.boost else "—"
        penalty = _stat_label(nature.penalty) if nature.penalty else "—"
        table.add_row(nature.name, boost, penalty)

    console.print(table)
