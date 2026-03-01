"use client";

import { NATURE_LIST } from "@/lib/data/natures";
import { useI18n } from "@/lib/i18n";

const STAT_LABELS: Record<string, string> = {
  hp: "HP", atk: "Atk", def_: "Def", spatk: "SpAtk", spdef: "SpDef", spe: "Spe",
};

export default function NaturesTable() {
  const { messages: t } = useI18n();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-poke-border">
            <th className="px-3 py-2 text-left text-poke-subtext">{t.naturesPage.nature}</th>
            <th className="px-3 py-2 text-left text-poke-subtext">{t.naturesPage.boost}</th>
            <th className="px-3 py-2 text-left text-poke-subtext">{t.naturesPage.penalty}</th>
          </tr>
        </thead>
        <tbody>
          {NATURE_LIST.map((n) => (
            <tr key={n.name} className="border-b border-poke-border/50 hover:bg-poke-surface/50">
              <td className="px-3 py-2 font-medium">{n.name}</td>
              <td className="px-3 py-2 text-iv-excellent">
                {n.boost ? `+${STAT_LABELS[n.boost]}` : "—"}
              </td>
              <td className="px-3 py-2 text-iv-weak">
                {n.penalty ? `-${STAT_LABELS[n.penalty]}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
