"use client";

import { IVSet, STAT_ORDER, getIvRange, ivRangeIsExact, ivRangeValue, StatName } from "@/lib/types";
import { assessIv } from "@/lib/core/quality";
import { useI18n } from "@/lib/i18n";

function ivColor(iv: number): string {
  if (iv >= 28) return "text-iv-excellent";
  if (iv >= 20) return "text-iv-good";
  if (iv >= 10) return "text-iv-mediocre";
  return "text-iv-weak";
}

const STAT_LABEL_MAP: Record<string, string> = {
  hp: "HP", atk: "Atk", def_: "Def", spatk: "SpAtk", spdef: "SpDef", spe: "Spe",
};

interface IVTableProps {
  ivs: IVSet;
}

export default function IVTable({ ivs }: IVTableProps) {
  const { messages: t } = useI18n();

  const statLabels: Record<StatName, string> = {
    [StatName.HP]: t.stats.hp,
    [StatName.ATK]: t.stats.atk,
    [StatName.DEF]: t.stats.def,
    [StatName.SPATK]: t.stats.spatk,
    [StatName.SPDEF]: t.stats.spdef,
    [StatName.SPE]: t.stats.spe,
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-poke-subtext mb-2">{t.results.ivTableTitle}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-poke-border">
              <th className="px-3 py-1 text-left text-poke-subtext">{t.results.ivColStat}</th>
              <th className="px-3 py-1 text-center text-poke-subtext">{t.results.ivColRange}</th>
              <th className="px-3 py-1 text-center text-poke-subtext">{t.results.ivColValue}</th>
              <th className="px-3 py-1 text-center text-poke-subtext">{t.results.ivColQuality}</th>
            </tr>
          </thead>
          <tbody>
            {STAT_ORDER.map((stat) => {
              const range = getIvRange(ivs, stat);
              const val = ivRangeValue(range);
              const color = ivColor(val);
              const quality = assessIv(val);
              const rangeStr = ivRangeIsExact(range)
                ? String(range.minIv)
                : `${range.minIv}-${range.maxIv}`;
              return (
                <tr key={stat} className="border-b border-poke-border/50">
                  <td className="px-3 py-1 font-medium">{statLabels[stat]}</td>
                  <td className="px-3 py-1 text-center">{rangeStr}</td>
                  <td className={`px-3 py-1 text-center ${color}`}>{val}</td>
                  <td className={`px-3 py-1 text-center ${color}`}>{quality}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
