const DEFAULT_N_SAMPLES = 200_000;

export function runMonteCarloWorker(
  weights: number[],
  q: number,
  nSamples: number = DEFAULT_N_SAMPLES
): Promise<{ percentile: number }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../../workers/montecarlo.worker.ts", import.meta.url)
    );
    worker.onmessage = (e: MessageEvent<{ percentile: number }>) => {
      resolve(e.data);
      worker.terminate();
    };
    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };
    worker.postMessage({ weights, q, nSamples });
  });
}
