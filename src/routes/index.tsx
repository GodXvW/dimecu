import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Wallet,
  Gauge,
  Activity,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { performanceSeries, portfolioSummary, rebalanceIn } from "@/lib/mock-data";
import { fetchDashboardPerformance, type PerformancePoint } from "@/lib/market-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI US Equity Portfolio Consultant" },
      {
        name: "description",
        content:
          "Portfolio overview, YTD returns, Sharpe ratio and benchmark comparison against S&P 500 and Nasdaq.",
      },
    ],
  }),
  component: DashboardPage,
});

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

function DashboardPage() {
  const [range, setRange] = useState<"6M" | "1Y" | "2Y">("2Y");
  const [series, setSeries] = useState<PerformancePoint[]>(performanceSeries);
  const [dataState, setDataState] = useState<"loading" | "live" | "fallback">("loading");
  const [dataSource, setDataSource] = useState("Loading market source...");

  useEffect(() => {
    let cancelled = false;

    fetchDashboardPerformance().then((market) => {
        if (cancelled) return;
        setSeries(market.series);
        setDataSource(market.source);
        setDataState(market.isLive ? "live" : "fallback");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const slice =
    range === "6M" ? series.slice(-6) : range === "1Y" ? series.slice(-12) : series;

  return (
    <div className="grid-bg">
      <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
        {/* AI Alert */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-chart-3/10 p-4 sm:p-5">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/25 text-primary ring-1 ring-primary/40">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Suggestion</span>
                  <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">LightGBM · v3.2</Badge>
                </div>
                <p className="mt-1 text-sm font-medium sm:text-base">
                  3 Rebalancing recommendations available to optimize Capital Gain.
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground" lang="th">
                  พบคำแนะนำการปรับสมดุลพอร์ต 3 รายการ เพื่อเพิ่มผลตอบแทนภายใต้ระดับความเสี่ยงปัจจุบัน
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0 shadow-lg shadow-primary/20">
              <Link to="/ai-suggestions">
                Review <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Wallet className="h-4 w-4" />}
            label="Active Portfolio Value"
            thai="มูลค่าพอร์ตปัจจุบัน"
            value={fmtUsd(portfolioSummary.value)}
            delta={`+${fmtPct(portfolioSummary.dailyChange)} today`}
            positive
          />
          <SummaryCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Total Return (YTD)"
            thai="ผลตอบแทนสะสมปีนี้"
            value={fmtPct(portfolioSummary.ytdReturn)}
            delta={`vs S&P ${fmtPct(portfolioSummary.benchmarkYtd)}`}
            positive
          />
          <SummaryCard
            icon={<Gauge className="h-4 w-4" />}
            label="Current Risk Tier"
            thai="ระดับความเสี่ยง"
            value={portfolioSummary.riskTier}
            delta="Appetite: Balanced"
            tone="warning"
          />
          <SummaryCard
            icon={<Activity className="h-4 w-4" />}
            label="Sharpe Ratio"
            thai="อัตราผลตอบแทนต่อความเสี่ยง"
            value={portfolioSummary.sharpe.toFixed(2)}
            delta="Trailing 12M"
            positive
          />
        </div>

        {/* Chart */}
        <Card className="card-elevated">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="truncate text-base sm:text-lg">Historical Performance</CardTitle>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Portfolio proxy vs SPY and QQQ · rebased to 100
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Badge variant="outline" className={dataState === "live" ? "border-chart-2/40 bg-chart-2/10 text-chart-2" : "border-warning/40 bg-warning/10 text-warning"}>
                {dataState === "loading" ? "Loading market data" : dataState === "live" ? "Live market data" : "Cached market data"}
              </Badge>
              <div className="inline-flex rounded-lg border border-border/70 bg-card/60 p-0.5">
                {(["6M", "1Y", "2Y"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`num rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[340px] w-full">
              <ResponsiveContainer>
                <ComposedChart data={slice} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="portfolio" name="Portfolio" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#gPort)" />
                  <Line type="monotone" dataKey="sp500" name="SPY" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="nasdaq" name="QQQ" stroke="var(--color-chart-3)" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Source: {dataSource}.
            </p>
          </CardContent>
        </Card>

        {/* Top movers / holdings preview */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="card-elevated lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Top AI Conviction Targets</CardTitle>
              <p className="text-xs text-muted-foreground" lang="th">น้ำหนักที่ AI แนะนำสูงสุด</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {rebalanceIn.map((s) => (
                <div key={s.ticker} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 font-display text-xs font-bold text-primary">
                      {s.ticker}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{s.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        Weight {s.current}% → <span className="text-gain">{s.target}%</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 border-gain/40 bg-gain/10 text-gain">
                    <ArrowUpRight className="mr-1 h-3 w-3" /> {(s.conviction * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Risk Attribution</CardTitle>
              <p className="text-xs text-muted-foreground">Factor exposure breakdown</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Momentum", value: 72, tone: "chart-1" },
                { label: "Quality", value: 58, tone: "chart-2" },
                { label: "Value", value: 34, tone: "chart-3" },
                { label: "Volatility", value: 41, tone: "chart-4" },
                { label: "Size", value: 22, tone: "chart-5" },
              ].map((f) => (
                <div key={f.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="num font-semibold">{f.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${f.value}%`, background: `var(--color-${f.tone})` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  thai,
  value,
  delta,
  positive,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  thai: string;
  value: string;
  delta: string;
  positive?: boolean;
  tone?: "warning";
}) {
  const deltaClass = tone === "warning" ? "text-warning" : positive ? "text-gain" : "text-loss";
  return (
    <Card className="card-elevated">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">{icon}</div>
          <span className={`num text-[11px] font-medium ${deltaClass}`}>{delta}</span>
        </div>
        <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground/80" lang="th">{thai}</div>
        <div className="num mt-2 font-display text-2xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
