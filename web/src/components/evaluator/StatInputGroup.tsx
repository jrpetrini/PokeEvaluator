"use client";

import { useI18n } from "@/lib/i18n";

export interface StatsInput {
  hp: string;
  atk: string;
  def: string;
  spatk: string;
  spdef: string;
  spe: string;
}

interface StatInputGroupProps {
  stats: StatsInput;
  onChange: (stats: StatsInput) => void;
}

const STAT_KEYS: (keyof StatsInput)[] = ["hp", "atk", "def", "spatk", "spdef", "spe"];

export default function StatInputGroup({ stats, onChange }: StatInputGroupProps) {
  const { messages: t } = useI18n();
  const labels: Record<keyof StatsInput, string> = {
    hp: t.stats.hp,
    atk: t.stats.atk,
    def: t.stats.def,
    spatk: t.stats.spatk,
    spdef: t.stats.spdef,
    spe: t.stats.spe,
  };

  function handleChange(key: keyof StatsInput, value: string) {
    onChange({ ...stats, [key]: value });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {STAT_KEYS.map((key) => (
        <div key={key}>
          <label className="block text-sm text-poke-subtext mb-1">{labels[key]}</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={stats[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 rounded bg-poke-surface border border-poke-border text-poke-text focus:outline-none focus:border-poke-blue min-h-[44px]"
          />
        </div>
      ))}
    </div>
  );
}
