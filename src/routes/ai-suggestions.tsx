import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Brain, ShieldCheck, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rebalanceIn, rebalanceOut } from "@/lib/mock-data";

export const Route = createFileRoute("/ai-suggestions")({
  head: () => ({
    meta: [
      { title: "AI Suggestions — AI US Equity Portfolio Consultant" },
      {
        name: "description",
        content:
          "AI-driven rebalancing recommendations with explainability for SEC (ก.ล.ต.) compliance.",
      },
    ],
  }),
  component: AISuggestionsPage,
});

type Row = (typeof rebalanceIn)[number];

function AISuggestionsPage() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const toggle = (t: string) => setAccepted((a) => ({ ...a, [t]: !a[t] }));

  return (
    <div className="grid-bg">
      <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold sm:text-2xl" lang="th">
              คำแนะนำจาก AI และการปรับสมดุลพอร์ต (AI Suggestion)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              LightGBM factor model · generated {new Date().toLocaleString("en-US")}
            </p>
          </div>
          <Button className="shrink-0 shadow-lg shadow-primary/20">
            <Sparkles className="mr-2 h-4 w-4" /> Apply Recommendations
          </Button>
        </div>

        {/* Compliance banner */}
        <div className="flex items-start gap-3 rounded-xl border border-chart-2/30 bg-chart-2/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-chart-2" />
          <div className="min-w-0 text-xs">
            <div className="font-semibold text-foreground">Explainable AI · Regulatory Transparency</div>
            <p className="mt-0.5 text-muted-foreground" lang="th">
              คำแนะนำทุกข้อมาพร้อมเหตุผลเชิงปริมาณเพื่อรองรับการตรวจสอบตามแนวทางของสำนักงาน ก.ล.ต. ประเทศไทย
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <SuggestionTable
            title="Rebalance IN"
            subtitle="Buy / Increase Weight"
            thai="เพิ่มน้ำหนักการลงทุน"
            rows={rebalanceIn}
            direction="in"
            accepted={accepted}
            onToggle={toggle}
          />
          <SuggestionTable
            title="Rebalance OUT"
            subtitle="Sell / Decrease Weight"
            thai="ลดน้ำหนักการลงทุน"
            rows={rebalanceOut}
            direction="out"
            accepted={accepted}
            onToggle={toggle}
          />
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" /> Portfolio Impact Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { l: "Projected Sharpe", from: "1.87", to: "2.04", gain: true },
                { l: "Projected Alpha", from: "+1.4%", to: "+2.1%", gain: true },
                { l: "Portfolio Beta", from: "1.12", to: "0.98", gain: true },
                { l: "Est. Max DD", from: "−14.2%", to: "−11.6%", gain: true },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.l}</div>
                  <div className="num mt-2 flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground line-through">{s.from}</span>
                    <span className={`font-display text-lg font-bold ${s.gain ? "text-gain" : "text-loss"}`}>→ {s.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SuggestionTable({
  title, subtitle, thai, rows, direction, accepted, onToggle,
}: {
  title: string; subtitle: string; thai: string;
  rows: Row[]; direction: "in" | "out";
  accepted: Record<string, boolean>; onToggle: (t: string) => void;
}) {
  const isIn = direction === "in";
  const Icon = isIn ? ArrowUpRight : ArrowDownRight;
  const tone = isIn ? "gain" : "loss";
  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`grid h-9 w-9 place-items-center rounded-lg bg-${tone}/15 text-${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {subtitle} · <span lang="th">{thai}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => {
          const delta = r.target - r.current;
          const isAccepted = !!accepted[r.ticker];
          return (
            <div
              key={r.ticker}
              className={`rounded-xl border p-4 transition-colors ${
                isAccepted ? "border-primary/50 bg-primary/5" : "border-border/60 bg-background/40"
              }`}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-card font-display text-xs font-bold text-foreground ring-1 ring-border">
                    {r.ticker}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.name}</div>
                    <div className="num mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                      <span>Current {r.current}%</span>
                      <span>→</span>
                      <span className={`font-semibold text-${tone}`}>Target {r.target}%</span>
                      <span className={`text-${tone}`}>
                        ({delta > 0 ? "+" : ""}{delta.toFixed(1)} pp)
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`shrink-0 border-${tone}/40 bg-${tone}/10 text-${tone} num`}>
                  Conviction {(r.conviction * 100).toFixed(0)}%
                </Badge>
              </div>

              <div className="mt-3 rounded-lg border border-border/60 bg-card/60 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3 w-3" /> AI Explainability
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground" lang="th">
                  {r.reason}
                </p>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs">Dismiss</Button>
                <Button
                  size="sm"
                  variant={isAccepted ? "default" : "outline"}
                  className="text-xs"
                  onClick={() => onToggle(r.ticker)}
                >
                  {isAccepted ? "Accepted ✓" : "Accept"}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
