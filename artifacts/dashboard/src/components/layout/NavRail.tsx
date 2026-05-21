import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import type { RightPanelTab } from "@/context/DashboardContext";
import {
  LayoutDashboard,
  Cpu,
  GitBranch,
  CalendarDays,
  Bell,
  Settings,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewType } from "@/types";

// ─── Nav item definition ─────────────────────────────────────────────────────

type NavId = "overview" | "building" | "schematic" | "topology" | "schedule" | "alerts" | "settings";

interface NavItemDef {
  id: NavId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dividerBefore?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: "overview",  icon: LayoutDashboard, label: "总览"   },
  { id: "building",  icon: Building2,       label: "建筑模型" },
  { id: "schematic", icon: Cpu,             label: "设备图谱" },
  { id: "topology",  icon: GitBranch,       label: "网络拓扑" },
  { id: "schedule",  icon: CalendarDays,    label: "实验排期", dividerBefore: true },
  { id: "alerts",    icon: Bell,            label: "告警中心" },
];

const BOTTOM_ITEM: NavItemDef = { id: "settings", icon: Settings, label: "系统设置" };

// Maps nav id → which view/tab to activate
const VIEW_MAP: Partial<Record<NavId, ViewType>> = {
  overview: "building",
  building: "building",
  schematic: "schematic",
  topology: "topology",
};
const RIGHT_TAB_MAP: Partial<Record<NavId, RightPanelTab>> = {
  overview: "situational",
  schedule: "situational",
  alerts: "role",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function NavRail() {
  const { activeView, setActiveView, rightPanelTab, setRightPanelTab, alerts } =
    useDashboard();

  // Derive active nav item from context state
  const deriveActive = (): NavId => {
    if (rightPanelTab === "role") return "alerts";
    if (activeView === "schematic") return "schematic";
    if (activeView === "topology") return "topology";
    return "overview";
  };

  const [activeNav, setActiveNav] = useState<NavId>(deriveActive);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    const view = VIEW_MAP[id];
    const tab = RIGHT_TAB_MAP[id];
    if (view) setActiveView(view);
    if (tab) setRightPanelTab(tab);
    // 'building', 'schematic', 'topology' don't change rightPanelTab
    // 'schedule', 'alerts' don't change activeView
  };

  return (
    <div className="w-14 h-full flex flex-col border-r border-white/[0.07] bg-[rgba(4,6,17,0.75)] backdrop-blur-md shrink-0">
      {/* Logo mark */}
      <div className="h-12 flex items-center justify-center border-b border-white/[0.07] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-sci-cyan/10 border border-sci-cyan/25 flex items-center justify-center">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-sci-cyan">
            <polygon
              points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="currentColor"
              fillOpacity={0.15}
            />
            <circle cx="8" cy="8" r="2" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col items-center py-2 gap-0.5 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          const badge =
            item.id === "alerts" && criticalCount > 0 ? criticalCount : undefined;
          return (
            <React.Fragment key={item.id}>
              {item.dividerBefore && (
                <div className="w-8 h-px bg-white/[0.07] my-1" />
              )}
              <RailItem
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                badge={badge}
                onClick={() => handleNav(item.id)}
              />
            </React.Fragment>
          );
        })}
      </nav>

      {/* Bottom settings */}
      <div className="shrink-0 flex flex-col items-center pb-3 pt-1 border-t border-white/[0.07]">
        <RailItem
          icon={BOTTOM_ITEM.icon}
          label={BOTTOM_ITEM.label}
          isActive={activeNav === BOTTOM_ITEM.id}
          onClick={() => setActiveNav(BOTTOM_ITEM.id)}
        />
      </div>
    </div>
  );
}

// ─── Rail item ────────────────────────────────────────────────────────────────

function RailItem({
  icon: Icon,
  label,
  isActive,
  badge,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "relative w-11 rounded-xl flex flex-col items-center justify-center py-2 gap-[3px]",
        "transition-all duration-200 group",
        isActive
          ? "bg-sci-cyan/10 text-sci-cyan shadow-[inset_0_0_12px_rgba(0,240,255,0.08)]"
          : "text-white/30 hover:text-white/65 hover:bg-white/[0.05]"
      )}
    >
      {/* Active left accent bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="bar"
            layoutId="navActiveBar"
            className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-sci-cyan shadow-[0_0_8px_var(--sci-cyan)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <div className="relative">
        <Icon className="w-[18px] h-[18px]" />
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-sci-red text-white text-[8px] font-bold flex items-center justify-center leading-none px-0.5 border border-sci-bg">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[8px] font-medium tracking-wide text-center leading-tight",
          isActive ? "text-sci-cyan" : "text-white/25 group-hover:text-white/45"
        )}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </span>
    </button>
  );
}
