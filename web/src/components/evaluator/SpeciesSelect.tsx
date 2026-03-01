"use client";

import { useState, useRef, useEffect } from "react";
import { POKEMON_NAMES } from "@/lib/data/pokedex";
import { useI18n } from "@/lib/i18n";
import Tooltip from "../Tooltip";

interface SpeciesSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SpeciesSelect({ value, onChange }: SpeciesSelectProps) {
  const { messages: t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? POKEMON_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : POKEMON_NAMES.slice(0, 10);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm text-poke-subtext mb-1">
        <Tooltip text={t.tooltips.species}><span>{t.form.species}</span></Tooltip>
      </label>
      <input
        type="text"
        value={query}
        placeholder={t.form.speciesPlaceholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(""); }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-2 rounded bg-poke-surface border border-poke-border text-poke-text placeholder:text-poke-subtext focus:outline-none focus:border-poke-blue"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-poke-surface border border-poke-border rounded shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((name) => (
            <li
              key={name}
              onClick={() => { onChange(name); setQuery(name); setOpen(false); }}
              className="px-3 py-2 cursor-pointer hover:bg-poke-border/50 text-sm"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
