import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ClipboardCheck, Wrench, Download, GraduationCap,
  CheckCircle2, Clock, ChevronRight, Bell, Plus,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const TODOS = [
  { id: "t1", type: "approval", title: "大型离心机使用申请", applicant: "张伟", lab: "岩土科研实验室", time: "待审批", urgent: true },
  { id: "t2", type: "approval", title: "MTS多功能试验台预约", applicant: "刘敏", lab: "结构实验室", time: "待审批", urgent: false },
  { id: "t3", type: "approval", title: "高低温低气压箱申请", applicant: "陈磊", lab: "材料实验室", time: "待审批", urgent: false },
  { id: "t4", type: "report",   title: "冷冻干燥机维修报告", applicant: "维保组", lab: "综合测试区", time: "待签阅", urgent: true },
];

const SHORTCUTS = [
  { id: "s1", icon: Plus,          label: "一键预约", color: "text-sci-cyan",  bg: "bg-sci-cyan/10",  border: "border-sci-cyan/30" },
  { id: "s2", icon: Wrench,        label: "报修申请", color: "text-sci-amber", bg: "bg-sci-amber/10", border: "border-sci-amber/30" },
  { id: "s3", icon: Download,      label: "数据导出", color: "text-sci-green", bg: "bg-sci-green/10", border: "border-sci-green/30" },
  { id: "s4", icon: GraduationCap, label: "培训记录", color: "text-white/60",  bg: "bg-white/5",      border: "border-white/10" },
];

// Calendar: current week (Mon–Sun) with bookings on Tue and Thu
const WEEK_DAYS = ["一", "二", "三", "四", "五", "六", "日"];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon

interface Booking {
  day: number;
  start: number;
  end: number;
  label: string;
  equipment: string;
}

const BOOKINGS: Booking[] = [
  { day: 1, start: 9,  end: 12, label: "大型离心机",     equipment: "EQ001" },
  { day: 3, start: 14, end: 18, label: "智能恒温恒湿箱", equipment: "EQ-THERMO" },
];

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkspaceView() {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const markDone = (id: string) =>
    setDoneIds((prev) => new Set([...prev, id]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full h-full overflow-y-auto scrollbar-hide p-6"
    >
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-sci-cyan/10 border border-sci-cyan/20 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-sci-cyan" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white/90 tracking-wide">我的工作台</h1>
          <p className="text-[11px] text-white/40">个人任务中心 · 深圳大学土木工程国家重点实验室</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sci-amber/10 border border-sci-amber/25 text-[11px] text-sci-amber font-medium">
            <Bell className="w-3 h-3" />
            {TODOS.filter((t) => !doneIds.has(t.id)).length} 项待处理
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* ── 待办事项 ────────────────────────────────── col 1-7 */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <GlassPanel className="p-4">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-3.5 h-3.5 text-sci-cyan" />
              待办事项
              <span className="ml-auto text-sci-cyan font-mono">
                {TODOS.filter((t) => !doneIds.has(t.id)).length}/{TODOS.length}
              </span>
            </h2>

            <div className="space-y-2">
              <AnimatePresence>
                {TODOS.map((todo) => {
                  const done = doneIds.has(todo.id);
                  return (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                        done
                          ? "opacity-40 border-white/5 bg-white/[0.02]"
                          : todo.urgent
                          ? "border-sci-amber/25 bg-sci-amber/5 hover:bg-sci-amber/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          done
                            ? "bg-white/20"
                            : todo.urgent
                            ? "bg-sci-amber animate-pulse"
                            : "bg-sci-cyan/60"
                        )}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-medium truncate", done ? "line-through text-white/30" : "text-white/85")}>
                            {todo.title}
                          </span>
                          {todo.urgent && !done && (
                            <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-sci-amber/20 text-sci-amber border border-sci-amber/30 font-semibold">
                              紧急
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          {todo.applicant} · {todo.lab}
                        </div>
                      </div>

                      <span
                        className={cn(
                          "text-[10px] shrink-0 px-2 py-0.5 rounded border font-mono",
                          done
                            ? "text-white/20 border-white/10"
                            : todo.type === "approval"
                            ? "text-sci-cyan border-sci-cyan/20 bg-sci-cyan/5"
                            : "text-sci-amber border-sci-amber/20 bg-sci-amber/5"
                        )}
                      >
                        {done ? "已完成" : todo.time}
                      </span>

                      {!done && (
                        <button
                          onClick={() => markDone(todo.id)}
                          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-sci-cyan/10 border border-sci-cyan/20 text-sci-cyan text-[10px] hover:bg-sci-cyan/20 transition-colors font-medium"
                        >
                          处理
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {done && <CheckCircle2 className="w-4 h-4 text-sci-green shrink-0" />}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </GlassPanel>

          {/* ── 快捷入口 */}
          <GlassPanel className="p-4">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sci-cyan" />
              快捷入口
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {SHORTCUTS.map((s) => (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200",
                    s.bg, s.border,
                    "hover:brightness-125"
                  )}
                >
                  <s.icon className={cn("w-5 h-5", s.color)} />
                  <span className={cn("text-[11px] font-medium", s.color)}>{s.label}</span>
                </motion.button>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* ── 我的实验日历 ─────────────────────────────── col 8-12 */}
        <div className="col-span-12 lg:col-span-5">
          <GlassPanel className="p-4 h-full">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-sci-cyan" />
              我的实验日历
              <span className="ml-auto text-[10px] text-white/30 normal-case tracking-normal font-normal">本周预约</span>
            </h2>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {WEEK_DAYS.map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    "text-center text-[10px] font-medium py-1 rounded",
                    i === TODAY_IDX
                      ? "text-sci-cyan bg-sci-cyan/10"
                      : "text-white/40"
                  )}
                >
                  周{d}
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="space-y-0.5">
              {HOURS.map((h) => (
                <div key={h} className="flex items-center gap-1">
                  <span className="text-[9px] text-white/25 font-mono w-6 shrink-0 text-right">
                    {h}
                  </span>
                  <div className="flex-1 grid grid-cols-7 gap-px">
                    {WEEK_DAYS.map((_, dayIdx) => {
                      const booking = BOOKINGS.find(
                        (b) => b.day === dayIdx && h >= b.start && h < b.end
                      );
                      const isFirst = booking && h === booking.start;
                      const span = booking ? booking.end - booking.start : 0;
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            "h-4 rounded-sm transition-all",
                            booking
                              ? "bg-sci-cyan/25 border border-sci-cyan/40"
                              : "bg-white/[0.02] border border-white/[0.04]"
                          )}
                          title={booking ? `${booking.label} ${booking.start}:00–${booking.end}:00` : undefined}
                        >
                          {isFirst && (
                            <span className="text-[7px] text-sci-cyan font-medium leading-none pl-0.5 truncate block">
                              {booking!.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
              {BOOKINGS.map((b) => (
                <div key={b.equipment} className="flex items-center gap-2 text-[10px]">
                  <div className="w-2.5 h-2.5 rounded-sm bg-sci-cyan/30 border border-sci-cyan/50 shrink-0" />
                  <span className="text-white/70 font-medium">{b.label}</span>
                  <span className="text-white/35 ml-auto font-mono">
                    周{WEEK_DAYS[b.day]} {b.start}:00–{b.end}:00
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </motion.div>
  );
}
