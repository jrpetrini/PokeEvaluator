"use client";

import { Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageSwitcher({ locale, onChange }: LanguageSwitcherProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange("pt-BR")}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          locale === "pt-BR"
            ? "bg-poke-surface text-white"
            : "text-poke-subtext hover:text-white"
        }`}
        aria-label="Português"
        title="Português (BR/PT)"
      >
        PT
      </button>
      <button
        onClick={() => onChange("en")}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          locale === "en"
            ? "bg-poke-surface text-white"
            : "text-poke-subtext hover:text-white"
        }`}
        aria-label="English"
        title="English (US/GB)"
      >
        EN
      </button>
    </div>
  );
}
