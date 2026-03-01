"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);

  const POPUP_WIDTH = 256; // w-64
  const MARGIN = 8;

  const computePosition = useCallback(() => {
    if (!buttonRef.current || !popupRef.current) return;
    const btn = buttonRef.current.getBoundingClientRect();
    const popup = popupRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // prefer above; if not enough space, go below
    const above = btn.top - popup.height - MARGIN > 0;
    const top = above
      ? btn.top - popup.height - MARGIN
      : btn.bottom + MARGIN;

    // center on button, then clamp to viewport
    let left = btn.left + btn.width / 2 - POPUP_WIDTH / 2;
    left = Math.max(MARGIN, Math.min(left, vw - POPUP_WIDTH - MARGIN));

    // extra check: if below also overflows, just pin to bottom
    const finalTop = !above && top + popup.height > vh
      ? vh - popup.height - MARGIN
      : top;

    setPos({ top: finalTop, left, above });
  }, []);

  useEffect(() => {
    if (!show) { setPos(null); return; }
    // compute once popup is rendered
    requestAnimationFrame(computePosition);
  }, [show, computePosition]);

  // close on click outside (mobile)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShow(false);
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  // close on scroll/resize to avoid stale position
  useEffect(() => {
    if (!show) return;
    const close = () => setShow(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [show]);

  return (
    <span className="relative inline-flex items-center" ref={containerRef}>
      {children}
      <button
        ref={buttonRef}
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
        <div
          ref={popupRef}
          style={pos ? { top: pos.top, left: pos.left, width: POPUP_WIDTH } : { visibility: "hidden", top: 0, left: 0, width: POPUP_WIDTH }}
          className="fixed z-50 px-3 py-2 text-xs text-poke-text bg-poke-surface border border-poke-border rounded shadow-lg leading-relaxed"
        >
          {text}
          {pos && (
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={pos.above ? { top: "100%", marginTop: "-1px" } : { bottom: "100%", marginBottom: "-1px" }}
            >
              <div
                className={`w-2 h-2 bg-poke-surface border-poke-border ${
                  pos.above ? "border-r border-b rotate-45 -translate-y-1" : "border-l border-t rotate-45 translate-y-1"
                }`}
              />
            </div>
          )}
        </div>
      )}
    </span>
  );
}
