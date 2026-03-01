import { Nature, StatBlock, StatName } from "../types";
import { NATURE_BOOST, NATURE_NEUTRAL, NATURE_PENALTY } from "./gen3";

function nature(name: string, boost: StatName | null, penalty: StatName | null): Nature {
  return { name, boost, penalty };
}

export const NATURES: Record<string, Nature> = {
  Hardy:   nature("Hardy",   null,          null),
  Lonely:  nature("Lonely",  StatName.ATK,  StatName.DEF),
  Brave:   nature("Brave",   StatName.ATK,  StatName.SPE),
  Adamant: nature("Adamant", StatName.ATK,  StatName.SPATK),
  Naughty: nature("Naughty", StatName.ATK,  StatName.SPDEF),
  Bold:    nature("Bold",    StatName.DEF,  StatName.ATK),
  Docile:  nature("Docile",  null,          null),
  Relaxed: nature("Relaxed", StatName.DEF,  StatName.SPE),
  Impish:  nature("Impish",  StatName.DEF,  StatName.SPATK),
  Lax:     nature("Lax",     StatName.DEF,  StatName.SPDEF),
  Timid:   nature("Timid",   StatName.SPE,  StatName.ATK),
  Hasty:   nature("Hasty",   StatName.SPE,  StatName.DEF),
  Serious: nature("Serious", null,          null),
  Jolly:   nature("Jolly",   StatName.SPE,  StatName.SPATK),
  Naive:   nature("Naive",   StatName.SPE,  StatName.SPDEF),
  Modest:  nature("Modest",  StatName.SPATK, StatName.ATK),
  Mild:    nature("Mild",    StatName.SPATK, StatName.DEF),
  Quiet:   nature("Quiet",   StatName.SPATK, StatName.SPE),
  Bashful: nature("Bashful", null,          null),
  Rash:    nature("Rash",    StatName.SPATK, StatName.SPDEF),
  Calm:    nature("Calm",    StatName.SPDEF, StatName.ATK),
  Gentle:  nature("Gentle",  StatName.SPDEF, StatName.DEF),
  Sassy:   nature("Sassy",   StatName.SPDEF, StatName.SPE),
  Careful: nature("Careful", StatName.SPDEF, StatName.SPATK),
  Quirky:  nature("Quirky",  null,          null),
};

export const NATURE_LIST = Object.values(NATURES);

export function getNature(name: string): Nature {
  const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  const n = NATURES[key];
  if (!n) throw new Error(`Unknown nature: ${name}`);
  return n;
}

export function getNatureModifiers(name: string): StatBlock {
  return natureModifiers(getNature(name));
}

export function natureModifiers(nature: Nature): StatBlock {
  const mods: Record<string, number> = {
    hp: NATURE_NEUTRAL,
    atk: NATURE_NEUTRAL,
    def_: NATURE_NEUTRAL,
    spatk: NATURE_NEUTRAL,
    spdef: NATURE_NEUTRAL,
    spe: NATURE_NEUTRAL,
  };
  if (nature.boost && nature.penalty) {
    mods[nature.boost] = NATURE_BOOST;
    mods[nature.penalty] = NATURE_PENALTY;
  }
  return {
    hp: mods.hp,
    atk: mods.atk,
    def_: mods.def_,
    spatk: mods.spatk,
    spdef: mods.spdef,
    spe: mods.spe,
  };
}
