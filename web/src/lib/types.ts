export enum StatName {
  HP = "hp",
  ATK = "atk",
  DEF = "def_",
  SPATK = "spatk",
  SPDEF = "spdef",
  SPE = "spe",
}

export const STAT_ORDER: StatName[] = [
  StatName.HP,
  StatName.ATK,
  StatName.DEF,
  StatName.SPATK,
  StatName.SPDEF,
  StatName.SPE,
];

export const STAT_COUNT = 6;

export interface BaseStats {
  hp: number;
  atk: number;
  def_: number;
  spatk: number;
  spdef: number;
  spe: number;
}

export interface StatBlock {
  hp: number;
  atk: number;
  def_: number;
  spatk: number;
  spdef: number;
  spe: number;
}

export interface IVRange {
  stat: StatName;
  minIv: number;
  maxIv: number;
}

export interface IVSet {
  hp: IVRange;
  atk: IVRange;
  def_: IVRange;
  spatk: IVRange;
  spdef: IVRange;
  spe: IVRange;
}

export interface Nature {
  name: string;
  boost: StatName | null;
  penalty: StatName | null;
}

export interface RoleProfile {
  name: string;
  description: string;
  weights: StatBlock;
}

export interface CaughtPokemon {
  species: string;
  level: number;
  nature: string;
  baseStats: BaseStats;
  observed: StatBlock;
  gender?: string | null;
  ability?: string | null;
}

export interface EvaluationResult {
  pokemon: CaughtPokemon;
  ivs: IVSet;
  qualityScore: number;
  percentile: number;
  natureAssessment: string;
  roleName: string;
  catchesFor90: number;
  catchesFor95: number;
}

// Utility functions for stat block / array conversion

export function statBlockToArray(block: StatBlock): number[] {
  return [block.hp, block.atk, block.def_, block.spatk, block.spdef, block.spe];
}

export function arrayToStatBlock(arr: number[]): StatBlock {
  return {
    hp: arr[0],
    atk: arr[1],
    def_: arr[2],
    spatk: arr[3],
    spdef: arr[4],
    spe: arr[5],
  };
}

export function baseStatsToArray(stats: BaseStats): number[] {
  return [stats.hp, stats.atk, stats.def_, stats.spatk, stats.spdef, stats.spe];
}

export function getStatFromBlock(block: StatBlock, stat: StatName): number {
  const map: Record<StatName, number> = {
    [StatName.HP]: block.hp,
    [StatName.ATK]: block.atk,
    [StatName.DEF]: block.def_,
    [StatName.SPATK]: block.spatk,
    [StatName.SPDEF]: block.spdef,
    [StatName.SPE]: block.spe,
  };
  return map[stat];
}

export function getStatFromBaseStats(stats: BaseStats, stat: StatName): number {
  return getStatFromBlock(stats as StatBlock, stat);
}

export function getIvRange(ivs: IVSet, stat: StatName): IVRange {
  const map: Record<StatName, IVRange> = {
    [StatName.HP]: ivs.hp,
    [StatName.ATK]: ivs.atk,
    [StatName.DEF]: ivs.def_,
    [StatName.SPATK]: ivs.spatk,
    [StatName.SPDEF]: ivs.spdef,
    [StatName.SPE]: ivs.spe,
  };
  return map[stat];
}

export function ivRangeIsExact(range: IVRange): boolean {
  return range.minIv === range.maxIv;
}

export function ivRangeValue(range: IVRange): number {
  return range.minIv === range.maxIv
    ? range.minIv
    : Math.floor((range.minIv + range.maxIv) / 2);
}

export function ivSetMidpointBlock(ivs: IVSet): StatBlock {
  return {
    hp: ivRangeValue(ivs.hp),
    atk: ivRangeValue(ivs.atk),
    def_: ivRangeValue(ivs.def_),
    spatk: ivRangeValue(ivs.spatk),
    spdef: ivRangeValue(ivs.spdef),
    spe: ivRangeValue(ivs.spe),
  };
}

export function uniformStatBlock(value: number): StatBlock {
  return { hp: value, atk: value, def_: value, spatk: value, spdef: value, spe: value };
}
