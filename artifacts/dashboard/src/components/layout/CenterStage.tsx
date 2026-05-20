import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { 
  useListEquipment, 
  getListEquipmentQueryKey 
} from "@workspace/api-client-react";
import { Building2, Network, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BuildingModel } from "../dashboard/3d/BuildingModel";
import { EquipmentSchematic } from "../dashboard/3d/EquipmentSchematic";
import { NetworkTopology } from "../dashboard/3d/NetworkTopology";
import { EquipmentDetail } from "../dashboard/EquipmentDetail";
import { StatusBadge } from "../ui/status-badge";

const tabs = [
  { id: 'building', icon: Building2, labelZh: '建筑模型', labelEn: 'Building Model' },
  { id: 'schematic', icon: Network, labelZh: '设备图谱', labelEn: 'Equipment Schematic' },
  { id: 'topology', icon: GitBranch, labelZh: '网络拓扑', labelEn: 'Network Topology' },
] as const;

export function CenterStage() {
  const { activeView, setActiveView, language, setSelectedEquipmentId, selectedEquipmentId } = useDashboard();

  const { data: equipment, isLoading } = useListEquipment(undefined, {
    query: { queryKey: getListEquipmentQueryKey() }
  });

  return (
    <div className="flex-1 h-full flex flex-col relative overflow-hidden bg-gradient-to-b from-sci-bg/50 to-transparent">
      {/* Background SVG Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-grid-pattern z-0" />
      
      {/* Top Tabs */}
      <div className="h-12 border-b border-white/10 flex px-4 relative z-10 bg-white/5 backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 h-full relative transition-colors",
                isActive ? "text-sci-cyan" : "text-white/50 hover:text-white/80"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">
                {language === 'zh' ? tab.labelZh : tab.labelEn}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sci-cyan shadow-[0_0_10px_var(--sci-cyan)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3D Canvas Area */}
      <div className="flex-1 relative z-0">
        <div className="absolute inset-0">
          {activeView === 'building' && <BuildingModel />}
          {activeView === 'schematic' && <EquipmentSchematic />}
          {activeView === 'topology' && <NetworkTopology />}
        </div>
      </div>

      {/* Equipment List Strip */}
      <div className="h-48 border-t border-white/10 bg-white/5 backdrop-blur-md p-4 relative z-10 flex flex-col">
        <h3 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-3">
          {language === 'zh' ? '设备索引' : 'Equipment Index'}
        </h3>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
              {equipment?.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedEquipmentId(item.id)}
                  className={cn(
                    "text-left p-2 rounded border transition-all duration-200 flex items-center justify-between group",
                    selectedEquipmentId === item.id 
                      ? "bg-sci-cyan/10 border-sci-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]" 
                      : "bg-white/5 border-transparent hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  <div className="truncate pr-2">
                    <div className={cn(
                      "text-xs truncate font-medium",
                      selectedEquipmentId === item.id ? "text-sci-cyan" : "text-white/80 group-hover:text-white"
                    )}>
                      {language === 'zh' ? item.name : item.nameEn}
                    </div>
                    <div className="text-[10px] font-mono text-white/40 mt-0.5">
                      {item.id}
                    </div>
                  </div>
                  <StatusBadge status={item.status} className="shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <EquipmentDetail />
    </div>
  );
}
