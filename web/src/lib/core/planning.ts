export function catchesForConfidence(pSingle: number, confidence: number): number {
  if (pSingle <= 0) return -1;
  if (pSingle >= 1) return 1;
  if (confidence >= 1) return -1;
  return Math.ceil(Math.log(1.0 - confidence) / Math.log(1.0 - pSingle));
}
