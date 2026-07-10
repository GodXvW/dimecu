export type PerformancePoint = {
  month: string;
  portfolio: number;
  sp500: number;
  nasdaq: number;
};

export type MarketPerformance = {
  series: PerformancePoint[];
  source: string;
  isLive: boolean;
};

export type BacktestPoint = {
  month: string;
  strategy: number;
  benchmark: number;
};

export type BacktestResult = {
  series: BacktestPoint[];
  cagr: number;
  sharpe: number;
  maxDD: number;
  alpha: number;
  beta: number;
  benchCagr: number;
  source: string;
  isLive: boolean;
};

export const MARKET_DATA_SOURCE = "Yahoo Finance chart API";

const SYMBOLS = {
  sp500: "SPY",
  nasdaq: "QQQ",
  industrial: "DIA",
  nvda: "NVDA",
  aapl: "AAPL",
  msft: "MSFT",
} as const;

type BenchmarkKey = "sp500" | "nasdaq" | "industrial";

type PricePoint = {
  date: Date;
  close: number;
};

const cachedMonthlyCloses: Record<BenchmarkKey | "nvda" | "aapl" | "msft", number[]> = {
  sp500: [
    449.91, 436.63, 451.64, 412.00, 412.93, 377.25, 411.99, 395.18, 357.18, 386.21, 407.68, 382.43,
    406.48, 396.26, 409.39, 415.93, 417.85, 443.28, 457.79, 450.35, 427.48, 418.20, 456.40, 475.31,
    482.88, 508.08, 522.16, 501.98, 527.37, 544.22, 550.81, 563.68, 573.76, 568.64, 602.55, 586.08,
  ],
  nasdaq: [
    351.80, 345.08, 362.54, 313.25, 308.28, 280.28, 315.46, 299.27, 267.26, 284.83, 293.64, 266.28,
    294.62, 293.56, 320.93, 322.56, 347.99, 369.42, 383.68, 377.99, 358.27, 350.87, 388.83, 409.52,
    416.97, 439.00, 444.01, 424.59, 451.55, 479.11, 474.03, 476.27, 487.32, 487.43, 512.17, 511.23,
  ],
  industrial: [
    351.09, 338.36, 346.84, 329.75, 331.10, 306.23, 325.37, 317.49, 287.45, 325.91, 343.37, 331.33,
    339.80, 326.62, 332.96, 341.37, 329.59, 343.97, 355.14, 347.17, 337.10, 330.70, 362.41, 376.87,
    382.32, 388.41, 398.70, 380.13, 401.40, 391.89, 408.35, 415.69, 422.49, 417.06, 443.48, 424.66,
  ],
  nvda: [
    24.47, 24.31, 27.29, 18.58, 18.70, 15.13, 18.14, 15.03, 12.15, 13.49, 16.91, 14.61,
    19.52, 23.21, 27.75, 27.72, 37.86, 42.33, 46.72, 49.35, 43.50, 40.82, 46.77, 49.52,
    61.53, 79.11, 90.36, 86.40, 109.63, 123.54, 117.02, 119.37, 121.44, 135.40, 138.25, 134.29,
  ],
  aapl: [
    174.78, 165.12, 174.61, 157.65, 148.84, 136.72, 162.51, 157.22, 138.20, 153.34, 148.03, 129.93,
    144.29, 147.41, 164.90, 169.68, 177.25, 193.97, 196.45, 187.87, 171.21, 170.77, 189.95, 192.53,
    184.40, 180.75, 171.48, 170.33, 192.25, 210.62, 222.08, 229.00, 233.00, 225.91, 237.33, 250.42,
  ],
  msft: [
    310.98, 298.79, 308.31, 277.52, 271.87, 256.83, 280.74, 261.47, 232.90, 232.13, 255.14, 239.82,
    247.81, 249.42, 288.30, 307.26, 328.39, 340.54, 335.92, 327.76, 315.75, 338.11, 378.91, 376.04,
    397.58, 413.64, 420.72, 389.33, 415.13, 446.95, 418.35, 417.14, 430.30, 406.35, 423.46, 421.50,
  ],
};

function cachedPriceSeries(key: keyof typeof cachedMonthlyCloses): PricePoint[] {
  return cachedMonthlyCloses[key].map((close, index) => {
    const date = new Date("2022-01-31T00:00:00");
    date.setMonth(date.getMonth() + index);
    return { date, close };
  });
}

function unixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

function rebase(points: PricePoint[]) {
  const first = points[0]?.close || 1;
  return points.map((p) => ({ ...p, value: +(p.close / first * 100).toFixed(2) }));
}

function filterByDate(points: PricePoint[], startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T23:59:59`).getTime();
  return points.filter((point) => point.date.getTime() >= start && point.date.getTime() <= end);
}

async function fetchYahooMonthly(symbol: string, start: Date, end: Date): Promise<PricePoint[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${unixSeconds(start)}&period2=${unixSeconds(end)}&interval=1mo&events=history&includeAdjustedClose=true`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Market data request failed for ${symbol}`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const timestamps = result?.timestamp as number[] | undefined;
  const closes = result?.indicators?.quote?.[0]?.close as Array<number | null> | undefined;
  if (!timestamps?.length || !closes?.length) {
    throw new Error(`No market data returned for ${symbol}`);
  }

  return timestamps
    .map((timestamp, index) => ({ date: new Date(timestamp * 1000), close: Number(closes[index]) }))
    .filter((point) => Number.isFinite(point.close));
}

function toDashboardRows(
  sp500Prices: PricePoint[],
  nasdaqPrices: PricePoint[],
  nvdaPrices: PricePoint[],
  aaplPrices: PricePoint[],
  msftPrices: PricePoint[],
) {
  const sp500 = rebase(sp500Prices);
  const nasdaq = rebase(nasdaqPrices);
  const nvda = rebase(nvdaPrices);
  const aapl = rebase(aaplPrices);
  const msft = rebase(msftPrices);

  return sp500
    .map((sp) => {
      const key = monthKey(sp.date);
      const nq = nasdaq.find((p) => monthKey(p.date) === key);
      const n = nvda.find((p) => monthKey(p.date) === key);
      const a = aapl.find((p) => monthKey(p.date) === key);
      const m = msft.find((p) => monthKey(p.date) === key);
      if (!nq || !n || !a || !m) return undefined;

      return {
        month: monthLabel(sp.date),
        portfolio: +(n.value * 0.4 + a.value * 0.3 + m.value * 0.3).toFixed(2),
        sp500: sp.value,
        nasdaq: nq.value,
      };
    })
    .filter((row): row is PerformancePoint => Boolean(row))
    .slice(-24);
}

export async function fetchDashboardPerformance(): Promise<MarketPerformance> {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 30);

  try {
    const [sp500, nasdaq, nvda, aapl, msft] = await Promise.all([
      fetchYahooMonthly(SYMBOLS.sp500, start, end),
      fetchYahooMonthly(SYMBOLS.nasdaq, start, end),
      fetchYahooMonthly(SYMBOLS.nvda, start, end),
      fetchYahooMonthly(SYMBOLS.aapl, start, end),
      fetchYahooMonthly(SYMBOLS.msft, start, end),
    ]);
    const rows = toDashboardRows(sp500, nasdaq, nvda, aapl, msft);

    if (rows.length < 6) throw new Error("Not enough live market points");
    return { series: rows, source: MARKET_DATA_SOURCE, isLive: true };
  } catch {
    return {
      series: toDashboardRows(
        cachedPriceSeries("sp500"),
        cachedPriceSeries("nasdaq"),
        cachedPriceSeries("nvda"),
        cachedPriceSeries("aapl"),
        cachedPriceSeries("msft"),
      ),
      source: "cached 2022-2024 ETF/equity monthly closes",
      isLive: false,
    };
  }
}

function returnsFromSeries(series: BacktestPoint[], key: "strategy" | "benchmark") {
  return series.slice(1).map((point, i) => point[key] / series[i][key] - 1);
}

function covariance(a: number[], b: number[]) {
  const meanA = a.reduce((sum, value) => sum + value, 0) / Math.max(a.length, 1);
  const meanB = b.reduce((sum, value) => sum + value, 0) / Math.max(b.length, 1);
  return a.reduce((sum, value, i) => sum + (value - meanA) * ((b[i] ?? meanB) - meanB), 0) / Math.max(a.length, 1);
}

function buildBacktestResult(prices: PricePoint[], risk: number, source: string, isLive: boolean): BacktestResult {
  const benchmarkSeries = rebase(prices);
  const riskTilt = risk === 0 ? 0.82 : risk === 1 ? 1.03 : 1.22;
  let strategy = 100;

  const series: BacktestPoint[] = benchmarkSeries.map((point, index) => {
    if (index > 0) {
      const prev = benchmarkSeries[index - 1]?.value ?? point.value;
      const monthlyReturn = point.value / prev - 1;
      const prior = benchmarkSeries[index - 2]?.value ?? prev;
      const momentumBoost = prev > prior ? 0.0035 : -0.0025;
      strategy *= 1 + monthlyReturn * riskTilt + momentumBoost;
    }

    return {
      month: monthLabel(point.date),
      strategy: +strategy.toFixed(2),
      benchmark: point.value,
    };
  });

  const years = Math.max(series.length / 12, 1 / 12);
  const finalStrategy = series.at(-1)?.strategy || 100;
  const finalBenchmark = series.at(-1)?.benchmark || 100;
  const strategyReturns = returnsFromSeries(series, "strategy");
  const benchmarkReturns = returnsFromSeries(series, "benchmark");
  const mean = strategyReturns.reduce((sum, value) => sum + value, 0) / Math.max(strategyReturns.length, 1);
  const std = Math.sqrt(strategyReturns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(strategyReturns.length, 1));
  let peak = 100;
  const maxDD = series.reduce((drawdown, point) => {
    peak = Math.max(peak, point.strategy);
    return Math.min(drawdown, point.strategy / peak - 1);
  }, 0);
  const cagr = Math.pow(finalStrategy / 100, 1 / years) - 1;
  const benchCagr = Math.pow(finalBenchmark / 100, 1 / years) - 1;
  const benchVar = covariance(benchmarkReturns, benchmarkReturns);
  const beta = benchVar ? covariance(strategyReturns, benchmarkReturns) / benchVar : riskTilt;
  const alpha = cagr - (0.02 + beta * (benchCagr - 0.02));

  return {
    series,
    cagr,
    sharpe: std ? (mean / std) * Math.sqrt(12) : 0,
    maxDD,
    alpha,
    beta,
    benchCagr,
    source,
    isLive,
  };
}

export async function fetchBacktestResult(
  benchmark: BenchmarkKey,
  startDate: string,
  endDate: string,
  risk: number,
): Promise<BacktestResult> {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);

  try {
    const prices = await fetchYahooMonthly(SYMBOLS[benchmark], start, end);
    if (prices.length < 3) throw new Error("Not enough live benchmark points");
    return buildBacktestResult(prices, risk, MARKET_DATA_SOURCE, true);
  } catch {
    const prices = filterByDate(cachedPriceSeries(benchmark), startDate, endDate);
    return buildBacktestResult(prices.length >= 3 ? prices : cachedPriceSeries(benchmark), risk, "cached 2022-2024 ETF monthly closes", false);
  }
}
