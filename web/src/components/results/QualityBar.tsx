"use client";

import { useI18n } from "@/lib/i18n";
import Tooltip from "../Tooltip";

function qColor(q: number): string {
  if (q >= 0.8) return "bg-q-excellent";
  if (q >= 0.6) return "bg-q-good";
  if (q >= 0.4) return "bg-q-mediocre";
  return "bg-q-weak";
}

function qTextColor(q: number): string {
  if (q >= 0.8) return "text-q-excellent";
  if (q >= 0.6) return "text-q-good";
  if (q >= 0.4) return "text-q-mediocre";
  return "text-q-weak";
}

interface QualityBarProps {
  q: number;
}

export default function QualityBar({ q }: QualityBarProps) {
  const { messages: t } = useI18n();
  const pct = Math.round(q * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <Tooltip text={t.tooltips.qualityScore}><span className="text-poke-subtext">{t.results.qualityScore}</span></Tooltip>
        <span className={`font-bold ${qTextColor(q)}`}>{(q * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-poke-darker rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${qColor(q)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
