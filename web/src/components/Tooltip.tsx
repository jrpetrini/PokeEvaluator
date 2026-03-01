"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  return (
    <span className="relative inline-flex items-center" ref={ref}>
      {children}
      <button
        type="button"
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-poke-border/60 text-poke-subtext hover:text-white hover:bg-poke-border text-[10px] font-bold leading-none transition-colors shrink-0"
        aria-label="Help"
      >
        ?
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-poke-text bg-poke-surface border border-poke-border rounded shadow-lg leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-poke-surface border-r border-b border-poke-border rotate-45 -translate-y-1" />
          </div>
        </div>
      )}
    </span>
  );
}
