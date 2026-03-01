import { describe, it, expect } from "vitest";
import { catchesForConfidence } from "@/lib/core/planning";

describe("catchesForConfidence", () => {
  it("returns 1 when p >= 1", () => {
    expect(catchesForConfidence(1.0, 0.9)).toBe(1);
  });

  it("returns -1 when p <= 0 (impossible)", () => {
    expect(catchesForConfidence(0, 0.9)).toBe(-1);
  });

  it("returns -1 when confidence >= 1 (impossible)", () => {
    expect(catchesForConfidence(0.5, 1.0)).toBe(-1);
  });

  it("50% per catch, 90% confidence = 4 catches", () => {
    // ceil(ln(0.1) / ln(0.5)) = ceil(3.32) = 4
    expect(catchesForConfidence(0.5, 0.9)).toBe(4);
  });

  it("50% per catch, 95% confidence = 5 catches", () => {
    // ceil(ln(0.05) / ln(0.5)) = ceil(4.32) = 5
    expect(catchesForConfidence(0.5, 0.95)).toBe(5);
  });

  it("10% per catch, 90% confidence = 22 catches", () => {
    expect(catchesForConfidence(0.1, 0.9)).toBe(22);
  });

  it("result is always positive for valid inputs", () => {
    for (let p = 0.01; p < 1; p += 0.1) {
      for (const c of [0.5, 0.9, 0.95, 0.99]) {
        expect(catchesForConfidence(p, c)).toBeGreaterThan(0);
      }
    }
  });
});
