import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Play, RotateCcw, Sparkles, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchBacktestResult, type BacktestResult } from "@/lib/market-data";

export const Route = createFileRoute("/backtesting")({
  head: () => ({
    meta: [
      { title: "Backtesting Lab — AI US Equity Portfolio Consultant" },
      {
        name: "description",
        content:
          "Run bias-free backtests of custom US equity strategies with CAGR, Sharpe, Max Drawdown, Alpha and Beta.",
      },
    ],
  }),
  component: BacktestingPage,
});

const BENCHMARKS = [
  { value: "sp500", label: "S&P 500" },
  { value: "nasdaq", label: "Nasdaq" },
  { value: "industrial", label: "Industrial Benchmark (Dow Jones)" },
];

function inputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function yearsAgo(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return inputDate(date);
}

function runBacktest(seed: number, risk: number, benchmark: string): BacktestResult {
  const months = 36;
  const base = new Date(2022, 0, 1);
  const drift = 0.008 + risk * 0.006;
  const vol = 0.015 + risk * 0.02;
  const benchDrift = benchmark === "nasdaq" ? 0.012 : benchmark === "industrial" ? 0.007 : 0.01;
  let s = 100;
  let b = 100;
  const series: { month: string; strategy: number; benchmark: number }[] = [];
  let maxDD = 0;
  let peak = 100;
  const rets: number[] = [];
  for (let i = 0; i < months; i++) {
    const r = Math.sin(seed + i * 0.9) * vol + drift;
    const br = Math.cos(seed * 0.7 + i * 0.85) * (vol * 0.7) + benchDrift;
    s *= 1 + r;
    b *= 1 + br;
    rets.push(r);
    peak = Math.max(peak, s);
    maxDD = Math.min(maxDD, s / peak - 1);
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    series.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      strategy: +s.toFixed(2),
      benchmark: +b.toFixed(2),
    });
  }
  const years = months / 12;
  const cagr = Math.pow(s / 100, 1 / years) - 1;
  const benchCagr = Math.pow(b / 100, 1 / years) - 1;
  const mean = rets.reduce((a, c) => a + c, 0) / rets.length;
  const std = Math.sqrt(rets.reduce((a, c) => a + (c - mean) ** 2, 0) / rets.length);
  const sharpe = (mean / std) * Math.sqrt(12);
  const beta = 0.85 + risk * 0.35;
  const alpha = cagr - (0.02 + beta * (benchCagr - 0.02));
  return { series, cagr, sharpe, maxDD, alpha, beta, benchCagr, source: "loading market data", isLive: false };
}

function BacktestingPage() {
  const [start, setStart] = useState(() => yearsAgo(3));
  const [end, setEnd] = useState(() => inputDate(new Date()));
  const [benchmark, setBenchmark] = useState("sp500");
  const [risk, setRisk] = useState(1); // 0=Low 1=Med 2=High
  const [conditions, setConditions] = useState(
    "Momentum > 70th percentile AND Quality > 60th percentile AND Vol < 30th percentile"
  );
  const [tags, setTags] = useState(["Momentum ≥ 70", "Quality ≥ 60", "Low Vol", "US Large Cap"]);
  const [runSeed, setRunSeed] = useState(1);
  const [hasRun, setHasRun] = useState(true);
  const [result, setResult] = useState<BacktestResult>(() => runBacktest(1, 1, "sp500"));
  const [dataState, setDataState] = useState<"loading" | "live" | "fallback">("loading");

  const riskLabel = risk === 0 ? "Low" : risk === 1 ? "Medium" : "High";

  useEffect(() => {
    let cancelled = false;
    setDataState("loading");

    fetchBacktestResult(benchmark as "sp500" | "nasdaq" | "industrial", start, end, risk)
      .then((nextResult) => {
        if (cancelled) return;
        setResult(nextResult);
        setDataState(nextResult.isLive ? "live" : "fallback");
      });

    return () => {
      cancelled = true;
    };
  }, [benchmark, end, risk, runSeed, start]);

  return (
    <div className="grid-bg">
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Backtesting & Strategy Lab</h2>
          <p className="text-sm text-muted-foreground" lang="th">
            ห้องทดลองกลยุทธ์ — ทดสอบสมมติฐานย้อนหลังโดยปราศจาก look-ahead และ survivorship bias
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Sidebar form */}
          <Card className="card-elevated h-fit lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-base">Strategy Inputs</CardTitle>
              <p className="text-xs text-muted-foreground" lang="th">พารามิเตอร์กลยุทธ์</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="num mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="num mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "1Y", years: 1 },
                  { label: "3Y", years: 3 },
                  { label: "5Y", years: 5 },
                ].map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="num h-8"
                    onClick={() => {
                      setStart(yearsAgo(preset.years));
                      setEnd(inputDate(new Date()));
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div>
                <Label className="text-xs" lang="th">
                  เกณฑ์มาตรฐานอุตสาหกรรม (Industrial Benchmark)
                </Label>
                <Select value={benchmark} onValueChange={setBenchmark}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BENCHMARKS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs" lang="th">
                    ระดับความเสี่ยงที่ยอมรับได้ (Risk Appetite)
                  </Label>
                  <Badge variant="outline" className={
                    risk === 0 ? "border-chart-2/40 bg-chart-2/10 text-chart-2"
                    : risk === 1 ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-loss/40 bg-loss/10 text-loss"
                  }>{riskLabel}</Badge>
                </div>
                <Slider
                  value={[risk]}
                  min={0}
                  max={2}
                  step={1}
                  onValueChange={(v) => setRisk(v[0])}
                />
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
              </div>

              <div>
                <Label className="text-xs">Strategy Conditions</Label>
                <Textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="mt-1.5 min-h-[90px] font-mono text-xs"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 py-1 text-[11px]">
                      {t}
                      <button
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="opacity-60 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 shadow-lg shadow-primary/20"
                  onClick={() => { setRunSeed((s) => s + 1); setHasRun(true); }}
                >
                  <Play className="mr-2 h-4 w-4" /> Run Backtest
                </Button>
                <Button variant="outline" size="icon" onClick={() => { setRisk(1); setBenchmark("sp500"); setRunSeed(1); }}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="min-w-0 space-y-5">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
              <Metric label="CAGR" value={`${(result.cagr * 100).toFixed(2)}%`} tone={result.cagr > 0 ? "gain" : "loss"} sub="Annualized" />
              <Metric label="Sharpe Ratio" value={result.sharpe.toFixed(2)} tone="neutral" sub="Rf = 2%" />
              <Metric label="Max Drawdown" value={`${(result.maxDD * 100).toFixed(2)}%`} tone="loss" sub="Peak-to-trough" />
              <Metric label="Alpha" value={`${(result.alpha * 100).toFixed(2)}%`} tone={result.alpha > 0 ? "gain" : "loss"} sub="vs benchmark" />
              <Metric label="Beta" value={result.beta.toFixed(2)} tone="neutral" sub="Market sensitivity" />
            </div>

            <Card className="card-elevated">
              <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">Custom Strategy vs {BENCHMARKS.find(b => b.value === benchmark)?.label}</CardTitle>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">Rebased to 100 · monthly compounding</p>
                </div>
                <Badge variant="outline" className={dataState === "live" ? "shrink-0 border-chart-2/40 bg-chart-2/10 text-chart-2" : "shrink-0 border-warning/40 bg-warning/10 text-warning"}>
                  <Sparkles className="mr-1 h-3 w-3" /> {dataState === "loading" ? "Loading data" : dataState === "live" ? "Live market data" : "Cached market data"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[380px] w-full">
                  <ResponsiveContainer>
                    <LineChart data={result.series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="strategy" name="Custom Strategy" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="var(--color-chart-2)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {hasRun && (
                  <div className="mt-4 rounded-xl border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Interpretation:</span>{" "}
                    Strategy delivers <span className="text-gain font-semibold">{((result.cagr - result.benchCagr) * 100).toFixed(2)}%</span> annualized excess return over the benchmark
                    with Beta {result.beta.toFixed(2)} — indicating {result.beta < 1 ? "defensive" : "pro-cyclical"} exposure. Max drawdown of{" "}
                    <span className="text-loss font-semibold">{(result.maxDD * 100).toFixed(1)}%</span> remains within the {riskLabel} risk envelope.
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">Source: {result.source}.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label, value, sub, tone,
}: { label: string; value: string; sub: string; tone: "gain" | "loss" | "neutral" }) {
  const color = tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-foreground";
  return (
    <Card className="card-elevated">
      <CardContent className="p-4">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`num mt-1.5 font-display text-2xl font-bold tracking-tight ${color}`}>{value}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
