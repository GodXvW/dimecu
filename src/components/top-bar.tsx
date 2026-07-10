import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, CircleDot } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-sm font-semibold sm:text-base" lang="th">
          ระบบ AI ผู้ช่วยวิเคราะห์และปรับสมดุลพอร์ตการลงทุนตลาดหุ้นสหรัฐฯ
        </h1>
        <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
          AI US Equity Portfolio Consultant · Institutional Console
        </p>
      </div>

      <Badge variant="outline" className="hidden gap-1.5 border-chart-2/40 bg-chart-2/10 py-1 pl-1.5 pr-2.5 text-chart-2 md:inline-flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-chart-2" />
        </span>
        Data Pipeline: Active
      </Badge>

      <button className="grid h-9 w-9 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Bell className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/60 py-1.5 pl-1.5 pr-3">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">FM</AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 text-left sm:block">
          <div className="truncate text-xs font-semibold leading-tight">Ananda P.</div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CircleDot className="h-2.5 w-2.5 text-chart-2" /> Fund Manager
          </div>
        </div>
      </div>
    </header>
  );
}
