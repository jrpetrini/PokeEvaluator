import { BaseStats, StatBlock, StatName, STAT_ORDER, getStatFromBlock, statBlockToArray, arrayToStatBlock, baseStatsToArray } from "../types";
import { MAX_IV, NATURE_BOOST, NATURE_PENALTY, NATURE_PENALTY_WEIGHT } from "../data/gen3";

export function effectiveNatureMods(mods: number[]): number[] {
  return mods.map(m => m >= 1.0 ? m : 1.0 - NATURE_PENALTY_WEIGHT * (1.0 - m));
}

function computeQMax(weights: number[]): number {
  const neutralMax = weights.reduce((sum, w) => sum + w * MAX_IV, 0);

  const nonHp = weights.slice(1);
  if (nonHp.length === 0) return neutralMax;

  const maxW = Math.max(...nonHp);
  const minW = Math.min(...nonHp);

  if (maxW === minW) {
    const boostGain = NATURE_BOOST - 1.0;
    const penaltyCost = NATURE_PENALTY_WEIGHT * (1.0 - NATURE_PENALTY);
    const increment = MAX_IV * nonHp[0] * (boostGain - penaltyCost);
    return neutralMax + Math.max(0, increment);
  }

  const bestIdx = 1 + nonHp.indexOf(maxW);
  const worstIdx = 1 + nonHp.indexOf(minW);

  const optimalMods = new Array(weights.length).fill(1.0);
  optimalMods[bestIdx] = NATURE_BOOST;
  optimalMods[worstIdx] = 1.0 - NATURE_PENALTY_WEIGHT * (1.0 - NATURE_PENALTY);

  const qMaxNature = weights.reduce((sum, w, i) => sum + w * MAX_IV * optimalMods[i], 0);
  return Math.max(neutralMax, qMaxNature);
}

export function computeQ(ivs: number[], natureMods: number[], weights: number[]): number {
  const eff = effectiveNatureMods(natureMods);
  const actual = weights.reduce((sum, w, i) => sum + w * ivs[i] * eff[i], 0);
  const qMax = computeQMax(weights);
  if (qMax === 0) return 0;
  return Math.max(0, Math.min(1, actual / qMax));
}

export function computeQBatch(
  ivsBatch: Float64Array,
  modsBatch: Float64Array,
  weights: number[],
  n: number
): Float64Array {
  const qMax = computeQMax(weights);
  const result = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const offset = i * 6;
    let actual = 0;
    for (let j = 0; j < 6; j++) {
      const mod = modsBatch[offset + j];
      const effMod = mod >= 1.0 ? mod : 1.0 - NATURE_PENALTY_WEIGHT * (1.0 - mod);
      actual += weights[j] * ivsBatch[offset + j] * effMod;
    }
    result[i] = Math.max(0, Math.min(1, actual / qMax));
  }
  return result;
}

export function adjustWeights(weights: StatBlock, baseStats: BaseStats): StatBlock {
  const baseArr = baseStatsToArray(baseStats);
  const bst = baseArr.reduce((a, b) => a + b, 0);
  if (bst === 0) return weights;

  const ratios = baseArr.map(b => b / bst);
  const maxRatio = Math.max(...ratios.slice(0, 5));

  const weightArr = statBlockToArray(weights);
  const adjusted = new Array(6);

  for (let i = 0; i < 5; i++) {
    const tilt = maxRatio > 0 ? 0.8 + 0.4 * (ratios[i] / maxRatio) : 1.0;
    adjusted[i] = Math.max(0.1, Math.min(1.0, weightArr[i] * tilt));
  }

  const baseSpe = baseArr[5];
  let speedTilt: number;
  if (baseSpe >= 90) speedTilt = 1.2;
  else if (baseSpe >= 50) speedTilt = 1.0;
  else speedTilt = 0.7;
  adjusted[5] = Math.max(0.1, Math.min(1.0, weightArr[5] * speedTilt));

  return arrayToStatBlock(adjusted);
}

export function assessNature(natureMods: StatBlock, weights: StatBlock): string {
  let boosted: StatName | null = null;
  let penalized: StatName | null = null;

  for (const stat of STAT_ORDER) {
    if (stat === StatName.HP) continue;
    const mod = getStatFromBlock(natureMods, stat);
    if (mod > 1.0) boosted = stat;
    else if (mod < 1.0) penalized = stat;
  }

  if (!boosted) return "Neutra";

  const score = getStatFromBlock(weights, boosted) - NATURE_PENALTY_WEIGHT * getStatFromBlock(weights, penalized!);

  if (score >= 0.3) return "Excelente";
  if (score >= 0.0) return "Boa";
  if (score >= -0.3) return "Aceitável";
  return "Ruim";
}

export function assessIv(ivValue: number): string {
  if (ivValue >= 28) return "Excelente";
  if (ivValue >= 20) return "Bom";
  if (ivValue >= 10) return "Mediano";
  return "Fraco";
}
