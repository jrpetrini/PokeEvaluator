"use client";

import { useI18n } from "@/lib/i18n";
import Tooltip from "../Tooltip";

export default function FreshCatchBanner() {
  const { messages: t } = useI18n();
  return (
    <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 px-4 py-2 rounded text-sm">
      <Tooltip text={t.tooltips.freshCatch}>
        <span>{t.form.freshCatchWarning}</span>
      </Tooltip>
    </div>
  );
}
