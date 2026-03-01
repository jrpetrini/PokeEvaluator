import { describe, it, expect } from "vitest";
import { calcHp, calcOtherStat, recoverIvHp, recoverIvOther, recoverAllIvs } from "@/lib/core/stats";
import { StatName } from "@/lib/types";
import { getBaseStats } from "@/lib/data/pokedex";
import { getNatureModifiers } from "@/lib/data/natures";

describe("calcHp", () => {
  it("known value: Dugtrio base=35, iv=15, level=25", () => {
    // floor((2*35 + 15) * 25 / 100) + 25 + 10 = 21 + 35 = 56
    expect(calcHp(35, 15, 25)).toBe(56);
  });

  it("min iv gives lower stat", () => {
    expect(calcHp(35, 0, 25)).toBeLessThan(calcHp(35, 31, 25));
  });

  it("is monotonic in IV", () => {
    for (let iv = 1; iv <= 31; iv++) {
      expect(calcHp(50, iv, 50)).toBeGreaterThanOrEqual(calcHp(50, iv - 1, 50));
    }
  });
});

describe("calcOtherStat", () => {
  it("neutral nature", () => {
    // Dugtrio atk=80, iv=15, level=25, neutral=1.0
    expect(calcOtherStat(80, 15, 25, 1.0)).toBe(48);
  });

  it("nature boost +10%", () => {
    expect(calcOtherStat(80, 15, 25, 1.1)).toBe(52);
  });

  it("nature penalty -10%", () => {
    expect(calcOtherStat(80, 15, 25, 0.9)).toBe(43);
  });
});

describe("IV recovery", () => {
  it("round-trip HP", () => {
    const observed = calcHp(35, 15, 25);
    const range = recoverIvHp(35, 25, observed);
    expect(range.minIv).toBeLessThanOrEqual(15);
    expect(range.maxIv).toBeGreaterThanOrEqual(15);
  });

  it("round-trip other stat", () => {
    const observed = calcOtherStat(80, 20, 25, 1.1);
    const range = recoverIvOther(StatName.ATK, 80, 25, 1.1, observed);
    expect(range.minIv).toBeLessThanOrEqual(20);
    expect(range.maxIv).toBeGreaterThanOrEqual(20);
  });

  it("round-trip all IVs for Dugtrio", () => {
    const base = getBaseStats("Dugtrio");
    const mods = getNatureModifiers("Jolly");
    // Build observed stats with known IVs
    const ivs = [15, 20, 10, 12, 18, 25];
    const observed = {
      hp: calcHp(base.hp, ivs[0], 25),
      atk: calcOtherStat(base.atk, ivs[1], 25, mods.atk),
      def_: calcOtherStat(base.def_, ivs[2], 25, mods.def_),
      spatk: calcOtherStat(base.spatk, ivs[3], 25, mods.spatk),
      spdef: calcOtherStat(base.spdef, ivs[4], 25, mods.spdef),
      spe: calcOtherStat(base.spe, ivs[5], 25, mods.spe),
    };
    const recovered = recoverAllIvs(base, 25, mods, observed);
    expect(recovered.hp.minIv).toBeLessThanOrEqual(15);
    expect(recovered.hp.maxIv).toBeGreaterThanOrEqual(15);
    expect(recovered.atk.minIv).toBeLessThanOrEqual(20);
    expect(recovered.atk.maxIv).toBeGreaterThanOrEqual(20);
  });

  it("invalid stat raises", () => {
    expect(() => recoverIvHp(35, 25, 999)).toThrow();
  });

  it("higher level narrows range", () => {
    const observed10 = calcHp(50, 15, 10);
    const observed50 = calcHp(50, 15, 50);
    const range10 = recoverIvHp(50, 10, observed10);
    const range50 = recoverIvHp(50, 50, observed50);
    expect(range50.maxIv - range50.minIv).toBeLessThanOrEqual(range10.maxIv - range10.minIv);
  });
});
