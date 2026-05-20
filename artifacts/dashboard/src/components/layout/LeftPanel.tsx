import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { GlassPanel } from "../ui/glass-panel";
import { 
  useListCategories, 
  getListCategoriesQueryKey,
  useGetStatusBreakdown,
  getGetStatusBreakdownQueryKey
} from "@workspace/api-client-react";
import { Activity, Cpu, Server, Wifi, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  activity: Activity,
  cpu: Cpu,
  server: Server,
  wifi: Wifi,
  database: Database
};

export function LeftPanel() {
  const { language } = useDashboard();
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const { data: categories, isLoading: catsLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const { data: breakdown, isLoading: breakLoading } = useGetStatusBreakdown({
    query: { queryKey: getGetStatusBreakdownQueryKey(), refetchInterval: 30000 }
  });

  return (
    <div className="w-72 h-full p-4 flex flex-col gap-4 border-r border-white/10">
      <GlassPanel className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-sm font-semibold tracking-wider text-white/80 uppercase">
            {language === 'zh' ? '设备分类' : 'Equipment Categories'}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide space-y-2">
          {catsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 animate-pulse rounded-lg" />
            ))
          ) : (
            categories?.map(cat => {
              const Icon = IconMap[cat.icon] || Server;
              const isActive = activeCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 border text-left",
                    isActive 
                      ? "bg-sci-cyan/10 border-sci-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]" 
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  )}
                  data-testid={`category-${cat.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5", isActive ? "text-sci-cyan" : "text-white/60")} />
                    <span className={cn("text-sm", isActive ? "text-white" : "text-white/70")}>
                      {language === 'zh' ? cat.name : cat.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.alertCount > 0 && (
                      <span className="bg-sci-red/20 text-sci-red text-[10px] px-1.5 py-0.5 rounded-full font-mono border border-sci-red/30 shadow-[0_0_5px_rgba(255,0,60,0.5)]">
                        {cat.alertCount}
                      </span>
                    )}
                    <span className="text-xs font-mono text-white/50">{cat.count}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="h-48 p-4 flex flex-col justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-2">
          {language === 'zh' ? '运行状态分布' : 'Status Breakdown'}
        </h3>
        
        {breakLoading ? (
          <div className="flex-1 bg-white/5 animate-pulse rounded-lg" />
        ) : breakdown ? (
          <div className="space-y-4">
            <StatusRow 
              label={language === 'zh' ? '运行中' : 'Running'} 
              count={breakdown.running} 
              color="bg-sci-green" 
              glow="shadow-[0_0_8px_var(--sci-green)]" 
              total={100} 
            />
            <StatusRow 
              label={language === 'zh' ? '警告' : 'Warning'} 
              count={breakdown.warning} 
              color="bg-sci-amber" 
              glow="shadow-[0_0_8px_var(--sci-amber)]" 
              total={100} 
            />
            <StatusRow 
              label={language === 'zh' ? '故障' : 'Fault'} 
              count={breakdown.fault} 
              color="bg-sci-red" 
              glow="shadow-[0_0_15px_var(--sci-red)]" 
              total={100} 
            />
          </div>
        ) : null}
      </GlassPanel>
    </div>
  );
}

function StatusRow({ label, count, color, glow, total }: { label: string, count: number, color: string, glow: string, total: number }) {
  const percentage = Math.min(100, Math.max(0, (count / (total || 1)) * 100)) + 5; // +5 for visual minimum
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-mono font-bold text-white/90">{count}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color, glow)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
