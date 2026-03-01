import { describe, it, expect } from "vitest";
import { calcHp, calcOtherStat, recoverAllIvs } from "@/lib/core/stats";
import { computeQ, assessNature, adjustWeights } from "@/lib/core/quality";
import { catchesForConfidence } from "@/lib/core/planning";
import { getBaseStats } from "@/lib/data/pokedex";
import { getNatureModifiers } from "@/lib/data/natures";
import { getSpeciesRole } from "@/lib/data/roles";
import { statBlockToArray, ivSetMidpointBlock } from "@/lib/types";

describe("evaluate E2E (without Monte Carlo worker)", () => {
  it("Dugtrio Jolly full pipeline", () => {
    const base = getBaseStats("Dugtrio");
    const mods = getNatureModifiers("Jolly");

    // Observed stats with known IVs
    const ivs = { hp: 15, atk: 20, def: 10, spatk: 12, spdef: 18, spe: 25 };
    const observed = {
      hp: calcHp(base.hp, ivs.hp, 25),
      atk: calcOtherStat(base.atk, ivs.atk, 25, mods.atk),
      def_: calcOtherStat(base.def_, ivs.def, 25, mods.def_),
      spatk: calcOtherStat(base.spatk, ivs.spatk, 25, mods.spatk),
      spdef: calcOtherStat(base.spdef, ivs.spdef, 25, mods.spdef),
      spe: calcOtherStat(base.spe, ivs.spe, 25, mods.spe),
    };

    // IV Recovery
    const recovered = recoverAllIvs(base, 25, mods, observed);
    expect(recovered.hp.minIv).toBeLessThanOrEqual(ivs.hp);
    expect(recovered.hp.maxIv).toBeGreaterThanOrEqual(ivs.hp);

    // Role
    const role = getSpeciesRole("Dugtrio");
    expect(role.name).toBe("Physical Sweeper");

    // Weights
    const weights = adjustWeights(role.weights, base);
    const weightsArr = statBlockToArray(weights);

    // Q score
    const ivArr = statBlockToArray(ivSetMidpointBlock(recovered));
    const modsArr = statBlockToArray(mods);
    const q = computeQ(ivArr, modsArr, weightsArr);
    expect(q).toBeGreaterThan(0);
    expect(q).toBeLessThanOrEqual(1);

    // Nature assessment
    const assessment = assessNature(mods, weights);
    expect(assessment).toBe("Excelente");

    // Planning
    const c90 = catchesForConfidence(0.3, 0.9);
    expect(c90).toBeGreaterThan(0);
  });

  it("Snorlax Careful pipeline", () => {
    const base = getBaseStats("Snorlax");
    const mods = getNatureModifiers("Careful");

    const observed = {
      hp: calcHp(base.hp, 20, 30),
      atk: calcOtherStat(base.atk, 15, 30, mods.atk),
      def_: calcOtherStat(base.def_, 10, 30, mods.def_),
      spatk: calcOtherStat(base.spatk, 5, 30, mods.spatk),
      spdef: calcOtherStat(base.spdef, 25, 30, mods.spdef),
      spe: calcOtherStat(base.spe, 8, 30, mods.spe),
    };

    const recovered = recoverAllIvs(base, 30, mods, observed);
    const role = getSpeciesRole("Snorlax");
    expect(role.name).toBe("Special Tank");

    const weights = adjustWeights(role.weights, base);
    const q = computeQ(
      statBlockToArray(ivSetMidpointBlock(recovered)),
      statBlockToArray(mods),
      statBlockToArray(weights),
    );
    expect(q).toBeGreaterThan(0);

    const assessment = assessNature(mods, weights);
    expect(["Excelente", "Boa"]).toContain(assessment);
  });

  it("pre-evolution inherits role", () => {
    const role = getSpeciesRole("Charmander");
    expect(role.name).toBe("Special Sweeper");
  });
});
