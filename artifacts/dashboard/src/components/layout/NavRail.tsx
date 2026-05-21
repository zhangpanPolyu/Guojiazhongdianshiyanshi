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
  Briefcase,
  BarChart2,
  Video,
  ShieldAlert,
  Layers,
  Activity,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewType } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavId =
  | "overview"
  | "building"
  | "schematic"
  | "topology"
  | "schedule"
  | "alerts"
  | "workbench"
  | "decision"
  | "cctv"
  | "hazard"
  | "settings";

type GroupId = "digital-twin" | "operations";

interface NavItemDef {
  id: NavId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface NavGroupDef {
  id: GroupId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: NavItemDef[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STANDALONE_ITEMS: NavItemDef[] = [
  { id: "workbench", icon: Briefcase,   label: "我的工作台" },
  { id: "decision",  icon: BarChart2,   label: "领导决策"   },
  { id: "cctv",      icon: Video,       label: "视频监控"   },
  { id: "hazard",    icon: ShieldAlert, label: "隐患排查"   },
];

const NAV_GROUPS: NavGroupDef[] = [
  {
    id: "digital-twin",
    icon: Layers,
    label: "数字孪生",
    children: [
      { id: "overview",  icon: LayoutDashboard, label: "总览"     },
      { id: "building",  icon: Building2,       label: "建筑模型" },
      { id: "schematic", icon: Cpu,             label: "设备图谱" },
      { id: "topology",  icon: GitBranch,       label: "网络拓扑" },
    ],
  },
  {
    id: "operations",
    icon: Activity,
    label: "运营管理",
    children: [
      { id: "schedule", icon: CalendarDays, label: "实验排期" },
      { id: "alerts",   icon: Bell,         label: "告警中心" },
    ],
  },
];

const BOTTOM_ITEM: NavItemDef = { id: "settings", icon: Settings, label: "系统设置" };

// ─── View / tab maps ──────────────────────────────────────────────────────────

const VIEW_MAP: Partial<Record<NavId, ViewType>> = {
  overview:  "building",
  building:  "building",
  schematic: "schematic",
  topology:  "topology",
  workbench: "workbench",
  decision:  "decision",
  cctv:      "cctv",
  hazard:    "hazard",
};
const RIGHT_TAB_MAP: Partial<Record<NavId, RightPanelTab>> = {
  overview:  "situational",
  schedule:  "situational",
  alerts:    "role",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function NavRail() {
  const { activeView, setActiveView, rightPanelTab, setRightPanelTab, alerts } =
    useDashboard();

  const deriveActive = (): NavId => {
    if (rightPanelTab === "role") return "alerts";
    if (activeView === "schematic") return "schematic";
    if (activeView === "topology") return "topology";
    return "overview";
  };

  const [activeNav, setActiveNav] = useState<NavId>(deriveActive);
  const [expandedGroups, setExpandedGroups] = useState<Set<GroupId>>(
    new Set()
  );

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    const view = VIEW_MAP[id];
    const tab  = RIGHT_TAB_MAP[id];
    if (view) setActiveView(view);
    if (tab)  setRightPanelTab(tab);
  };

  const toggleGroup = (id: GroupId) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
      <nav className="flex-1 flex flex-col items-center py-2 gap-0.5 overflow-y-auto scrollbar-hide min-h-0">

        {/* Standalone items */}
        {STANDALONE_ITEMS.map((item) => (
          <RailItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeNav === item.id}
            onClick={() => handleNav(item.id)}
          />
        ))}

        {/* Group divider */}
        <div className="w-8 h-px bg-white/[0.07] my-1.5 shrink-0" />

        {/* Collapsible groups */}
        {NAV_GROUPS.map((group) => {
          const isOpen = expandedGroups.has(group.id);
          const isGroupActive = group.children.some((c) => c.id === activeNav);

          return (
            <React.Fragment key={group.id}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.id)}
                title={group.label}
                className={cn(
                  "relative w-11 rounded-xl flex flex-col items-center justify-center py-1.5 gap-[2px]",
                  "transition-all duration-200 group/hdr",
                  isGroupActive
                    ? "text-sci-cyan"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                )}
              >
                <div className="relative">
                  <group.icon className="w-[17px] h-[17px]" />
                  {/* Chevron overlay */}
                  <motion.span
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -bottom-[5px] -right-[6px] text-inherit opacity-60"
                  >
                    <ChevronDown className="w-[8px] h-[8px]" />
                  </motion.span>
                </div>
                <span
                  className={cn(
                    "text-[8px] font-medium tracking-wide text-center leading-tight mt-[1px]",
                    isGroupActive ? "text-sci-cyan" : "text-white/30 group-hover/hdr:text-white/50"
                  )}
                >
                  {group.label}
                </span>

                {/* Active accent bar for group */}
                {isGroupActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-sci-cyan/60 shadow-[0_0_6px_var(--sci-cyan)]" />
                )}
              </button>

              {/* Expanded children */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="children"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden w-full flex flex-col items-center gap-0"
                  >
                    {/* Vertical guide line */}
                    <div className="relative w-full flex flex-col items-center">
                      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-white/[0.08]" />
                      {group.children.map((child) => {
                        const badge =
                          child.id === "alerts" && criticalCount > 0
                            ? criticalCount
                            : undefined;
                        return (
                          <SubItem
                            key={child.id}
                            icon={child.icon}
                            label={child.label}
                            isActive={activeNav === child.id}
                            badge={badge}
                            onClick={() => handleNav(child.id)}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

// ─── Top-level rail item ──────────────────────────────────────────────────────

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
        "relative w-11 rounded-xl flex flex-col items-center justify-center py-1.5 gap-[2px]",
        "transition-all duration-200 group",
        isActive
          ? "bg-sci-cyan/10 text-sci-cyan shadow-[inset_0_0_12px_rgba(0,240,255,0.08)]"
          : "text-white/30 hover:text-white/65 hover:bg-white/[0.05]"
      )}
    >
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

      <div className="relative">
        <Icon className="w-[18px] h-[18px]" />
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-sci-red text-white text-[8px] font-bold flex items-center justify-center leading-none px-0.5 border border-sci-bg">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>

      <span
        className={cn(
          "text-[8px] font-medium tracking-wide text-center leading-tight",
          isActive ? "text-sci-cyan" : "text-white/25 group-hover:text-white/45"
        )}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Sub-item (inside expanded group) ────────────────────────────────────────

function SubItem({
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
        "relative w-10 rounded-lg flex flex-col items-center justify-center py-1 gap-[2px] ml-1",
        "transition-all duration-150 group/sub",
        isActive
          ? "bg-sci-cyan/10 text-sci-cyan"
          : "text-white/25 hover:text-white/55 hover:bg-white/[0.04]"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-sci-cyan shadow-[0_0_6px_var(--sci-cyan)]" />
      )}

      <div className="relative">
        <Icon className="w-[14px] h-[14px]" />
        {badge !== undefined && (
          <span className="absolute -top-0.5 -right-1 min-w-[12px] h-[12px] rounded-full bg-sci-red text-white text-[7px] font-bold flex items-center justify-center leading-none px-0.5 border border-sci-bg">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>

      <span
        className={cn(
          "text-[7px] font-medium text-center leading-tight",
          isActive ? "text-sci-cyan" : "text-white/20 group-hover/sub:text-white/40"
        )}
      >
        {label}
      </span>
    </button>
  );
}
