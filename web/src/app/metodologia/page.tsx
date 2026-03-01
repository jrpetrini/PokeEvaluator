"use client";

import { useI18n } from "@/lib/i18n";

export default function MethodologyPage() {
  const { locale } = useI18n();
  const isPt = locale === "pt-BR";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 prose-invert">
      <h1 className="text-2xl font-bold mb-6">
        {isPt ? "Metodologia" : "Methodology"}
      </h1>

      <section className="space-y-6 text-poke-text leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">
            {isPt ? "1. Recuperação de IVs" : "1. IV Recovery"}
          </h2>
          <p>
            {isPt
              ? "Cada stat visível é governado pelas fórmulas de Gen III:"
              : "Each visible stat is governed by the Gen III formulas:"}
          </p>
          <div className="bg-poke-surface rounded p-4 my-3 font-mono text-sm overflow-x-auto">
            <p>HP = floor((2B + IV) × L / 100) + L + 10</p>
            <p className="mt-2">Stat = floor((floor((2B + IV) × L / 100) + 5) × m)</p>
          </div>
          <p>
            {isPt
              ? "Onde B = base stat, L = nível, m = modificador de natureza (0.9 / 1.0 / 1.1), e EV = 0 (Pokémon recém-capturado). Para recuperar o IV, o programa faz busca exaustiva nos 32 valores possíveis (0–31) e retém todos que produzem o stat observado."
              : "Where B = base stat, L = level, m = nature modifier (0.9 / 1.0 / 1.1), and EV = 0 (freshly caught). To recover the IV, the program brute-forces all 32 possible values (0–31) and keeps those that produce the observed stat."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">
            {isPt ? "2. Roles e pesos" : "2. Roles and Weights"}
          </h2>
          <p>
            {isPt
              ? "Cada Pokémon é associado a um perfil de role que define a importância relativa de cada stat numa escala [0.1, 1.0]. Pré-evoluções herdam a role da forma final."
              : "Each Pokémon is associated with a role profile that defines the relative importance of each stat on a [0.1, 1.0] scale. Pre-evolutions inherit the role of their final form."}
          </p>
          <div className="overflow-x-auto my-3">
            <table className="text-sm w-full">
              <thead>
                <tr className="border-b border-poke-border">
                  <th className="px-2 py-1 text-left">Role</th>
                  <th className="px-2 py-1 text-right">HP</th>
                  <th className="px-2 py-1 text-right">Atk</th>
                  <th className="px-2 py-1 text-right">Def</th>
                  <th className="px-2 py-1 text-right">SpAtk</th>
                  <th className="px-2 py-1 text-right">SpDef</th>
                  <th className="px-2 py-1 text-right">Spe</th>
                </tr>
              </thead>
              <tbody className="text-poke-subtext">
                <tr className="border-b border-poke-border/50"><td className="px-2 py-1">Physical Sweeper</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.3</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-2 py-1">Special Sweeper</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.3</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-2 py-1">Physical Tank</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.3</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.3</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-2 py-1">Special Tank</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.3</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.3</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-2 py-1">Mixed Attacker</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.8</td></tr>
                <tr><td className="px-2 py-1">Balanced</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.5</td><td className="px-2 py-1 text-right">0.5</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">
            {isPt ? "3. Score de qualidade Q" : "3. Quality Score Q"}
          </h2>
          <div className="bg-poke-surface rounded p-4 my-3 font-mono text-sm">
            Q = sum(w_i * IV_i * m*_i) / Q_max
          </div>
          <p>
            {isPt
              ? "Onde w_i = peso ajustado do stat i e m*_i = modificador de natureza efetivo."
              : "Where w_i = adjusted weight for stat i and m*_i = effective nature modifier."}
          </p>
          <h3 className="text-lg font-medium mt-4 mb-2 text-white">
            {isPt ? "Penalidade assimétrica de natureza" : "Asymmetric Nature Penalty"}
          </h3>
          <p>
            {isPt
              ? "A premissa é que perder 10% de um stat-chave dói mais do que ganhar 10% em outro. A penalidade de 0.9 é amplificada por um fator k = 1.5:"
              : "The premise is that losing 10% of a key stat hurts more than gaining 10% on another. The 0.9 penalty is amplified by a factor k = 1.5:"}
          </p>
          <div className="overflow-x-auto my-3">
            <table className="text-sm">
              <thead>
                <tr className="border-b border-poke-border">
                  <th className="px-3 py-1 text-left">{isPt ? "Natureza" : "Nature"}</th>
                  <th className="px-3 py-1 text-right">{isPt ? "Mod. real" : "Real mod"}</th>
                  <th className="px-3 py-1 text-right">{isPt ? "Mod. efetivo" : "Effective mod"}</th>
                </tr>
              </thead>
              <tbody className="text-poke-subtext">
                <tr className="border-b border-poke-border/50"><td className="px-3 py-1">Boost (+)</td><td className="px-3 py-1 text-right">1.1</td><td className="px-3 py-1 text-right text-iv-excellent">1.1</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-3 py-1">{isPt ? "Neutro" : "Neutral"}</td><td className="px-3 py-1 text-right">1.0</td><td className="px-3 py-1 text-right">1.0</td></tr>
                <tr><td className="px-3 py-1">{isPt ? "Penalidade (−)" : "Penalty (−)"}</td><td className="px-3 py-1 text-right">0.9</td><td className="px-3 py-1 text-right text-iv-weak">0.85</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">
            {isPt ? "4. Avaliação de natureza" : "4. Nature Assessment"}
          </h2>
          <div className="bg-poke-surface rounded p-4 my-3 font-mono text-sm">
            score = w_boost - 1.5 * w_penalty
          </div>
          <div className="overflow-x-auto my-3">
            <table className="text-sm">
              <thead>
                <tr className="border-b border-poke-border">
                  <th className="px-3 py-1 text-left">Score</th>
                  <th className="px-3 py-1 text-left">{isPt ? "Avaliação" : "Assessment"}</th>
                </tr>
              </thead>
              <tbody className="text-poke-subtext">
                <tr className="border-b border-poke-border/50"><td className="px-3 py-1">{">"}= 0.3</td><td className="px-3 py-1 text-nature-excellent">{isPt ? "Excelente" : "Excellent"}</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-3 py-1">{">"}= 0.0</td><td className="px-3 py-1 text-nature-good">{isPt ? "Boa" : "Good"}</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-3 py-1">{">"}= -0.3</td><td className="px-3 py-1 text-nature-acceptable">{isPt ? "Aceitável" : "Acceptable"}</td></tr>
                <tr className="border-b border-poke-border/50"><td className="px-3 py-1">{"<"} -0.3</td><td className="px-3 py-1 text-nature-bad">{isPt ? "Ruim" : "Bad"}</td></tr>
                <tr><td className="px-3 py-1">—</td><td className="px-3 py-1 text-nature-neutral">{isPt ? "Neutra" : "Neutral"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">
            {isPt ? "5. Simulação Monte Carlo" : "5. Monte Carlo Simulation"}
          </h2>
          <p>
            {isPt
              ? "Para situar o Q do seu Pokémon no contexto de capturas aleatórias, o programa gera 200.000 amostras com IVs aleatórios (uniforme em [0, 31]) e naturezas aleatórias (uniforme entre as 25 possíveis). Os Q das amostras são ordenados e o percentil é calculado via binary search."
              : "To contextualize your Pokémon's Q among random catches, the program generates 200,000 samples with random IVs (uniform [0, 31]) and random natures (uniform among 25). The sample Q values are sorted and the percentile is found via binary search."}
          </p>
          <div className="bg-poke-surface rounded p-4 my-3 font-mono text-sm">
            percentile = rank / N × 100
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">
            {isPt ? "6. Planejamento de capturas" : "6. Catch Planning"}
          </h2>
          <p>
            {isPt
              ? "Dado que a probabilidade de uma captura ser melhor é p = 1 - percentil/100, o número mínimo de capturas para atingir confiança c é:"
              : "Given that the probability of a better catch is p = 1 - percentile/100, the minimum catches to reach confidence c is:"}
          </p>
          <div className="bg-poke-surface rounded p-4 my-3 font-mono text-sm">
            n = ceil(ln(1 - c) / ln(1 - p))
          </div>
          <p>
            {isPt
              ? "O programa calcula n para confiança de 90% e 95%."
              : "The program computes n for 90% and 95% confidence."}
          </p>
        </div>
      </section>
    </div>
  );
}
