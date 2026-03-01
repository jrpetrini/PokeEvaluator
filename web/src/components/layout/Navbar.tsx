"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n, Locale } from "@/lib/i18n";
import LanguageSwitcher from "../LanguageSwitcher";

interface NavbarProps {
  onLocaleChange: (locale: Locale) => void;
}

export default function Navbar({ onLocaleChange }: NavbarProps) {
  const { locale, messages: t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.evaluator },
    { href: "/pokedex", label: t.nav.pokedex },
    { href: "/naturezas", label: t.nav.natures },
    { href: "/metodologia", label: t.nav.methodology },
  ];

  return (
    <nav className="bg-poke-darker border-b border-poke-border">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="text-lg font-bold text-white tracking-tight">
          PokeEvaluator
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-poke-subtext hover:text-white transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-poke-subtext hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-poke-border px-4 py-3 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-poke-subtext hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
          </div>
        </div>
      )}
    </nav>
  );
}
