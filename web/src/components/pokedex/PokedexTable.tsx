"use client";

import { useState, useMemo } from "react";
import { POKEDEX } from "@/lib/data/pokedex";
import { useI18n } from "@/lib/i18n";

type SortKey = "name" | "hp" | "atk" | "def" | "spatk" | "spdef" | "spe" | "total";
type SortDir = "asc" | "desc";

export default function PokedexTable() {
  const { messages: t } = useI18n();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const entries = useMemo(() => {
    return Object.entries(POKEDEX).map(([name, stats]) => ({
      name,
      ...stats,
      total: stats.hp + stats.atk + stats.def_ + stats.spatk + stats.spdef + stats.spe,
    }));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = q ? entries.filter((e) => e.name.toLowerCase().includes(q)) : entries;
    result = [...result].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "name") { av = a.name; bv = b.name; }
      else if (sortKey === "def") { av = a.def_; bv = b.def_; }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return result;
  }, [entries, search, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "name" ? "asc" : "desc"); }
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: "name", label: "Pokémon" },
    { key: "hp", label: "HP" },
    { key: "atk", label: "Atk" },
    { key: "def", label: "Def" },
    { key: "spatk", label: "SpAtk" },
    { key: "spdef", label: "SpDef" },
    { key: "spe", label: "Spe" },
    { key: "total", label: t.pokedexPage.total },
  ];

  const arrow = (key: SortKey) => sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div>
      <input
        type="text"
        placeholder={t.pokedexPage.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm mb-4 px-3 py-2 rounded bg-poke-surface border border-poke-border text-poke-text placeholder:text-poke-subtext focus:outline-none focus:border-poke-blue"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-poke-border">
              {cols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-2 cursor-pointer hover:text-white transition-colors ${
                    col.key === "name" ? "text-left" : "text-right"
                  } text-poke-subtext`}
                >
                  {col.label}{arrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.name} className="border-b border-poke-border/50 hover:bg-poke-surface/50">
                <td className="px-3 py-2 font-medium">{e.name}</td>
                <td className="px-3 py-2 text-right">{e.hp}</td>
                <td className="px-3 py-2 text-right">{e.atk}</td>
                <td className="px-3 py-2 text-right">{e.def_}</td>
                <td className="px-3 py-2 text-right">{e.spatk}</td>
                <td className="px-3 py-2 text-right">{e.spdef}</td>
                <td className="px-3 py-2 text-right">{e.spe}</td>
                <td className="px-3 py-2 text-right font-bold">{e.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
