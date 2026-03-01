"use client";

import { useState, useRef, useEffect } from "react";
import { NATURE_LIST } from "@/lib/data/natures";
import { useI18n } from "@/lib/i18n";

const STAT_LABELS: Record<string, string> = {
  hp: "HP", atk: "Atk", def_: "Def", spatk: "SpA", spdef: "SpD", spe: "Spe",
};

interface NatureSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NatureSelect({ value, onChange }: NatureSelectProps) {
  const { messages: t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? NATURE_LIST.filter((n) => n.name.toLowerCase().includes(query.toLowerCase()))
    : NATURE_LIST;

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
      <label className="block text-sm text-poke-subtext mb-1">{t.form.nature}</label>
      <input
        type="text"
        value={query}
        placeholder={t.form.naturePlaceholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(""); }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-2 rounded bg-poke-surface border border-poke-border text-poke-text placeholder:text-poke-subtext focus:outline-none focus:border-poke-blue"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-poke-surface border border-poke-border rounded shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((nature) => (
            <li
              key={nature.name}
              onClick={() => { onChange(nature.name); setQuery(nature.name); setOpen(false); }}
              className="px-3 py-2 cursor-pointer hover:bg-poke-border/50 text-sm flex justify-between"
            >
              <span>{nature.name}</span>
              {nature.boost && nature.penalty && (
                <span className="text-xs">
                  <span className="text-iv-excellent">+{STAT_LABELS[nature.boost]}</span>
                  {" "}
                  <span className="text-iv-weak">-{STAT_LABELS[nature.penalty]}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
