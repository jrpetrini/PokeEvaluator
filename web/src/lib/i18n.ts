"use client";

import { createContext, useContext } from "react";

export type Locale = "pt-BR" | "en";

export interface Messages {
  // Navigation
  nav: {
    evaluator: string;
    pokedex: string;
    natures: string;
    methodology: string;
  };
  // Evaluator form
  form: {
    species: string;
    level: string;
    nature: string;
    evaluate: string;
    freshCatchWarning: string;
    speciesPlaceholder: string;
    naturePlaceholder: string;
    rolePlaceholder: string;
    suggestedRole: string;
    default: string;
  };
  // Tooltips
  tooltips: {
    freshCatch: string;
    species: string;
    level: string;
    nature: string;
    role: string;
    stats: string;
    ivTable: string;
    qualityScore: string;
    percentile: string;
    natureAssessment: string;
    catchPlanning: string;
  };
  // Stats
  stats: {
    hp: string;
    atk: string;
    def: string;
    spatk: string;
    spdef: string;
    spe: string;
  };
  statsAbbrev: {
    hp: string;
    atk: string;
    def: string;
    spatk: string;
    spdef: string;
    spe: string;
  };
  // Results
  results: {
    title: string;
    qualityScore: string;
    percentile: string;
    role: string;
    natureAssessment: string;
    ivTableTitle: string;
    ivColStat: string;
    ivColRange: string;
    ivColValue: string;
    ivColQuality: string;
    planningTitle: string;
    catches90: string;
    catches95: string;
    simulating: string;
    betterThan: string;
  };
  // Nature assessment labels
  assessment: {
    excellent: string;
    good: string;
    acceptable: string;
    bad: string;
    neutral: string;
  };
  // IV quality labels
  ivQuality: {
    excellent: string;
    good: string;
    mediocre: string;
    weak: string;
  };
  // Pokédex page
  pokedexPage: {
    title: string;
    search: string;
    total: string;
  };
  // Natures page
  naturesPage: {
    title: string;
    nature: string;
    boost: string;
    penalty: string;
    neutral: string;
  };
  // Methodology page
  methodologyPage: {
    title: string;
  };
  // Footer
  footer: {
    trademark: string;
    madeWith: string;
  };
}

const ptBR: Messages = {
  nav: {
    evaluator: "Avaliador",
    pokedex: "Pokédex",
    natures: "Naturezas",
    methodology: "Metodologia",
  },
  form: {
    species: "Espécie",
    level: "Nível",
    nature: "Natureza",
    evaluate: "Avaliar",
    freshCatchWarning: "Use stats de Pokémon recém-capturado (EV = 0)",
    speciesPlaceholder: "Ex: Pikachu",
    naturePlaceholder: "Ex: Jolly",
    rolePlaceholder: "Selecionar role...",
    suggestedRole: "Sugestão",
    default: "padrão",
  },
  tooltips: {
    freshCatch: "Os stats devem ser de um Pokémon recém-capturado, sem EVs (Effort Values). EVs são ganhos em batalhas e distorcem o cálculo de IVs.",
    species: "Nome do Pokémon em inglês. Nidoran usa 'Nidoran-F' ou 'Nidoran-M'.",
    level: "Nível do Pokémon no momento da captura. Níveis mais altos permitem cálculos de IV mais precisos.",
    nature: "Naturezas aumentam um stat em 10% e reduzem outro em 10%. Naturezas neutras (Hardy, Docile, etc.) não alteram nada.",
    role: "Perfil que define a importância de cada stat. O peso influencia o Score Q. A sugestão é baseada na espécie e sua evolução final.",
    stats: "Valores visíveis na tela de sumário do jogo. Cada stat é um número inteiro.",
    ivTable: "IVs (Individual Values) são valores ocultos de 0 a 31 que cada Pokémon recebe ao nascer/ser capturado. Eles influenciam diretamente os stats finais. A faixa mostra os valores possíveis para o stat observado.",
    qualityScore: "Score de 0% a 100% que mede a qualidade geral do Pokémon para o seu role. Combina IVs com modificadores de natureza usando penalidade assimétrica (perder 10% dói mais que ganhar 10%).",
    percentile: "Posição do seu Pokémon em relação a 200.000 capturas aleatórias simuladas. Percentil 70% significa que é melhor que 70% das capturas possíveis.",
    natureAssessment: "Avalia se a natureza favorece o role: Excelente = boost em stat-chave, penalidade em stat irrelevante. Ruim = o oposto.",
    catchPlanning: "Quantas capturas adicionais seriam necessárias para ter X% de chance de encontrar um Pokémon melhor que este. Usa o modelo: n = ceil(ln(1-c) / ln(1-p)).",
  },
  stats: {
    hp: "HP",
    atk: "Ataque",
    def: "Defesa",
    spatk: "Atq. Esp.",
    spdef: "Def. Esp.",
    spe: "Velocidade",
  },
  statsAbbrev: {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spatk: "SpA",
    spdef: "SpD",
    spe: "Spe",
  },
  results: {
    title: "Avaliação de Pokémon",
    qualityScore: "Score de Qualidade (Q)",
    percentile: "Percentil (Monte Carlo)",
    role: "Role",
    natureAssessment: "Avaliação da Natureza",
    ivTableTitle: "IVs Recuperados",
    ivColStat: "Stat",
    ivColRange: "Faixa IV",
    ivColValue: "Valor",
    ivColQuality: "Qualidade",
    planningTitle: "Planejamento de Capturas",
    catches90: "Capturas p/ 90% confiança",
    catches95: "Capturas p/ 95% confiança",
    simulating: "Simulando distribuição Monte Carlo...",
    betterThan: "Melhor que {pct}% das capturas aleatórias",
  },
  assessment: {
    excellent: "Excelente",
    good: "Boa",
    acceptable: "Aceitável",
    bad: "Ruim",
    neutral: "Neutra",
  },
  ivQuality: {
    excellent: "Excelente",
    good: "Bom",
    mediocre: "Mediano",
    weak: "Fraco",
  },
  pokedexPage: {
    title: "Pokédex — Base Stats",
    search: "Buscar Pokémon...",
    total: "Total",
  },
  naturesPage: {
    title: "Naturezas",
    nature: "Natureza",
    boost: "Boost",
    penalty: "Penalidade",
    neutral: "Neutra",
  },
  methodologyPage: {
    title: "Metodologia",
  },
  footer: {
    trademark: "Pokémon é marca registrada de Nintendo / Game Freak / The Pokémon Company.",
    madeWith: "Feito com",
  },
};

const en: Messages = {
  nav: {
    evaluator: "Evaluator",
    pokedex: "Pokédex",
    natures: "Natures",
    methodology: "Methodology",
  },
  form: {
    species: "Species",
    level: "Level",
    nature: "Nature",
    evaluate: "Evaluate",
    freshCatchWarning: "Use stats from a freshly caught Pokémon (EV = 0)",
    speciesPlaceholder: "e.g. Pikachu",
    naturePlaceholder: "e.g. Jolly",
    rolePlaceholder: "Select role...",
    suggestedRole: "Suggested",
    default: "default",
  },
  tooltips: {
    freshCatch: "Stats must be from a freshly caught Pokémon with no EVs (Effort Values). EVs are gained in battles and distort IV calculations.",
    species: "Pokémon name in English. Nidoran uses 'Nidoran-F' or 'Nidoran-M'.",
    level: "Pokémon level at the time of capture. Higher levels allow more precise IV calculations.",
    nature: "Natures boost one stat by 10% and reduce another by 10%. Neutral natures (Hardy, Docile, etc.) have no effect.",
    role: "Profile that defines the importance of each stat. Weights influence the Q Score. The suggestion is based on the species and its final evolution.",
    stats: "Values visible on the game's summary screen. Each stat is an integer.",
    ivTable: "IVs (Individual Values) are hidden values from 0 to 31 that each Pokémon receives at birth/capture. They directly influence final stats. The range shows possible values for the observed stat.",
    qualityScore: "Score from 0% to 100% measuring overall quality for the role. Combines IVs with nature modifiers using asymmetric penalty (losing 10% hurts more than gaining 10%).",
    percentile: "Your Pokémon's position among 200,000 simulated random catches. Percentile 70% means it's better than 70% of possible catches.",
    natureAssessment: "Evaluates whether the nature favors the role: Excellent = boosts key stat, penalizes irrelevant stat. Bad = the opposite.",
    catchPlanning: "How many additional catches would be needed for an X% chance of finding a better Pokémon. Uses the model: n = ceil(ln(1-c) / ln(1-p)).",
  },
  stats: {
    hp: "HP",
    atk: "Attack",
    def: "Defense",
    spatk: "Sp. Atk",
    spdef: "Sp. Def",
    spe: "Speed",
  },
  statsAbbrev: {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spatk: "SpA",
    spdef: "SpD",
    spe: "Spe",
  },
  results: {
    title: "Pokémon Evaluation",
    qualityScore: "Quality Score (Q)",
    percentile: "Percentile (Monte Carlo)",
    role: "Role",
    natureAssessment: "Nature Assessment",
    ivTableTitle: "Recovered IVs",
    ivColStat: "Stat",
    ivColRange: "IV Range",
    ivColValue: "Value",
    ivColQuality: "Quality",
    planningTitle: "Catch Planning",
    catches90: "Catches for 90% confidence",
    catches95: "Catches for 95% confidence",
    simulating: "Simulating Monte Carlo distribution...",
    betterThan: "Better than {pct}% of random catches",
  },
  assessment: {
    excellent: "Excellent",
    good: "Good",
    acceptable: "Acceptable",
    bad: "Bad",
    neutral: "Neutral",
  },
  ivQuality: {
    excellent: "Excellent",
    good: "Good",
    mediocre: "Mediocre",
    weak: "Weak",
  },
  pokedexPage: {
    title: "Pokédex — Base Stats",
    search: "Search Pokémon...",
    total: "Total",
  },
  naturesPage: {
    title: "Natures",
    nature: "Nature",
    boost: "Boost",
    penalty: "Penalty",
    neutral: "Neutral",
  },
  methodologyPage: {
    title: "Methodology",
  },
  footer: {
    trademark: "Pokémon is a trademark of Nintendo / Game Freak / The Pokémon Company.",
    madeWith: "Made with",
  },
};

const MESSAGES: Record<Locale, Messages> = { "pt-BR": ptBR, en };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export const I18nContext = createContext<{ locale: Locale; messages: Messages }>({
  locale: "pt-BR",
  messages: ptBR,
});

export function useI18n() {
  return useContext(I18nContext);
}
