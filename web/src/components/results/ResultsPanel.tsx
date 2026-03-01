"use client";

import { EvaluationResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import Tooltip from "../Tooltip";
import IVTable from "./IVTable";
import QualityBar from "./QualityBar";
import NatureAssessment from "./NatureAssessment";
import PercentileDisplay from "./PercentileDisplay";
import CatchPlanning from "./CatchPlanning";

interface ResultsPanelProps {
  result: EvaluationResult;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const { messages: t } = useI18n();
  const p = result.pokemon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b border-poke-border pb-3">
        <h2 className="text-lg font-bold">
          {p.species}
          {p.gender && <span className="ml-1 text-poke-subtext">{p.gender}</span>}
          <span className="text-sm font-normal text-poke-subtext ml-2">
            Lv.{p.level}
          </span>
        </h2>
        {p.ability && (
          <span className="text-sm text-poke-subtext">{p.ability}</span>
        )}
      </div>

      {/* IV Table */}
      <IVTable ivs={result.ivs} />

      {/* Quality */}
      <div className="space-y-3">
        <QualityBar q={result.qualityScore} />
        <PercentileDisplay percentile={result.percentile} />
        <div className="flex justify-between items-center text-sm">
          <Tooltip text={t.tooltips.role}><span className="text-poke-subtext">{t.results.role}</span></Tooltip>
          <span className="font-medium text-iv-good">{result.roleName}</span>
        </div>
        <NatureAssessment
          natureName={result.pokemon.nature}
          assessment={result.natureAssessment}
        />
      </div>

      {/* Catch Planning */}
      <CatchPlanning catches90={result.catchesFor90} catches95={result.catchesFor95} />
    </div>
  );
}
