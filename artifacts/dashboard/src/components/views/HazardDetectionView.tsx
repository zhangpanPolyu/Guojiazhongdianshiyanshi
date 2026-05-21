import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, ShieldCheck, ClipboardList, CheckCircle2, X,
  AlertTriangle, Clock, User, MapPin, ChevronRight,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type HazardLevel = "urgent" | "general";
type WorkflowStep = 0 | 1 | 2 | 3; // 上报→确认→整改→验收

interface Hazard {
  id: string;
  level: HazardLevel;
  title: string;
  device: string;
  location: string;
  assignee: string;
  reportedAgo: string;
  step: WorkflowStep;
  description: string;
  floorX: number;
  floorY: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const HAZARDS: Hazard[] = [
  {
    id: "HZ-001",
    level: "urgent",
    title: "气压阀门松动告警",
    device: "高低温低气压试验箱",
    location: "综合测试区 1F",
    assignee: "李工程师",
    reportedAgo: "30分钟前",
    step: 2,
    description:
      "高低温低气压试验箱（EQ009）气压传感器检测到阀门密封不良，当前气压低于设定值12%。设备已自动停机保护，需现场核查阀门紧固状态并更换密封垫圈。",
    floorX: 72,
    floorY: 58,
  },
  {
    id: "HZ-002",
    level: "general",
    title: "门禁系统离线",
    device: "走廊门禁",
    location: "实验室走廊 2F",
    assignee: "维保组",
    reportedAgo: "2小时前",
    step: 1,
    description:
      "二楼实验室走廊门禁控制器网络连接中断，导致刷卡记录无法上传至平台。物理门禁机械功能正常，人员进出未受影响。需运维人员检查网络模块。",
    floorX: 42,
    floorY: 28,
  },
];

const WORKFLOW_STEPS = ["上报", "确认", "整改", "验收结案"];

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "今日安全评分", value: "98", unit: "/100", color: "text-sci-green", border: "border-t-sci-green", glow: "shadow-[0_-2px_12px_rgba(0,255,102,0.2)]", icon: ShieldCheck },
  { label: "未闭环隐患", value: "2", unit: "项", color: "text-sci-amber", border: "border-t-sci-amber", glow: "shadow-[0_-2px_12px_rgba(255,184,0,0.2)]", icon: AlertTriangle },
  { label: "今日巡检次数", value: "14", unit: "次", color: "text-sci-cyan", border: "border-t-sci-cyan", glow: "shadow-[0_-2px_12px_rgba(0,240,255,0.15)]", icon: ClipboardList },
  { label: "本周已结案", value: "7", unit: "项", color: "text-white/70", border: "border-t-white/30", glow: "", icon: CheckCircle2 },
];

// ─── Floorplan SVG ────────────────────────────────────────────────────────────

function FloorPlan({ hazards, selectedId, onSelect }: {
  hazards: Hazard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" style={{ maxHeight: 340 }}>
      {/* Background */}
      <rect width="100" height="80" fill="rgba(0,8,20,0.8)" />

      {/* Floor grid */}
      <defs>
        <pattern id="floorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,240,255,0.05)" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100" height="80" fill="url(#floorGrid)" />

      {/* Outer walls */}
      <rect x="5" y="5" width="90" height="70" fill="none" stroke="rgba(0,240,255,0.25)" strokeWidth="0.8" rx="1" />

      {/* Rooms */}
      {[
        { x: 5, y: 5,  w: 30, h: 35, label: "结构大厅", fill: "rgba(0,240,255,0.04)" },
        { x: 35, y: 5,  w: 30, h: 20, label: "岩土实验室", fill: "rgba(0,240,255,0.03)" },
        { x: 65, y: 5,  w: 30, h: 35, label: "BIM实验室", fill: "rgba(0,240,255,0.03)" },
        { x: 5,  y: 40, w: 45, h: 35, label: "综合测试区", fill: "rgba(0,240,255,0.04)" },
        { x: 50, y: 40, w: 45, h: 35, label: "材料实验室", fill: "rgba(0,240,255,0.03)" },
        { x: 35, y: 25, w: 30, h: 15, label: "走廊", fill: "rgba(255,255,255,0.01)" },
      ].map((room, i) => (
        <g key={i}>
          <rect
            x={room.x} y={room.y}
            width={room.w} height={room.h}
            fill={room.fill}
            stroke="rgba(0,240,255,0.15)"
            strokeWidth="0.4"
          />
          <text
            x={room.x + room.w / 2}
            y={room.y + room.h / 2 + 2}
            fill="rgba(255,255,255,0.3)"
            fontSize="3.5"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {room.label}
          </text>
        </g>
      ))}

      {/* Hazard markers */}
      {hazards.map((h) => (
        <g
          key={h.id}
          style={{ cursor: "pointer" }}
          onClick={() => onSelect(h.id)}
        >
          {/* Pulsing rings */}
          {[0, 1, 2].map((ring) => (
            <circle
              key={ring}
              cx={h.floorX}
              cy={h.floorY}
              r={2 + ring * 2.5}
              fill="none"
              stroke={h.level === "urgent" ? "#FF003C" : "#FFB800"}
              strokeWidth="0.5"
              opacity={selectedId === h.id ? 0.6 : 0.3}
              style={{
                animation: `pulse-danger ${1.5 + ring * 0.4}s ease-in-out infinite`,
                animationDelay: `${ring * 0.2}s`,
              }}
            />
          ))}
          {/* Center dot */}
          <circle
            cx={h.floorX}
            cy={h.floorY}
            r="2"
            fill={h.level === "urgent" ? "#FF003C" : "#FFB800"}
            opacity="0.9"
          />
          {/* Label */}
          <text
            x={h.floorX + 3}
            y={h.floorY - 3}
            fill={h.level === "urgent" ? "#FF003C" : "#FFB800"}
            fontSize="3"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
          >
            {h.id}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function HazardDrawer({ hazard, onClose }: { hazard: Hazard; onClose: () => void }) {
  return (
    <motion.div
      key={hazard.id}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="absolute top-0 right-0 h-full w-[340px] bg-[rgba(5,8,20,0.97)] border-l border-white/[0.1] flex flex-col z-40 shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 p-4 border-b border-white/[0.07]">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center",
          hazard.level === "urgent" ? "bg-sci-red/10 border border-sci-red/25" : "bg-sci-amber/10 border border-sci-amber/25"
        )}>
          <ShieldAlert className={cn("w-4 h-4", hazard.level === "urgent" ? "text-sci-red" : "text-sci-amber")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white/90 truncate">{hazard.title}</div>
          <div className="text-[10px] text-white/40 font-mono">{hazard.id}</div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/50" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        {/* Meta info */}
        <div className="space-y-2">
          {[
            { icon: MapPin, label: "位置", val: hazard.location },
            { icon: User, label: "负责人", val: hazard.assignee },
            { icon: Clock, label: "上报时间", val: hazard.reportedAgo },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2.5 text-[11px]">
              <row.icon className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <span className="text-white/40 w-14 shrink-0">{row.label}</span>
              <span className="text-white/75">{row.val}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <GlassPanel className="p-3 text-[11px] text-white/55 leading-relaxed">
          {hazard.description}
        </GlassPanel>

        {/* Workflow stepper */}
        <div>
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">处理流程</div>
          <div className="space-y-2">
            {WORKFLOW_STEPS.map((step, i) => {
              const done = i < hazard.step;
              const active = i === hazard.step;
              const pending = i > hazard.step;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold shrink-0",
                    done   ? "bg-sci-green/20 border-sci-green text-sci-green" :
                    active ? "bg-sci-cyan/20 border-sci-cyan text-sci-cyan" :
                             "bg-white/5 border-white/15 text-white/25"
                  )}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className={cn(
                      "text-[11px] font-medium",
                      done   ? "text-sci-green" :
                      active ? "text-sci-cyan" :
                               "text-white/30"
                    )}>
                      {step}
                    </span>
                    {active && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sci-cyan/10 border border-sci-cyan/20 text-sci-cyan font-semibold animate-pulse">
                        进行中
                      </span>
                    )}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn("w-px h-4 ml-3 absolute mt-8", done ? "bg-sci-green/40" : "bg-white/[0.06]")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Photo placeholder */}
        <div>
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">现场照片</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((n) => (
              <div
                key={n}
                className="aspect-square rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
              >
                <span className="text-[8px] text-white/20">暂无</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer action */}
      <div className="shrink-0 p-4 border-t border-white/[0.07]">
        <button className="w-full py-2.5 rounded-xl bg-sci-cyan/10 border border-sci-cyan/25 text-sci-cyan text-xs font-semibold hover:bg-sci-cyan/20 transition-colors flex items-center justify-center gap-2">
          更新状态
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HazardDetectionView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = HAZARDS.find((h) => h.id === selectedId) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full h-full flex flex-col overflow-hidden relative"
    >
      {/* ── Top stats */}
      <div className="shrink-0 p-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-sci-amber/10 border border-sci-amber/20 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-sci-amber" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white/90 tracking-wide">隐患排查中心</h1>
            <p className="text-[11px] text-white/40">实验室安全管理 · 隐患图网 · 闭环追踪</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {STATS.map((s) => (
            <GlassPanel key={s.label} className={cn("p-3 border-t-2", s.border, s.glow)}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/45">{s.label}</span>
                <s.icon className={cn("w-3.5 h-3.5 opacity-40", s.color)} />
              </div>
              <div className="flex items-end gap-1">
                <span className={cn("text-2xl font-mono font-bold tabular-nums", s.color)}>{s.value}</span>
                <span className="text-xs text-white/35 mb-0.5 font-mono">{s.unit}</span>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>

      {/* ── Main body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: floor plan */}
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <GlassPanel className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-sci-amber" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">隐患图网</span>
              <span className="ml-auto text-[10px] text-white/30">点击标记查看详情</span>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <FloorPlan
                hazards={HAZARDS}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
              />
            </div>

            {/* Legend */}
            <div className="shrink-0 flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <div className="w-2.5 h-2.5 rounded-full bg-sci-red opacity-80" />
                紧急隐患
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <div className="w-2.5 h-2.5 rounded-full bg-sci-amber opacity-80" />
                一般隐患
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Right: hazard list */}
        <div className="w-72 shrink-0 p-4 pl-0 flex flex-col overflow-hidden">
          <GlassPanel className="flex-1 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center gap-2 p-3 pb-2 border-b border-white/[0.06]">
              <ClipboardList className="w-3.5 h-3.5 text-sci-cyan" />
              <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">隐患确认与追踪</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-2">
              {HAZARDS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedId(h.id === selectedId ? null : h.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all duration-200",
                    selectedId === h.id
                      ? h.level === "urgent"
                        ? "bg-sci-red/10 border-sci-red/30"
                        : "bg-sci-amber/10 border-sci-amber/30"
                      : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/15"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded border font-bold shrink-0 mt-0.5",
                      h.level === "urgent"
                        ? "bg-sci-red/15 text-sci-red border-sci-red/25"
                        : "bg-sci-amber/15 text-sci-amber border-sci-amber/25"
                    )}>
                      {h.level === "urgent" ? "紧急" : "一般"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-white/85 truncate">{h.device}</div>
                      <div className="text-[10px] text-white/50 mt-0.5 truncate">{h.title}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[9px] text-white/35">
                    <span className="flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {h.assignee}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Clock className="w-2.5 h-2.5" />
                      {h.reportedAgo}
                    </span>
                  </div>

                  {/* Mini stepper */}
                  <div className="flex items-center gap-1 mt-2">
                    {WORKFLOW_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-1 rounded-full",
                          i < h.step   ? (h.level === "urgent" ? "bg-sci-red/60" : "bg-sci-amber/60") :
                          i === h.step ? (h.level === "urgent" ? "bg-sci-red" : "bg-sci-amber") :
                                         "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <div className="text-[8px] text-white/30 mt-1">
                    {WORKFLOW_STEPS[h.step]} · 步骤 {h.step + 1}/{WORKFLOW_STEPS.length}
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ── Slide-in detail drawer */}
      <AnimatePresence>
        {selected && (
          <HazardDrawer hazard={selected} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
