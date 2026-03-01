"use client";

import { useState, useRef, useEffect } from "react";
import { ROLES } from "@/lib/data/roles";
import { getSpeciesRole } from "@/lib/data/roles";
import { useI18n } from "@/lib/i18n";
import Tooltip from "../Tooltip";

interface RoleSelectProps {
  value: string;
  species: string;
  onChange: (roleKey: string) => void;
}

const roleEntries = Object.entries(ROLES);

export default function RoleSelect({ value, species, onChange }: RoleSelectProps) {
  const { messages: t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Auto-suggest default role when species changes
  const suggestedRole = species ? getSpeciesRole(species) : null;
  const suggestedKey = suggestedRole
    ? roleEntries.find(([, r]) => r.name === suggestedRole.name)?.[0] ?? ""
    : "";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedRole = value ? ROLES[value] : null;

  function formatWeights(w: { hp: number; atk: number; def_: number; spatk: number; spdef: number; spe: number }) {
    return `HP:${w.hp} Atk:${w.atk} Def:${w.def_} SpA:${w.spatk} SpD:${w.spdef} Spe:${w.spe}`;
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm text-poke-subtext mb-1">
        <Tooltip text={t.tooltips.role}>
          <span>Role</span>
        </Tooltip>
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 rounded bg-poke-surface border border-poke-border text-poke-text text-left focus:outline-none focus:border-poke-blue min-h-[44px] flex justify-between items-center"
      >
        <span className={value ? "" : "text-poke-subtext"}>
          {selectedRole ? selectedRole.name : t.form.rolePlaceholder}
        </span>
        <svg className="w-4 h-4 text-poke-subtext shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Suggested default hint */}
      {suggestedKey && value !== suggestedKey && !open && (
        <button
          type="button"
          onClick={() => onChange(suggestedKey)}
          className="mt-1 text-xs text-poke-blue hover:underline"
        >
          {t.form.suggestedRole}: {suggestedRole!.name}
        </button>
      )}

      {/* Selected role weight preview */}
      {selectedRole && (
        <div className="mt-1 text-xs text-poke-subtext font-mono">
          {formatWeights(selectedRole.weights)}
        </div>
      )}

      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-poke-surface border border-poke-border rounded shadow-lg max-h-64 overflow-y-auto">
          {roleEntries.map(([key, role]) => (
            <li
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className={`px-3 py-2 cursor-pointer hover:bg-poke-border/50 text-sm ${
                key === value ? "bg-poke-border/30" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{role.name}</span>
                  {key === suggestedKey && (
                    <span className="ml-2 text-xs text-poke-blue">({t.form.default})</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-poke-subtext mt-0.5">{role.description}</div>
              <div className="text-xs text-poke-subtext font-mono mt-0.5">
                {formatWeights(role.weights)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
