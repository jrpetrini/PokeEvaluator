"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { evaluate, EvaluateInput } from "@/lib/evaluate";
import { EvaluationResult } from "@/lib/types";
import SpeciesSelect from "./SpeciesSelect";
import NatureSelect from "./NatureSelect";
import RoleSelect from "./RoleSelect";
import StatInputGroup, { StatsInput } from "./StatInputGroup";
import FreshCatchBanner from "./FreshCatchBanner";
import Tooltip from "../Tooltip";

interface EvaluatorFormProps {
  onResult: (result: EvaluationResult) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function EvaluatorForm({ onResult, onError, onLoading }: EvaluatorFormProps) {
  const { messages: t } = useI18n();
  const [species, setSpecies] = useState("");
  const [level, setLevel] = useState("");
  const [nature, setNature] = useState("");
  const [role, setRole] = useState("");
  const [stats, setStats] = useState<StatsInput>({
    hp: "", atk: "", def: "", spatk: "", spdef: "", spe: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError("");

    if (!species || !level || !nature) {
      onError("Please fill in species, level, and nature.");
      return;
    }
    const lvl = parseInt(level, 10);
    if (isNaN(lvl) || lvl < 1 || lvl > 100) {
      onError("Level must be between 1 and 100.");
      return;
    }

    const statValues = {
      hp: parseInt(stats.hp, 10),
      atk: parseInt(stats.atk, 10),
      def: parseInt(stats.def, 10),
      spatk: parseInt(stats.spatk, 10),
      spdef: parseInt(stats.spdef, 10),
      spe: parseInt(stats.spe, 10),
    };
    for (const [key, val] of Object.entries(statValues)) {
      if (isNaN(val) || val < 1) {
        onError(`Invalid value for ${key}.`);
        return;
      }
    }

    const input: EvaluateInput = {
      species,
      level: lvl,
      nature,
      stats: statValues,
      role: role || undefined,
    };

    onLoading(true);
    try {
      const result = await evaluate(input);
      onResult(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    } finally {
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FreshCatchBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SpeciesSelect value={species} onChange={setSpecies} />
        <div>
          <label className="block text-sm text-poke-subtext mb-1">
            <Tooltip text={t.tooltips.level}>
              <span>{t.form.level}</span>
            </Tooltip>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="1-100"
            className="w-full px-3 py-2 rounded bg-poke-surface border border-poke-border text-poke-text placeholder:text-poke-subtext focus:outline-none focus:border-poke-blue min-h-[44px]"
          />
        </div>
        <NatureSelect value={nature} onChange={setNature} />
        <RoleSelect value={role} species={species} onChange={setRole} />
      </div>

      <StatInputGroup stats={stats} onChange={setStats} />

      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-2 bg-poke-blue text-white rounded font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
      >
        {t.form.evaluate}
      </button>
    </form>
  );
}
