"use client";

import { useI18n } from "@/lib/i18n";

interface CatchPlanningProps {
  catches90: number;
  catches95: number;
}

export default function CatchPlanning({ catches90, catches95 }: CatchPlanningProps) {
  const { messages: t } = useI18n();
  return (
    <div>
      <h3 className="text-sm font-semibold text-poke-subtext mb-2">{t.results.planningTitle}</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-poke-subtext">{t.results.catches90}</span>
          <span className="font-medium">{catches90}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-poke-subtext">{t.results.catches95}</span>
          <span className="font-medium">{catches95}</span>
        </div>
      </div>
    </div>
  );
}
