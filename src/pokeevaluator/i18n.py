"""Strings PT-BR para a interface."""

# Títulos e cabeçalhos
TITLE_EVALUATE = "Avaliação de Pokémon"
TITLE_POKEDEX = "Pokédex — Base Stats"
TITLE_ROLES = "Perfis de Role"
TITLE_NATURES = "Naturezas"

# Labels de stats
STAT_LABELS = {
    "hp": "HP",
    "atk": "Ataque",
    "def_": "Defesa",
    "spatk": "Atq. Esp.",
    "spdef": "Def. Esp.",
    "spe": "Velocidade",
}

STAT_ABBREV = {
    "hp": "HP",
    "atk": "Atk",
    "def_": "Def",
    "spatk": "SpA",
    "spdef": "SpD",
    "spe": "Spe",
}

NATURE_NEUTRAL_LABEL = "Neutra"

# Tabela de IVs
IV_TABLE_HEADER = "IVs Recuperados"
IV_COL_STAT = "Stat"
IV_COL_RANGE = "Faixa IV"
IV_COL_VALUE = "Valor"
IV_COL_QUALITY = "Qualidade"

# Qualidade
QUALITY_LABEL = "Score de Qualidade (Q)"
PERCENTILE_LABEL = "Percentil (Monte Carlo)"
NATURE_LABEL = "Natureza"
ROLE_LABEL = "Role"
NATURE_ASSESSMENT_LABEL = "Avaliação da Natureza"

# Planejamento
PLANNING_HEADER = "Planejamento de Capturas"
CATCHES_90 = "Capturas p/ 90% confiança"
CATCHES_95 = "Capturas p/ 95% confiança"

# Mensagens
MSG_EVALUATING = "Avaliando {species} (Lv.{level}, {nature})..."
MSG_SIMULATING = "Simulando distribuição Monte Carlo..."
MSG_NO_POKEMON = "Pokémon não encontrado."
MSG_INVALID_NATURE = "Natureza inválida."

# Modo interativo
INTERACTIVE_BANNER = "Modo Interativo — PokeEvaluator"
INTERACTIVE_HINT = "Tab = autocomplete · Enter vazio = voltar · Ctrl+D = sair"
PROMPT_SPECIES = "Espécie"
PROMPT_LEVEL = "Nível"
PROMPT_NATURE = "Natureza"
PROMPT_ROLE = "Role"
PROMPT_AGAIN = "Avaliar outro? (S/n)"
MSG_EXIT = "Até mais, treinador!"
MSG_BACK = "(voltando...)"
MSG_RETRY_STATS = "Revise os stats e tente novamente."

# Gênero e habilidade
PROMPT_GENDER = "Gênero (M/F/Enter = pular)"
PROMPT_ABILITY = "Habilidade"
GENDER_MALE = "♂"
GENDER_FEMALE = "♀"

# Comparativo
TITLE_COMPARISON = "Comparativo de Sessão"

# Histórico
TITLE_HISTORY = "Histórico de Sessões"
HISTORY_COL_DATE = "Data"
HISTORY_COL_COUNT = "Pokémon"
HISTORY_COL_SPECIES = "Espécies"
HISTORY_COL_FILE = "Arquivo"
MSG_SESSION_SAVED = "Sessão salva em {path}"
MSG_NO_SESSIONS = "Nenhuma sessão encontrada em ./logs/"
MSG_SESSION_NOT_FOUND = "Sessão não encontrada: {session_id}"
