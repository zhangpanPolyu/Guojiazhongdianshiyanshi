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

// ─── Component ────────────────────────────────────────────────────────────────

export function NavRail() {
  const { activeView, setActiveView, rightPanelTab, setRightPanelTab, alerts } =
    useDashboard();

  const deriveActive = (): NavId => {
    if (rightPanelTab === "role") return "alerts";
    if (activeView === "schematic") return "schematic";
    if (activeView === "topology")  return "topology";
    if (activeView === "workbench") return "workbench";
    if (activeView === "decision")  return "decision";
    if (activeView === "cctv")      return "cctv";
    if (activeView === "hazard")    return "hazard";
    return "overview";
  };

  const [activeNav, setActiveNav]       = useState<NavId>(deriveActive);
  const [expandedGroups, setExpandedGroups] = useState<Set<GroupId>>(new Set());

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
    <div
      className="w-[152px] h-full flex flex-col border-r border-white/[0.07] bg-[rgba(4,6,17,0.80)] backdrop-blur-md shrink-0"
      style={{ minWidth: 152 }}
    >
      {/* ── Logo / brand strip */}
      <div className="h-12 flex items-center gap-2.5 px-3.5 border-b border-white/[0.07] shrink-0">
        <div className="w-6 h-6 rounded-md bg-sci-cyan/10 border border-sci-cyan/25 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-sci-cyan">
            <polygon
              points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5"
              stroke="currentColor" strokeWidth="1.2"
              fill="currentColor" fillOpacity={0.15}
            />
            <circle cx="8" cy="8" r="2" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[10px] font-semibold text-white/50 tracking-wide leading-tight">
          数智孪生<br />
          <span className="text-[9px] font-normal text-white/25 tracking-normal">管理平台</span>
        </span>
      </div>

      {/* ── Scrollable nav body */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 flex flex-col min-h-0">

        {/* Standalone items */}
        <div className="px-2 space-y-0.5">
          {STANDALONE_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeNav === item.id}
              onClick={() => handleNav(item.id)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 my-2 h-px bg-white/[0.07]" />

        {/* Collapsible groups */}
        <div className="px-2 space-y-0.5">
          {NAV_GROUPS.map((group) => {
            const isOpen        = expandedGroups.has(group.id);
            const isGroupActive = group.children.some((c) => c.id === activeNav);

            return (
              <div key={group.id}>
                {/* Group header row */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left",
                    "transition-all duration-150 group/grp",
                    isGroupActive
                      ? "text-sci-cyan"
                      : "text-white/45 hover:text-white/70 hover:bg-white/[0.04]"
                  )}
                >
                  {/* Left accent line when group active */}
                  {isGroupActive && (
                    <div className="absolute left-2 h-5 w-[2px] rounded-full bg-sci-cyan/50" />
                  )}

                  <group.icon
                    className={cn(
                      "w-3.5 h-3.5 shrink-0",
                      isGroupActive ? "text-sci-cyan" : "text-white/35 group-hover/grp:text-white/60"
                    )}
                  />

                  <span
                    className={cn(
                      "flex-1 text-[11px] font-semibold tracking-wide",
                      isGroupActive ? "text-sci-cyan" : "text-white/50 group-hover/grp:text-white/70"
                    )}
                  >
                    {group.label}
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.18 }}
                    className="shrink-0 opacity-40"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </motion.span>
                </button>

                {/* Tree children */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="children"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {/* Tree layout: vertical guide + indented items */}
                      <div className="relative pl-4 pr-1 pb-1 pt-0.5 space-y-0.5">
                        {/* Vertical tree guide line */}
                        <div className="absolute left-[18px] top-0 bottom-3 w-px bg-white/[0.10]" />

                        {group.children.map((child, idx) => {
                          const badge =
                            child.id === "alerts" && criticalCount > 0
                              ? criticalCount
                              : undefined;
                          const isLast = idx === group.children.length - 1;

                          return (
                            <div key={child.id} className="relative flex items-center">
                              {/* Horizontal connector */}
                              <div className="absolute left-0 top-1/2 w-3 h-px bg-white/[0.10] -translate-y-px" />

                              <button
                                onClick={() => handleNav(child.id)}
                                title={child.label}
                                className={cn(
                                  "relative flex-1 flex items-center gap-2 pl-3 pr-2 py-[7px] rounded-lg text-left",
                                  "transition-all duration-150 group/child",
                                  activeNav === child.id
                                    ? "bg-sci-cyan/10 text-sci-cyan"
                                    : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]"
                                )}
                              >
                                {/* Active left bar */}
                                {activeNav === child.id && (
                                  <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-sci-cyan shadow-[0_0_6px_var(--sci-cyan)]" />
                                )}

                                <div className="relative shrink-0">
                                  <child.icon
                                    className={cn(
                                      "w-3.5 h-3.5",
                                      activeNav === child.id
                                        ? "text-sci-cyan"
                                        : "text-white/30 group-hover/child:text-white/55"
                                    )}
                                  />
                                  {badge !== undefined && (
                                    <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] rounded-full bg-sci-red text-white text-[7px] font-bold flex items-center justify-center leading-none px-0.5 border border-[rgba(5,8,20,1)]">
                                      {badge > 9 ? "9+" : badge}
                                    </span>
                                  )}
                                </div>

                                <span
                                  className={cn(
                                    "text-[11px] font-medium",
                                    activeNav === child.id
                                      ? "text-sci-cyan"
                                      : "text-white/40 group-hover/child:text-white/65"
                                  )}
                                >
                                  {child.label}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Bottom settings */}
      <div className="shrink-0 px-2 pb-3 pt-1 border-t border-white/[0.07]">
        <SidebarItem
          icon={BOTTOM_ITEM.icon}
          label={BOTTOM_ITEM.label}
          isActive={activeNav === BOTTOM_ITEM.id}
          onClick={() => setActiveNav(BOTTOM_ITEM.id)}
        />
      </div>
    </div>
  );
}

// ─── Sidebar item (top-level, labeled) ───────────────────────────────────────

function SidebarItem({
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
        "relative w-full flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-left",
        "transition-all duration-150 group",
        isActive
          ? "bg-sci-cyan/10 text-sci-cyan shadow-[inset_0_0_10px_rgba(0,240,255,0.07)]"
          : "text-white/35 hover:text-white/70 hover:bg-white/[0.05]"
      )}
    >
      {/* Active left bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="bar"
            layoutId="navActiveBar"
            className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r-full bg-sci-cyan shadow-[0_0_8px_var(--sci-cyan)]"
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.5 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </AnimatePresence>

      <div className="relative shrink-0">
        <Icon
          className={cn(
            "w-[15px] h-[15px]",
            isActive ? "text-sci-cyan" : "text-white/30 group-hover:text-white/60"
          )}
        />
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] rounded-full bg-sci-red text-white text-[7px] font-bold flex items-center justify-center leading-none px-0.5 border border-[rgba(5,8,20,1)]">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>

      <span
        className={cn(
          "text-[11px] font-medium truncate",
          isActive ? "text-sci-cyan" : "text-white/40 group-hover:text-white/70"
        )}
      >
        {label}
      </span>
    </button>
  );
}
