import React, { useEffect, useState } from "react";
import { GlassPanel } from "../../ui/glass-panel";

interface GanttBlock {
  start: number;
  end: number;
  label: string;
  type: "occupied" | "ai-optimized";
}

interface GanttRow {
  name: string;
  blocks: GanttBlock[];
}

const MOCK_ROWS: GanttRow[] = [
  {
    name: "离心机",
    blocks: [
      { start: 7,  end: 10,   label: "结构稳定", type: "occupied" },
      { start: 10, end: 12,   label: "AI优化",   type: "ai-optimized" },
      { start: 12, end: 15,   label: "桩基测试", type: "occupied" },
      { start: 18, end: 22,   label: "岩土试验", type: "occupied" },
    ],
  },
  {
    name: "MTS台架",
    blocks: [
      { start: 8,  end: 11,   label: "疲劳测试", type: "occupied" },
      { start: 11, end: 13,   label: "AI优化",   type: "ai-optimized" },
      { start: 13, end: 17,   label: "承载力",   type: "occupied" },
    ],
  },
  {
    name: "振动台",
    blocks: [
      { start: 6,  end: 9,    label: "地震模拟", type: "occupied" },
      { start: 9,  end: 11,   label: "AI优化",   type: "ai-optimized" },
      { start: 11, end: 14,   label: "结构动力", type: "occupied" },
      { start: 20, end: 23,   label: "强震测试", type: "occupied" },
    ],
  },
  {
    name: "驾驶模拟",
    blocks: [
      { start: 9,    end: 12,   label: "驾驶行为", type: "occupied" },
      { start: 14,   end: 18,   label: "自动驾驶", type: "occupied" },
      { start: 18,   end: 19.5, label: "AI优化",   type: "ai-optimized" },
    ],
  },
  {
    name: "高低温箱",
    blocks: [
      { start: 7,  end: 13,   label: "热循环试验", type: "occupied" },
      { start: 15, end: 20,   label: "低温疲劳",   type: "occupied" },
    ],
  },
];

const TICK_HOURS = [0, 6, 12, 18, 24];

export function GanttPanel() {
  const [rows, setRows] = useState<GanttRow[]>(MOCK_ROWS);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/schedule/today")
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((data: GanttRow[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setRows(data);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const now = new Date();
  const nowPct = ((now.getHours() + now.getMinutes() / 60) / 24) * 100;
  const pct = (h: number) => (h / 24) * 100;

  return (
    <GlassPanel className="flex flex-col flex-1 overflow-hidden p-3">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">
          多场耦合资源甘特图
        </h3>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="flex items-center gap-1 text-white/40">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ background: "rgba(0,240,255,0.35)" }}
            />
            占用
          </span>
          <span className="flex items-center gap-1 text-white/40">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ background: "rgba(255,184,0,0.35)" }}
            />
            AI优化
          </span>
        </div>
      </div>

      <div className="flex mb-1 pl-[60px] shrink-0">
        {TICK_HOURS.map((h) => (
          <div
            key={h}
            className="flex-1 text-[8.5px] font-mono text-white/25 text-center"
          >
            {h < 24 ? `${String(h).padStart(2, "0")}:00` : "24"}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-2 h-[26px]">
            <div className="w-[56px] shrink-0 text-[9px] font-mono text-white/45 text-right pr-1 truncate">
              {row.name}
            </div>
            <div className="flex-1 h-full relative bg-white/[0.04] rounded overflow-hidden border border-white/[0.06]">
              <div
                className="absolute top-0 bottom-0 w-px z-10"
                style={{
                  left: `${nowPct}%`,
                  background: "var(--sci-green)",
                  opacity: 0.7,
                  boxShadow: "0 0 4px var(--sci-green)",
                }}
              />
              {row.blocks.map((block, bi) => {
                const left = pct(block.start);
                const width = pct(block.end - block.start);
                const isAI = block.type === "ai-optimized";
                return (
                  <div
                    key={bi}
                    className="absolute top-[2px] bottom-[2px] rounded flex items-center overflow-hidden"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: isAI
                        ? "rgba(255,184,0,0.22)"
                        : "rgba(0,240,255,0.18)",
                      border: `1px solid ${isAI ? "rgba(255,184,0,0.65)" : "rgba(0,240,255,0.55)"}`,
                    }}
                  >
                    <span
                      className="text-[8px] font-mono px-1 truncate leading-none"
                      style={{
                        color: isAI ? "var(--sci-amber)" : "var(--sci-cyan)",
                      }}
                    >
                      {isAI ? "AI↑" : block.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
