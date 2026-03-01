"""Modo interativo com autocomplete fuzzy via prompt_toolkit."""

from __future__ import annotations

from prompt_toolkit import prompt as pt_prompt
from prompt_toolkit.application import Application
from prompt_toolkit.completion import FuzzyWordCompleter
from prompt_toolkit.formatted_text import HTML
from prompt_toolkit.key_binding import KeyBindings
from prompt_toolkit.layout import HSplit, Layout
from prompt_toolkit.widgets import Dialog, Label, RadioList
from rich.console import Console
from rich.panel import Panel

from pokeevaluator import i18n, ui
from pokeevaluator.ui import _nature_summary
from pokeevaluator.cli import _run_evaluate
from pokeevaluator.data.abilities import get_abilities
from pokeevaluator.data.natures import NATURES
from pokeevaluator.data.pokedex import POKEDEX
from pokeevaluator.models.roles import ROLES, get_species_role
from pokeevaluator.models.specimen import EvaluationResult
from pokeevaluator.session import save_session

console = Console()

_SPECIES_COMPLETER = FuzzyWordCompleter(sorted(POKEDEX.keys()))
_NATURE_COMPLETER = FuzzyWordCompleter(sorted(NATURES.keys()))

def _stars(w: float) -> str:
    """Convert a weight to a star rating."""
    if w >= 0.7:
        return "★★★"
    elif w >= 0.45:
        return "★★☆"
    else:
        return "★☆☆"


def _role_label(r) -> str:
    """Build a display label with stat priorities for a role."""
    w = r.weights
    parts = [
        f"HP {_stars(w.hp)}",
        f"Atk {_stars(w.atk)}",
        f"Def {_stars(w.def_)}",
        f"SpAtk {_stars(w.spatk)}",
        f"SpDef {_stars(w.spdef)}",
        f"Spe {_stars(w.spe)}",
    ]
    return f"{r.name} — {' · '.join(parts)}"


_AUTO_ROLE_KEY = "__auto__"

_STAT_KEYS = ("hp", "atk", "def", "spatk", "spdef", "spe")
_STAT_PROMPTS = {
    "hp": i18n.STAT_LABELS["hp"],
    "atk": i18n.STAT_LABELS["atk"],
    "def": i18n.STAT_LABELS["def_"],
    "spatk": i18n.STAT_LABELS["spatk"],
    "spdef": i18n.STAT_LABELS["spdef"],
    "spe": i18n.STAT_LABELS["spe"],
}


class _GoBack(Exception):
    """Signal to go back one step."""


class _ExitInteractive(Exception):
    """Signal to exit the interactive loop."""


def _ask(label: str, *, completer: FuzzyWordCompleter | None = None) -> str:
    """Prompt the user; empty input or Ctrl+C raises _GoBack, Ctrl+D raises _ExitInteractive."""
    try:
        answer = pt_prompt(f" {label}: ", completer=completer).strip()
    except KeyboardInterrupt:
        raise _GoBack
    except EOFError:
        raise _ExitInteractive
    if not answer:
        raise _GoBack
    return answer


def _ask_optional(label: str, *, completer: FuzzyWordCompleter | None = None) -> str | None:
    """Prompt the user; empty input returns None, Ctrl+C raises _GoBack, Ctrl+D raises _ExitInteractive."""
    try:
        answer = pt_prompt(f" {label}: ", completer=completer).strip()
    except KeyboardInterrupt:
        raise _GoBack
    except EOFError:
        raise _ExitInteractive
    return answer if answer else None


def _ask_int(label: str, *, lo: int = 0, hi: int | None = None) -> int:
    """Prompt for an integer within bounds."""
    while True:
        raw = _ask(label)
        try:
            val = int(raw)
        except ValueError:
            console.print(f"  [red]Valor inválido (esperado número inteiro)[/red]")
            continue
        if val < lo or (hi is not None and val > hi):
            bound = f"{lo}–{hi}" if hi is not None else f">= {lo}"
            console.print(f"  [red]Fora do intervalo ({bound})[/red]")
            continue
        return val


def _build_role_choices(species: str) -> list[tuple[str, str]]:
    """Build role choices with a dynamic Auto label showing the suggested role."""
    suggested = get_species_role(species)
    auto_label = f"Auto \u2192 {suggested.name} (baseado na esp\u00e9cie)"
    return [
        (_AUTO_ROLE_KEY, auto_label),
        *((key, _role_label(r)) for key, r in ROLES.items()),
    ]


def _ask_role(species: str) -> str | None:
    """Show a radiolist dialog for role selection. Returns role key or None for auto.

    Enter confirms immediately, Escape/Ctrl+D exits.
    """
    choices = _build_role_choices(species)
    radio = RadioList(values=choices, default=_AUTO_ROLE_KEY)

    # Patch Enter on the RadioList control: select the item AND submit.
    # prompt_toolkit picks matches[-1], so our binding must come LAST.
    # We also mark it eager so it takes priority over prefix matches.
    original_kb = radio.control.key_bindings

    extra_kb = KeyBindings()

    @extra_kb.add("enter", eager=True)
    def _enter_confirm(event) -> None:
        radio._handle_enter()
        event.app.exit(result=radio.current_value)

    from prompt_toolkit.key_binding import merge_key_bindings

    radio.control.key_bindings = merge_key_bindings([original_kb, extra_kb])

    hint = Label(text="  \u2191\u2193 navegar \u00b7 Enter confirmar \u00b7 Esc/Ctrl+D sair")
    body = HSplit([radio, hint], padding=1)
    dialog = Dialog(title=i18n.PROMPT_ROLE, body=body, with_background=True)

    # Global bindings: Escape and Ctrl+D cancel.
    global_kb = KeyBindings()

    @global_kb.add("escape")
    @global_kb.add("c-d")
    def _cancel(event) -> None:
        event.app.exit(result=None)

    app: Application[str | None] = Application(
        layout=Layout(dialog),
        key_bindings=global_kb,
        mouse_support=True,
        full_screen=True,
    )

    result = app.run()
    if result is None:
        raise _ExitInteractive
    return None if result == _AUTO_ROLE_KEY else result


def _ask_gender() -> str | None:
    """Prompt for gender. Returns '♂', '♀', or None."""
    raw = _ask_optional(i18n.PROMPT_GENDER)
    if raw is None:
        return None
    raw = raw.strip().lower()
    if raw in ("m", "♂", "macho", "male"):
        return i18n.GENDER_MALE
    elif raw in ("f", "♀", "fêmea", "femea", "female"):
        return i18n.GENDER_FEMALE
    elif raw in ("-", "—", "n/a", "none"):
        return None
    return None


def _ask_ability(species: str) -> str | None:
    """Prompt for ability, auto-selecting if only one option exists."""
    abilities = get_abilities(species)
    if not abilities:
        return None
    if len(abilities) == 1:
        console.print(f"  [dim]{i18n.PROMPT_ABILITY}: {abilities[0]}[/dim]")
        return abilities[0]

    # Two abilities — show RadioList
    choices = [(a, a) for a in abilities]
    choices.append(("__skip__", "Pular (Enter = pular)"))
    radio = RadioList(values=choices, default=abilities[0])

    original_kb = radio.control.key_bindings
    extra_kb = KeyBindings()

    @extra_kb.add("enter", eager=True)
    def _enter_confirm(event) -> None:
        radio._handle_enter()
        event.app.exit(result=radio.current_value)

    from prompt_toolkit.key_binding import merge_key_bindings

    radio.control.key_bindings = merge_key_bindings([original_kb, extra_kb])

    hint = Label(text="  ↑↓ navegar · Enter confirmar · Esc/Ctrl+D sair")
    body = HSplit([radio, hint], padding=1)
    dialog = Dialog(title=i18n.PROMPT_ABILITY, body=body, with_background=True)

    global_kb = KeyBindings()

    @global_kb.add("escape")
    @global_kb.add("c-d")
    def _cancel(event) -> None:
        event.app.exit(result=None)

    app: Application[str | None] = Application(
        layout=Layout(dialog),
        key_bindings=global_kb,
        mouse_support=True,
        full_screen=True,
    )

    result = app.run()
    if result is None:
        raise _ExitInteractive
    return None if result == "__skip__" else result


def _banner() -> None:
    console.print()
    console.print(
        Panel(
            f"[bold cyan]{i18n.INTERACTIVE_BANNER}[/bold cyan]\n"
            f"[dim]{i18n.INTERACTIVE_HINT}[/dim]",
            border_style="cyan",
        )
    )
    console.print()


def _finish_session(session_results: list[EvaluationResult]) -> None:
    """Show comparison table and save session log."""
    if len(session_results) >= 2:
        ui.render_comparison(session_results)
    if len(session_results) >= 1:
        path = save_session(session_results)
        console.print(f"[dim]{i18n.MSG_SESSION_SAVED.format(path=path)}[/dim]")
    console.print(f"[cyan]{i18n.MSG_EXIT}[/cyan]")


def run() -> None:  # noqa: C901
    """Main interactive loop."""
    _banner()
    session_results: list[EvaluationResult] = []

    while True:
        # --- Step 0: Species ---
        try:
            species = _ask(i18n.PROMPT_SPECIES, completer=_SPECIES_COMPLETER)
        except _GoBack:
            # At the first step, ask whether to exit
            try:
                ans = pt_prompt(f" {i18n.MSG_EXIT} (S/n): ").strip().lower()
            except (KeyboardInterrupt, EOFError):
                console.print()
                _finish_session(session_results)
                return
            if ans in ("", "s", "sim"):
                _finish_session(session_results)
                return
            continue
        except _ExitInteractive:
            console.print()
            _finish_session(session_results)
            return

        # --- Step 1: Level ---
        try:
            level = _ask_int(i18n.PROMPT_LEVEL, lo=1, hi=100)
        except _GoBack:
            console.print(f"  [dim]{i18n.MSG_BACK}[/dim]")
            continue
        except _ExitInteractive:
            console.print()
            _finish_session(session_results)
            return

        # --- Step 2: Nature ---
        try:
            nature = _ask(i18n.PROMPT_NATURE, completer=_NATURE_COMPLETER)
        except _GoBack:
            console.print(f"  [dim]{i18n.MSG_BACK}[/dim]")
            continue
        except _ExitInteractive:
            console.print()
            _finish_session(session_results)
            return
        if nature.capitalize() in NATURES:
            console.print(f"  [dim]{_nature_summary(nature.capitalize())}[/dim]")

        # --- Step 2b: Gender ---
        try:
            gender = _ask_gender()
        except _GoBack:
            console.print(f"  [dim]{i18n.MSG_BACK}[/dim]")
            continue
        except _ExitInteractive:
            console.print()
            _finish_session(session_results)
            return

        # --- Step 2c: Ability ---
        try:
            ability = _ask_ability(species)
        except _GoBack:
            console.print(f"  [dim]{i18n.MSG_BACK}[/dim]")
            continue
        except _ExitInteractive:
            console.print()
            _finish_session(session_results)
            return

        # --- Step 3: Role ---
        try:
            role = _ask_role(species)
        except _GoBack:
            console.print(f"  [dim]{i18n.MSG_BACK}[/dim]")
            continue
        except _ExitInteractive:
            console.print()
            _finish_session(session_results)
            return

        # --- Step 4: Stats + Evaluate (retry stats on invalid values) ---
        result = None
        while result is None:
            stats: dict[str, int] = {}
            stat_aborted = False
            for key in _STAT_KEYS:
                try:
                    stats[key] = _ask_int(_STAT_PROMPTS[key], lo=0)
                except _GoBack:
                    console.print(f"  [dim]{i18n.MSG_BACK}[/dim]")
                    stat_aborted = True
                    break
                except _ExitInteractive:
                    console.print()
                    _finish_session(session_results)
                    return
            if stat_aborted:
                break

            try:
                result = _run_evaluate(species, level, nature, stats, role, gender, ability)
            except ValueError as e:
                console.print(f"  [red]{e}[/red]")
                console.print(f"  [yellow]{i18n.MSG_RETRY_STATS}[/yellow]")
        if stat_aborted:
            continue

        ui.render_evaluation(result)
        session_results.append(result)

        # --- Again? ---
        try:
            again = pt_prompt(f" {i18n.PROMPT_AGAIN} ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            console.print()
            _finish_session(session_results)
            return
        if again in ("n", "nao", "não", "no"):
            _finish_session(session_results)
            return
