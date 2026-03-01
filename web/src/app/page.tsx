"use client";

import { useState } from "react";
import { EvaluationResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import EvaluatorForm from "@/components/evaluator/EvaluatorForm";
import ResultsPanel from "@/components/results/ResultsPanel";

export default function HomePage() {
  const { messages: t } = useI18n();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t.nav.evaluator}</h1>

      <div className="bg-poke-darker border border-poke-border rounded-lg p-4 sm:p-6 mb-6">
        <EvaluatorForm
          onResult={(r) => { setResult(r); setError(""); }}
          onError={setError}
          onLoading={setLoading}
        />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-poke-subtext">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-poke-blue border-t-transparent mb-2" />
          <p>{t.results.simulating}</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-poke-darker border border-poke-border rounded-lg p-4 sm:p-6">
          <ResultsPanel result={result} />
        </div>
      )}
    </div>
  );
}
