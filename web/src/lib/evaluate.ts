import {
  EvaluationResult,
  CaughtPokemon,
  StatBlock,
  ivSetMidpointBlock,
  statBlockToArray,
} from "./types";
import { getBaseStats, findSpeciesName } from "./data/pokedex";
import { getNature, getNatureModifiers } from "./data/natures";
import { getSpeciesRole, getRole } from "./data/roles";
import { recoverAllIvs } from "./core/stats";
import { adjustWeights, assessNature, computeQ } from "./core/quality";
import { catchesForConfidence } from "./core/planning";
import { runMonteCarloWorker } from "./core/montecarlo";

export interface EvaluateInput {
  species: string;
  level: number;
  nature: string;
  stats: {
    hp: number;
    atk: number;
    def: number;
    spatk: number;
    spdef: number;
    spe: number;
  };
  role?: string;
  gender?: string | null;
  ability?: string | null;
}

export async function evaluate(input: EvaluateInput): Promise<EvaluationResult> {
  const speciesName = findSpeciesName(input.species);
  if (!speciesName) throw new Error(`Unknown Pokémon: ${input.species}`);

  const baseStats = getBaseStats(input.species);
  const natureObj = getNature(input.nature);
  const natureMods = getNatureModifiers(input.nature);

  const observed: StatBlock = {
    hp: input.stats.hp,
    atk: input.stats.atk,
    def_: input.stats.def,
    spatk: input.stats.spatk,
    spdef: input.stats.spdef,
    spe: input.stats.spe,
  };

  const ivs = recoverAllIvs(baseStats, input.level, natureMods, observed);

  const roleProfile = input.role ? getRole(input.role) : getSpeciesRole(input.species);
  const weights = adjustWeights(roleProfile.weights, baseStats);

  const ivArr = statBlockToArray(ivSetMidpointBlock(ivs));
  const natureArr = statBlockToArray(natureMods);
  const weightsArr = statBlockToArray(weights);
  const q = computeQ(ivArr, natureArr, weightsArr);

  const { percentile } = await runMonteCarloWorker(weightsArr, q);

  const natAssessment = assessNature(natureMods, weights);

  const pSingle = percentile / 100.0;
  const pBetter = 1.0 - pSingle;
  let c90: number, c95: number;
  if (pBetter > 0) {
    c90 = catchesForConfidence(pBetter, 0.90);
    c95 = catchesForConfidence(pBetter, 0.95);
  } else {
    c90 = 1;
    c95 = 1;
  }

  const caught: CaughtPokemon = {
    species: speciesName,
    level: input.level,
    nature: natureObj.name,
    baseStats,
    observed,
    gender: input.gender ?? null,
    ability: input.ability ?? null,
  };

  return {
    pokemon: caught,
    ivs,
    qualityScore: q,
    percentile,
    natureAssessment: natAssessment,
    roleName: roleProfile.name,
    catchesFor90: c90,
    catchesFor95: c95,
  };
}
