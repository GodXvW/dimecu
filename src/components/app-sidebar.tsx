import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FlaskConical, Sparkles, Activity, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard Overview", thai: "ภาพรวมพอร์ต", url: "/", icon: LayoutDashboard },
  { title: "Backtesting Lab", thai: "ห้องทดลองกลยุทธ์", url: "/backtesting", icon: FlaskConical },
  { title: "AI Suggestions", thai: "คำแนะนำจาก AI", url: "/ai-suggestions", icon: Sparkles },
  { title: "Data Pipeline Status", thai: "สถานะข้อมูล", url: "/data-pipeline", icon: Activity },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-3 text-primary-foreground shadow-lg shadow-primary/30">
            <span className="font-display text-lg font-bold">L11</span>
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold text-sidebar-foreground">AI Equity Consultant</div>
            <div className="truncate text-[11px] text-muted-foreground">by Level11 Co., Ltd.</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                          <div className="truncate text-sm">{item.title}</div>
                          <div className="truncate text-[10px] text-muted-foreground">{item.thai}</div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-start gap-2 rounded-lg bg-sidebar-accent/60 p-3 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-chart-2" />
          <span lang="th">ระบบแนะนำการลงทุนภายใต้แนวทางการกำกับดูแลของสำนักงาน ก.ล.ต. ประเทศไทย</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
