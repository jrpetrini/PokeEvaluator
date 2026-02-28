"""Gen I evolution chains — maps every pre-evolution to its final form."""

from __future__ import annotations

# Lowercase keys → lowercase final evolution.
# Only entries where species != final evolution are needed.
_FINAL_EVOLUTION: dict[str, str] = {
    # Grass starters
    "bulbasaur": "venusaur",
    "ivysaur": "venusaur",
    # Fire starters
    "charmander": "charizard",
    "charmeleon": "charizard",
    # Water starters
    "squirtle": "blastoise",
    "wartortle": "blastoise",
    # Bug lines
    "caterpie": "butterfree",
    "metapod": "butterfree",
    "weedle": "beedrill",
    "kakuna": "beedrill",
    # Bird lines
    "pidgey": "pidgeot",
    "pidgeotto": "pidgeot",
    "spearow": "fearow",
    "doduo": "dodrio",
    # Rodent
    "rattata": "raticate",
    # Snake
    "ekans": "arbok",
    # Pikachu line
    "pikachu": "raichu",
    # Ground
    "sandshrew": "sandslash",
    "diglett": "dugtrio",
    "cubone": "marowak",
    "rhyhorn": "rhydon",
    # Nidoran lines
    "nidoran-f": "nidoqueen",
    "nidorina": "nidoqueen",
    "nidoran-m": "nidoking",
    "nidorino": "nidoking",
    # Fairy
    "clefairy": "clefable",
    "jigglypuff": "wigglytuff",
    # Fox
    "vulpix": "ninetales",
    # Bat
    "zubat": "golbat",
    # Grass
    "oddish": "vileplume",
    "gloom": "vileplume",
    "bellsprout": "victreebel",
    "weepinbell": "victreebel",
    "paras": "parasect",
    "exeggcute": "exeggutor",
    # Bug
    "venonat": "venomoth",
    # Cat
    "meowth": "persian",
    # Water misc
    "psyduck": "golduck",
    "poliwag": "poliwrath",
    "poliwhirl": "poliwrath",
    "tentacool": "tentacruel",
    "seel": "dewgong",
    "shellder": "cloyster",
    "krabby": "kingler",
    "horsea": "seadra",
    "goldeen": "seaking",
    "staryu": "starmie",
    "magikarp": "gyarados",
    "omanyte": "omastar",
    "kabuto": "kabutops",
    # Fighting
    "mankey": "primeape",
    "machop": "machamp",
    "machoke": "machamp",
    # Fire
    "growlithe": "arcanine",
    "ponyta": "rapidash",
    # Psychic
    "abra": "alakazam",
    "kadabra": "alakazam",
    "slowpoke": "slowbro",
    "drowzee": "hypno",
    # Rock
    "geodude": "golem",
    "graveler": "golem",
    # Electric
    "magnemite": "magneton",
    "voltorb": "electrode",
    # Poison
    "grimer": "muk",
    "koffing": "weezing",
    "gastly": "gengar",
    "haunter": "gengar",
    # Dragon
    "dratini": "dragonite",
    "dragonair": "dragonite",
    # Eevee → no single final form; omit (balanced fallback is fine)
}


def get_final_evolution(species: str) -> str:
    """Return the final evolution for *species* (lowercase).

    If the species is already a final/single-stage Pokémon (or has no
    single clear final form like Eevee), returns the species itself.
    """
    return _FINAL_EVOLUTION.get(species.lower(), species.lower())
