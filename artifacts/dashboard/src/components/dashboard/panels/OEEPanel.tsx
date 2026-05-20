import React, { useEffect, useState } from "react";
import { GlassPanel } from "../../ui/glass-panel";

const OEE_DATA = [
  { short: "驾驶模拟器",     pct: 92, status: "运转中", colorVar: "var(--sci-green)" },
  { short: "MTS 试验台架",   pct: 78, status: "使用中", colorVar: "var(--sci-cyan)" },
  { short: "地震模拟振动台", pct: 84, status: "预约中", colorVar: "var(--sci-cyan)" },
  { short: "高低温试验箱",   pct: 61, status: "警告",   colorVar: "var(--sci-amber)" },
  { short: "冷冻干燥机",     pct:  0, status: "闲置",   colorVar: "rgba(255,255,255,0.25)" },
  { short: "高低温低气压箱", pct: 47, status: "检修中", colorVar: "var(--sci-red)" },
];

const SIZE = 42;
const SW = 4;
const R = (SIZE - SW * 2) / 2;
const CIRC = 2 * Math.PI * R;

function Ring({ pct, colorVar, animated }: { pct: number; colorVar: string; animated: boolean }) {
  const offset = CIRC - (CIRC * (animated ? pct : 0)) / 100;
  return (
    <svg width={SIZE} height={SIZE} className="shrink-0" style={{ overflow: "visible" }}>
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={SW}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke={colorVar}
        strokeWidth={SW}
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        style={{
          transition: "stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)",
          filter: `drop-shadow(0 0 3px ${colorVar})`,
        }}
      />
      <text
        x={SIZE / 2}
        y={SIZE / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colorVar}
        fontSize={8}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="bold"
      >
        {pct > 0 ? `${pct}%` : "—"}
      </text>
    </svg>
  );
}

export function OEEPanel() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <GlassPanel className="flex flex-col flex-1 overflow-hidden p-3">
      <h3 className="text-[10px] font-semibold tracking-widest text-white/60 uppercase mb-2 shrink-0">
        核心资产在线率 OEE
      </h3>
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5">
        {OEE_DATA.map((item) => (
          <div
            key={item.short}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
          >
            <Ring pct={item.pct} colorVar={item.colorVar} animated={animated} />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-white/80 truncate font-medium leading-tight">
                {item.short}
              </div>
              <div
                className="text-[9px] font-mono mt-0.5 font-bold"
                style={{ color: item.colorVar }}
              >
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
