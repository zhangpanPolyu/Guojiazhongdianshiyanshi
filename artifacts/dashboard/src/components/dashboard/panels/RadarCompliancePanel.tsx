import React, { useState, useEffect } from "react";
import { GlassPanel } from "../../ui/glass-panel";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const TARGET = [
  { subject: "年均机时", value: 87, fullMark: 100 },
  { subject: "共享率", value: 73, fullMark: 100 },
  { subject: "服务收入", value: 65, fullMark: 100 },
  { subject: "用户评价", value: 92, fullMark: 100 },
  { subject: "培训人次", value: 78, fullMark: 100 },
];

const ZERO = TARGET.map((d) => ({ ...d, value: 0 }));

export function RadarCompliancePanel() {
  const [data, setData] = useState(ZERO);

  useEffect(() => {
    const t = setTimeout(() => setData(TARGET), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <GlassPanel className="flex flex-col p-3" style={{ height: "230px" }}>
      <div className="flex items-center justify-between mb-1 shrink-0">
        <h3 className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">
          国家开放共享考核
        </h3>
        <span className="text-[9px] font-mono text-sci-cyan bg-sci-cyan/10 px-1.5 py-0.5 rounded border border-sci-cyan/20">
          2026 Q1
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <PolarGrid
              stroke="rgba(0,240,255,0.12)"
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: "rgba(255,255,255,0.45)",
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <Radar
              dataKey="value"
              stroke="#00F0FF"
              fill="#00F0FF"
              fillOpacity={0.18}
              strokeWidth={1.5}
              dot={{ r: 2, fill: "#00F0FF", strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}
