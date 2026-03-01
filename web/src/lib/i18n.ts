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
