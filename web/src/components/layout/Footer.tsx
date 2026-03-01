"use client";

import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { messages: t } = useI18n();
  return (
    <footer className="border-t border-poke-border py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-poke-subtext space-y-1">
        <p>
          {t.footer.madeWith}{" "}
          <a
            href="https://github.com/jrpetrini/PokeEvaluator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-poke-blue hover:underline"
          >
            PokeEvaluator
          </a>
        </p>
        <p className="text-xs">{t.footer.trademark}</p>
      </div>
    </footer>
  );
}
