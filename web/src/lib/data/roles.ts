import { RoleProfile, StatBlock } from "../types";
import { getFinalEvolution } from "./evolutions";

export const ROLES: Record<string, RoleProfile> = {
  physical_sweeper: {
    name: "Physical Sweeper",
    description: "Ataque físico + velocidade",
    weights: { hp: 0.5, atk: 0.8, def_: 0.5, spatk: 0.3, spdef: 0.5, spe: 0.8 },
  },
  special_sweeper: {
    name: "Special Sweeper",
    description: "Ataque especial + velocidade",
    weights: { hp: 0.5, atk: 0.3, def_: 0.5, spatk: 0.8, spdef: 0.5, spe: 0.8 },
  },
  physical_tank: {
    name: "Physical Tank",
    description: "HP + defesa física",
    weights: { hp: 0.8, atk: 0.5, def_: 0.8, spatk: 0.3, spdef: 0.5, spe: 0.3 },
  },
  special_tank: {
    name: "Special Tank",
    description: "HP + defesa especial",
    weights: { hp: 0.8, atk: 0.3, def_: 0.5, spatk: 0.5, spdef: 0.8, spe: 0.3 },
  },
  mixed_attacker: {
    name: "Mixed Attacker",
    description: "Ataque físico + especial + velocidade",
    weights: { hp: 0.5, atk: 0.8, def_: 0.5, spatk: 0.8, spdef: 0.5, spe: 0.8 },
  },
  balanced: {
    name: "Balanced",
    description: "Todos os stats com peso igual",
    weights: { hp: 0.5, atk: 0.5, def_: 0.5, spatk: 0.5, spdef: 0.5, spe: 0.5 },
  },
};

const SPECIES_ROLES: Record<string, string> = {
  dugtrio: "physical_sweeper",
  poliwrath: "physical_tank",
  jolteon: "special_sweeper",
  dodrio: "physical_sweeper",
  snorlax: "special_tank",
  charizard: "special_sweeper",
};

export function getRole(name: string): RoleProfile {
  const role = ROLES[name];
  if (!role) throw new Error(`Unknown role: ${name}`);
  return role;
}

export function getSpeciesRole(species: string): RoleProfile {
  const final = getFinalEvolution(species);
  const roleKey = SPECIES_ROLES[final] ?? "balanced";
  return ROLES[roleKey];
}
