"use client";

import { useState } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { I18nContext, Locale, getMessages } from "@/lib/i18n";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pt-BR");
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        <I18nContext.Provider value={{ locale, messages }}>
          <Navbar onLocaleChange={setLocale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nContext.Provider>
      </body>
    </html>
  );
}
