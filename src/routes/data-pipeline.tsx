import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dataPipelines } from "@/lib/mock-data";

export const Route = createFileRoute("/data-pipeline")({
  head: () => ({
    meta: [
      { title: "Data Pipeline Status — AI US Equity Portfolio Consultant" },
      { name: "description", content: "Real-time status of US market data pipelines and AI model inference." },
    ],
  }),
  component: DataPipelinePage,
});

function DataPipelinePage() {
  return (
    <div className="grid-bg">
      <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl">Data Pipeline Status</h2>
          <p className="text-sm text-muted-foreground" lang="th">สถานะระบบเชื่อมต่อข้อมูลตลาดและโมเดล AI</p>
        </div>

        <div className="grid gap-3">
          {dataPipelines.map((p) => {
            const healthy = p.status === "Healthy";
            return (
              <Card key={p.name} className="card-elevated">
                <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${healthy ? "bg-gain/15 text-gain" : "bg-warning/15 text-warning"}`}>
                      {healthy ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{p.source}</div>
                    </div>
                  </div>
                  <div className="hidden text-xs sm:block">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</div>
                    <Badge variant="outline" className={healthy ? "border-gain/40 bg-gain/10 text-gain" : "border-warning/40 bg-warning/10 text-warning"}>
                      {p.status}
                    </Badge>
                  </div>
                  <div className="hidden text-xs sm:block">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Latency</div>
                    <div className="num mt-0.5 font-semibold">{p.latencyMs} ms</div>
                  </div>
                  <div className="hidden text-xs sm:block">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Sync</div>
                    <div className="mt-0.5">{p.lastSync}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base">Model Governance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {[
              { l: "Model", v: "LightGBM v3.2", s: "Approved by Risk Committee" },
              { l: "Training Window", v: "2015 – 2024", s: "Point-in-time, no look-ahead" },
              { l: "Universe", v: "S&P 1500", s: "Survivorship-bias free" },
            ].map((m) => (
              <div key={m.l} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.l}</div>
                <div className="mt-1 font-display text-lg font-bold">{m.v}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{m.s}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
