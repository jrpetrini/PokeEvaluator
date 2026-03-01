"use client";

import { useI18n } from "@/lib/i18n";
import NaturesTable from "@/components/natures/NaturesTable";

export default function NaturesPage() {
  const { messages: t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t.naturesPage.title}</h1>
      <NaturesTable />
    </div>
  );
}
