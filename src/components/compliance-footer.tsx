import { ShieldCheck } from "lucide-react";

export function ComplianceFooter() {
  return (
    <footer className="mt-8 border-t border-border/60 px-6 py-5 text-[11px] text-muted-foreground">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-2" />
          <span lang="th">
            ระบบแนะนำการลงทุนภายใต้แนวทางการกำกับดูแลของสำนักงาน ก.ล.ต. ประเทศไทย · Backtests are free from
            look-ahead and survivorship bias.
          </span>
        </div>
        <span>© {new Date().getFullYear()} Level11 Co., Ltd.</span>
      </div>
    </footer>
  );
}
