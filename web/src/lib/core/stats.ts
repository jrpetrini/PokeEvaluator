import { BaseStats, IVRange, IVSet, StatBlock, StatName, STAT_ORDER, getStatFromBaseStats, getStatFromBlock } from "../types";
import { DEFAULT_EV, MAX_IV, MIN_IV } from "../data/gen3";

export function calcHp(base: number, iv: number, level: number, ev: number = DEFAULT_EV): number {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
}

export function calcOtherStat(
  base: number, iv: number, level: number, natureMod: number, ev: number = DEFAULT_EV
): number {
  const inner = Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5;
  return Math.floor(inner * natureMod);
}

export function recoverIvHp(base: number, level: number, observed: number, ev: number = DEFAULT_EV): IVRange {
  const candidates: number[] = [];
  for (let iv = MIN_IV; iv <= MAX_IV; iv++) {
    if (calcHp(base, iv, level, ev) === observed) {
      candidates.push(iv);
    }
  }
  if (candidates.length === 0) {
    throw new Error(`No possible IV for observed HP=${observed}`);
  }
  return { stat: StatName.HP, minIv: candidates[0], maxIv: candidates[candidates.length - 1] };
}

export function recoverIvOther(
  stat: StatName, base: number, level: number, natureMod: number, observed: number, ev: number = DEFAULT_EV
): IVRange {
  const candidates: number[] = [];
  for (let iv = MIN_IV; iv <= MAX_IV; iv++) {
    if (calcOtherStat(base, iv, level, natureMod, ev) === observed) {
      candidates.push(iv);
    }
  }
  if (candidates.length === 0) {
    throw new Error(`No possible IV for ${stat} observed=${observed}`);
  }
  return { stat, minIv: candidates[0], maxIv: candidates[candidates.length - 1] };
}

export function recoverAllIvs(
  baseStats: BaseStats, level: number, natureMods: StatBlock, observed: StatBlock
): IVSet {
  const hpRange = recoverIvHp(baseStats.hp, level, observed.hp);

  const otherRanges: Partial<Record<StatName, IVRange>> = {};
  for (const stat of STAT_ORDER) {
    if (stat === StatName.HP) continue;
    otherRanges[stat] = recoverIvOther(
      stat,
      getStatFromBaseStats(baseStats, stat),
      level,
      getStatFromBlock(natureMods, stat),
      getStatFromBlock(observed, stat),
    );
  }

  return {
    hp: hpRange,
    atk: otherRanges[StatName.ATK]!,
    def_: otherRanges[StatName.DEF]!,
    spatk: otherRanges[StatName.SPATK]!,
    spdef: otherRanges[StatName.SPDEF]!,
    spe: otherRanges[StatName.SPE]!,
  };
}
