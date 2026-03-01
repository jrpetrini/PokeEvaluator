import { describe, it, expect } from "vitest";
import { computeQ, assessNature, assessIv, adjustWeights, effectiveNatureMods } from "@/lib/core/quality";
import { statBlockToArray } from "@/lib/types";
import { getNatureModifiers } from "@/lib/data/natures";
import { getBaseStats } from "@/lib/data/pokedex";

describe("effectiveNatureMods", () => {
  it("boost stays at 1.1", () => {
    const result = effectiveNatureMods([1.0, 1.1, 1.0, 1.0, 1.0, 0.9]);
    expect(result[1]).toBeCloseTo(1.1);
  });

  it("penalty amplified to 0.85", () => {
    const result = effectiveNatureMods([1.0, 1.1, 1.0, 1.0, 1.0, 0.9]);
    expect(result[5]).toBeCloseTo(0.85);
  });
});

describe("computeQ", () => {
  it("perfect IVs with optimal nature gives high Q", () => {
    const weights = [0.5, 0.8, 0.5, 0.3, 0.5, 0.8];
    const ivs = [31, 31, 31, 31, 31, 31];
    const mods = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]; // neutral
    const q = computeQ(ivs, mods, weights);
    expect(q).toBeGreaterThan(0.8);
    expect(q).toBeLessThanOrEqual(1.0);
  });

  it("zero IVs give low Q", () => {
    const weights = [0.5, 0.8, 0.5, 0.3, 0.5, 0.8];
    const ivs = [0, 0, 0, 0, 0, 0];
    const mods = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
    expect(computeQ(ivs, mods, weights)).toBe(0);
  });

  it("Q in [0,1]", () => {
    const weights = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    for (let i = 0; i < 10; i++) {
      const ivs = Array.from({ length: 6 }, () => Math.floor(Math.random() * 32));
      const mods = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
      const q = computeQ(ivs, mods, weights);
      expect(q).toBeGreaterThanOrEqual(0);
      expect(q).toBeLessThanOrEqual(1);
    }
  });
});

describe("assessNature", () => {
  it("Jolly for physical sweeper is Excelente", () => {
    const mods = getNatureModifiers("Jolly");
    const weights = { hp: 0.5, atk: 0.8, def_: 0.5, spatk: 0.3, spdef: 0.5, spe: 0.8 };
    expect(assessNature(mods, weights)).toBe("Excelente");
  });

  it("Hardy (neutral) returns Neutra", () => {
    const mods = getNatureModifiers("Hardy");
    const weights = { hp: 0.5, atk: 0.8, def_: 0.5, spatk: 0.3, spdef: 0.5, spe: 0.8 };
    expect(assessNature(mods, weights)).toBe("Neutra");
  });

  it("Timid for physical sweeper is Ruim", () => {
    const mods = getNatureModifiers("Timid");
    // Adjusted weights for Dugtrio
    const base = getBaseStats("Dugtrio");
    const rawWeights = { hp: 0.5, atk: 0.8, def_: 0.5, spatk: 0.3, spdef: 0.5, spe: 0.8 };
    const adj = adjustWeights(rawWeights, base);
    expect(assessNature(mods, adj)).toBe("Ruim");
  });
});

describe("assessIv", () => {
  it("31 is Excelente", () => expect(assessIv(31)).toBe("Excelente"));
  it("28 is Excelente", () => expect(assessIv(28)).toBe("Excelente"));
  it("20 is Bom", () => expect(assessIv(20)).toBe("Bom"));
  it("10 is Mediano", () => expect(assessIv(10)).toBe("Mediano"));
  it("0 is Fraco", () => expect(assessIv(0)).toBe("Fraco"));
});

describe("adjustWeights", () => {
  it("preserves ranking", () => {
    const base = getBaseStats("Dugtrio");
    const weights = { hp: 0.5, atk: 0.8, def_: 0.5, spatk: 0.3, spdef: 0.5, spe: 0.8 };
    const adj = adjustWeights(weights, base);
    const arr = statBlockToArray(adj);
    // ATK and SPE should remain the highest
    expect(arr[1]).toBeGreaterThan(arr[3]); // atk > spatk
    expect(arr[5]).toBeGreaterThan(arr[3]); // spe > spatk
  });

  it("slow pokemon reduces spe weight", () => {
    const base = getBaseStats("Snorlax"); // spe=30
    const weights = { hp: 0.8, atk: 0.3, def_: 0.5, spatk: 0.5, spdef: 0.8, spe: 0.3 };
    const adj = adjustWeights(weights, base);
    expect(adj.spe).toBeLessThan(weights.spe);
  });

  it("fast pokemon increases spe weight", () => {
    const base = getBaseStats("Jolteon"); // spe=130
    const weights = { hp: 0.5, atk: 0.3, def_: 0.5, spatk: 0.8, spdef: 0.5, spe: 0.8 };
    const adj = adjustWeights(weights, base);
    expect(adj.spe).toBeGreaterThanOrEqual(weights.spe);
  });

  it("clamped to [0.1, 1.0]", () => {
    const base = getBaseStats("Chansey"); // extreme stats
    const weights = { hp: 1.0, atk: 0.1, def_: 0.1, spatk: 0.5, spdef: 1.0, spe: 0.5 };
    const adj = adjustWeights(weights, base);
    const arr = statBlockToArray(adj);
    for (const v of arr) {
      expect(v).toBeGreaterThanOrEqual(0.1);
      expect(v).toBeLessThanOrEqual(1.0);
    }
  });
});
