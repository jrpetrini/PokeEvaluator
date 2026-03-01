// Self-contained Monte Carlo worker — all logic inlined to avoid module resolution
// issues when Next.js copies the worker to the output directory.

const MAX_IV = 31;
const NATURE_BOOST = 1.1;
const NATURE_PENALTY = 0.9;
const NATURE_PENALTY_WEIGHT = 1.5;

// 25 natures as [boost_index, penalty_index] pairs (-1 = neutral)
// Index mapping: 0=HP, 1=ATK, 2=DEF, 3=SPATK, 4=SPDEF, 5=SPE
const NATURE_DEFS: [number, number][] = [
  [-1, -1], // Hardy
  [1, 2],   // Lonely: +ATK -DEF
  [1, 5],   // Brave: +ATK -SPE
  [1, 3],   // Adamant: +ATK -SPATK
  [1, 4],   // Naughty: +ATK -SPDEF
  [2, 1],   // Bold: +DEF -ATK
  [-1, -1], // Docile
  [2, 5],   // Relaxed: +DEF -SPE
  [2, 3],   // Impish: +DEF -SPATK
  [2, 4],   // Lax: +DEF -SPDEF
  [5, 1],   // Timid: +SPE -ATK
  [5, 2],   // Hasty: +SPE -DEF
  [-1, -1], // Serious
  [5, 3],   // Jolly: +SPE -SPATK
  [5, 4],   // Naive: +SPE -SPDEF
  [3, 1],   // Modest: +SPATK -ATK
  [3, 2],   // Mild: +SPATK -DEF
  [3, 5],   // Quiet: +SPATK -SPE
  [-1, -1], // Bashful
  [3, 4],   // Rash: +SPATK -SPDEF
  [4, 1],   // Calm: +SPDEF -ATK
  [4, 2],   // Gentle: +SPDEF -DEF
  [4, 5],   // Sassy: +SPDEF -SPE
  [4, 3],   // Careful: +SPDEF -SPATK
  [-1, -1], // Quirky
];

const NUM_NATURES = NATURE_DEFS.length;

// Build nature modifier table (25 x 6)
const natureTable = new Float64Array(NUM_NATURES * 6);
for (let i = 0; i < NUM_NATURES; i++) {
  const [boost, penalty] = NATURE_DEFS[i];
  const offset = i * 6;
  for (let j = 0; j < 6; j++) natureTable[offset + j] = 1.0;
  if (boost >= 0) {
    natureTable[offset + boost] = NATURE_BOOST;
    natureTable[offset + penalty] = NATURE_PENALTY;
  }
}

function computeQMax(weights: number[]): number {
  let neutralMax = 0;
  for (let i = 0; i < 6; i++) neutralMax += weights[i] * MAX_IV;

  const nonHp = weights.slice(1);
  const maxW = Math.max(...nonHp);
  const minW = Math.min(...nonHp);

  if (maxW === minW) {
    const boostGain = NATURE_BOOST - 1.0;
    const penaltyCost = NATURE_PENALTY_WEIGHT * (1.0 - NATURE_PENALTY);
    const increment = MAX_IV * nonHp[0] * (boostGain - penaltyCost);
    return neutralMax + Math.max(0, increment);
  }

  const bestIdx = 1 + nonHp.indexOf(maxW);
  const worstIdx = 1 + nonHp.indexOf(minW);

  const optimalMods = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
  optimalMods[bestIdx] = NATURE_BOOST;
  optimalMods[worstIdx] = 1.0 - NATURE_PENALTY_WEIGHT * (1.0 - NATURE_PENALTY);

  let qMaxNature = 0;
  for (let i = 0; i < 6; i++) qMaxNature += weights[i] * MAX_IV * optimalMods[i];
  return Math.max(neutralMax, qMaxNature);
}

interface WorkerMessage {
  weights: number[];
  q: number;
  nSamples: number;
}

self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  const { weights, q, nSamples } = e.data;
  const qMax = computeQMax(weights);

  const qValues = new Float64Array(nSamples);

  for (let i = 0; i < nSamples; i++) {
    const natureIdx = Math.floor(Math.random() * NUM_NATURES);
    const natureOffset = natureIdx * 6;

    let actual = 0;
    for (let j = 0; j < 6; j++) {
      const iv = Math.floor(Math.random() * (MAX_IV + 1));
      const mod = natureTable[natureOffset + j];
      const effMod = mod >= 1.0 ? mod : 1.0 - NATURE_PENALTY_WEIGHT * (1.0 - mod);
      actual += weights[j] * iv * effMod;
    }
    qValues[i] = Math.max(0, Math.min(1, actual / qMax));
  }

  qValues.sort();

  // Binary search for percentile
  let lo = 0, hi = qValues.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (qValues[mid] <= q) lo = mid + 1;
    else hi = mid;
  }
  const percentile = (lo / nSamples) * 100;

  self.postMessage({ percentile });
};
