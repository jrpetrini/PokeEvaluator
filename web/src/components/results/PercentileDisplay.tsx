"use client";

import { useI18n } from "@/lib/i18n";
import Tooltip from "../Tooltip";

interface PercentileDisplayProps {
  percentile: number;
}

export default function PercentileDisplay({ percentile }: PercentileDisplayProps) {
  const { messages: t } = useI18n();
  return (
    <div className="flex justify-between items-center text-sm">
      <Tooltip text={t.tooltips.percentile}><span className="text-poke-subtext">{t.results.percentile}</span></Tooltip>
      <span className="font-bold">{percentile.toFixed(1)}%</span>
    </div>
  );
}
