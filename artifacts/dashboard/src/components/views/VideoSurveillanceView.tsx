import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, ChevronDown, ChevronRight, Maximize2, X } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

// ─── Mock camera data ─────────────────────────────────────────────────────────

interface Camera {
  id: string;
  name: string;
  location: string;
  online: boolean;
}

interface CameraGroup {
  id: string;
  label: string;
  cameras: Camera[];
}

const GROUPS: CameraGroup[] = [
  {
    id: "hall",
    label: "结构大厅",
    cameras: [
      { id: "CAM-101", name: "正门入口", location: "结构大厅 1F", online: true },
      { id: "CAM-102", name: "中央试验区", location: "结构大厅 1F", online: true },
      { id: "CAM-103", name: "吊装区域", location: "结构大厅 2F", online: true },
      { id: "CAM-104", name: "控制室", location: "结构大厅 1F", online: false },
    ],
  },
  {
    id: "geo",
    label: "岩土科研实验室",
    cameras: [
      { id: "CAM-201", name: "离心机作业区", location: "岩土实验室 B1", online: true },
      { id: "CAM-202", name: "岩样储存区", location: "岩土实验室 1F", online: true },
      { id: "CAM-203", name: "走廊", location: "岩土实验室 1F", online: true },
    ],
  },
  {
    id: "bim",
    label: "BIM实验室",
    cameras: [
      { id: "CAM-301", name: "工作站区", location: "BIM实验室 3F", online: true },
      { id: "CAM-302", name: "会议演示区", location: "BIM实验室 3F", online: true },
    ],
  },
];

const ALL_CAMERAS = GROUPS.flatMap((g) => g.cameras);

// ─── Live timestamp hook ───────────────────────────────────────────────────────

function useLiveTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

// ─── Camera Feed ─────────────────────────────────────────────────────────────

function CameraFeed({
  camera,
  onExpand,
  expanded = false,
}: {
  camera: Camera;
  onExpand?: () => void;
  expanded?: boolean;
}) {
  const now = useLiveTime();
  const timeStr = now.toLocaleTimeString("zh-CN", { hour12: false });
  const dateStr = now.toLocaleDateString("zh-CN");

  return (
    <div
      className={cn(
        "relative bg-[#02050d] rounded-xl border border-white/[0.08] overflow-hidden cursor-pointer group",
        "hover:border-sci-cyan/30 transition-all duration-200",
        expanded ? "h-full" : "h-full"
      )}
      onClick={onExpand}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />

      {/* Moving scan beam */}
      <div
        className="absolute left-0 right-0 h-12 pointer-events-none z-10 opacity-20"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(0,240,255,0.15), transparent)",
          animation: "scan-line 3s linear infinite",
          animationDelay: `${camera.id.charCodeAt(4) * 0.3}s`,
        }}
      />

      {/* Camera static noise texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "100px 100px",
        }}
      />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id={`grid-${camera.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F0FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${camera.id})`} />
        </svg>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-b from-black/60 to-transparent">
        {/* REC indicator */}
        <div className="flex items-center gap-1.5">
          {camera.online ? (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full bg-sci-red"
                style={{ animation: "pulse-danger 1.5s ease-in-out infinite" }}
              />
              <span className="text-[9px] text-sci-red font-bold tracking-widest">REC</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span className="text-[9px] text-white/30 font-bold tracking-widest">OFFLINE</span>
            </>
          )}
        </div>
        {/* Camera ID */}
        <span className="text-[9px] font-mono text-white/40">{camera.id}</span>
      </div>

      {/* Center area — online indicator or offline message */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        {!camera.online && (
          <div className="text-center">
            <Video className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-[10px] text-white/20">信号中断</p>
          </div>
        )}
        {camera.online && (
          <div className="flex flex-col items-center gap-1 opacity-10">
            <div className="w-12 h-12 rounded-full border-2 border-sci-cyan/50" />
            <div className="w-6 h-px bg-sci-cyan/50" />
            <div className="w-6 h-px bg-sci-cyan/50" />
          </div>
        )}
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-2.5 py-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-medium text-white/85">{camera.name}</div>
            <div className="text-[9px] text-white/40">{camera.location}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono text-sci-cyan/80">{timeStr}</div>
            <div className="text-[8px] font-mono text-white/30">{dateStr}</div>
          </div>
        </div>
      </div>

      {/* Expand button on hover */}
      {onExpand && !expanded && (
        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1 rounded bg-black/60 border border-white/10">
            <Maximize2 className="w-3 h-3 text-white/60" />
          </div>
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-sci-cyan/30 z-30" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-sci-cyan/30 z-30" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-sci-cyan/30 z-30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-sci-cyan/30 z-30" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VideoSurveillanceView() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["hall"]));
  const [selectedCam, setSelectedCam] = useState<string>("CAM-101");
  const [fullscreenCam, setFullscreenCam] = useState<string | null>(null);

  const gridCameras = ALL_CAMERAS.filter((c) => c.online).slice(0, 4);
  const fullCam = ALL_CAMERAS.find((c) => c.id === fullscreenCam);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenCam(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full h-full flex overflow-hidden"
    >
      {/* ── Left tree menu */}
      <div className="w-52 shrink-0 h-full border-r border-white/[0.07] bg-[rgba(4,6,17,0.6)] flex flex-col">
        <div className="h-12 border-b border-white/[0.07] flex items-center px-4 gap-2">
          <Video className="w-4 h-4 text-sci-cyan" />
          <span className="text-xs font-semibold text-white/80 tracking-wide">监控点位</span>
          <span className="ml-auto text-[10px] font-mono text-sci-cyan">
            {ALL_CAMERAS.filter((c) => c.online).length}/{ALL_CAMERAS.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {GROUPS.map((group) => {
            const isOpen = openGroups.has(group.id);
            const onlineCount = group.cameras.filter((c) => c.online).length;
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/[0.04] transition-colors text-left"
                >
                  {isOpen ? (
                    <ChevronDown className="w-3 h-3 text-white/40 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-white/40 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-white/70 flex-1 truncate">{group.label}</span>
                  <span className="text-[9px] font-mono text-sci-green/70 shrink-0">{onlineCount}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      {group.cameras.map((cam) => (
                        <button
                          key={cam.id}
                          onClick={() => setSelectedCam(cam.id)}
                          className={cn(
                            "w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left transition-colors",
                            selectedCam === cam.id
                              ? "bg-sci-cyan/10 border-r-2 border-r-sci-cyan"
                              : "hover:bg-white/[0.03]"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              cam.online ? "bg-sci-green" : "bg-white/20"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className={cn("text-[10px] truncate", selectedCam === cam.id ? "text-sci-cyan" : "text-white/55")}>
                              {cam.name}
                            </div>
                            <div className="text-[9px] text-white/25 font-mono truncate">{cam.id}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right grid */}
      <div className="flex-1 h-full p-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">实时监控</span>
          <span className="text-[10px] text-white/30">· 2×2 网格视图</span>
          <span className="ml-auto text-[10px] text-white/25">点击画面可全屏</span>
        </div>

        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
          {gridCameras.map((cam) => (
            <CameraFeed
              key={cam.id}
              camera={cam}
              onExpand={() => setFullscreenCam(cam.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Fullscreen overlay */}
      <AnimatePresence>
        {fullscreenCam && fullCam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 flex flex-col p-6 backdrop-blur-sm"
            onClick={() => setFullscreenCam(null)}
          >
            <div className="flex items-center justify-between mb-3 shrink-0" onClick={(e) => e.stopPropagation()}>
              <div>
                <span className="text-sm font-semibold text-white/90">{fullCam.name}</span>
                <span className="text-xs text-white/40 ml-3">{fullCam.location}</span>
              </div>
              <button
                onClick={() => setFullscreenCam(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
              <CameraFeed camera={fullCam} expanded />
            </div>
            <p className="text-center text-[10px] text-white/20 mt-3 shrink-0">点击画面或按 ESC 退出全屏</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
