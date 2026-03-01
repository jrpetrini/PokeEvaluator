"use client";

import { useI18n } from "@/lib/i18n";
import Tooltip from "../Tooltip";
import { getNature } from "@/lib/data/natures";

const STAT_LABELS: Record<string, string> = {
  hp: "HP", atk: "Atk", def_: "Def", spatk: "SpA", spdef: "SpD", spe: "Spe",
};

function assessColor(assessment: string): string {
  const map: Record<string, string> = {
    Excelente: "text-nature-excellent",
    Boa: "text-nature-good",
    "Aceitável": "text-nature-acceptable",
    Ruim: "text-nature-bad",
    Neutra: "text-nature-neutral",
  };
  return map[assessment] ?? "";
}

interface NatureAssessmentProps {
  natureName: string;
  assessment: string;
}

export default function NatureAssessment({ natureName, assessment }: NatureAssessmentProps) {
  const { messages: t } = useI18n();
  const nature = getNature(natureName);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <div className="text-sm text-poke-subtext">
        <Tooltip text={t.tooltips.natureAssessment}><span>{t.results.natureAssessment}</span></Tooltip>:
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-bold ${assessColor(assessment)}`}>{assessment}</span>
        <span className="text-sm text-poke-subtext">—</span>
        <span className="text-sm">
          {natureName}
          {nature.boost && nature.penalty && (
            <>
              {" ("}
              <span className="text-iv-excellent">+{STAT_LABELS[nature.boost]}</span>
              {" "}
              <span className="text-iv-weak">-{STAT_LABELS[nature.penalty]}</span>
              {")"}
            </>
          )}
          {!nature.boost && <span className="text-nature-neutral"> ({t.naturesPage.neutral})</span>}
        </span>
      </div>
    </div>
  );
}
