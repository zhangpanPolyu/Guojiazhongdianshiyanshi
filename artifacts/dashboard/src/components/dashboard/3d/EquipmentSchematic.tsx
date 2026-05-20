import React, { useMemo } from "react";
import {
  useListEquipment,
  getListEquipmentQueryKey,
} from "@workspace/api-client-react";
import { useDashboard } from "@/context/DashboardContext";

const STATUS_COLOR: Record<string, string> = {
  running: "#00FF66",
  warning: "#FFB800",
  fault: "#FF003C",
  maintenance: "#A080FF",
  offline: "#607090",
};

const CATEGORY_META: Record<string, { labelZh: string; labelEn: string; color: string; angle: number }> = {
  sensors:     { labelZh: "传感器",   labelEn: "Sensors",      color: "#00F0FF", angle: -90 },
  analyzers:   { labelZh: "分析仪器", labelEn: "Analyzers",    color: "#00FF66", angle: -30 },
  testing:     { labelZh: "测试设备", labelEn: "Testing",      color: "#FFB800", angle:  30 },
  data:        { labelZh: "数据采集", labelEn: "Data Acq.",    color: "#A080FF", angle:  90 },
  network:     { labelZh: "网络节点", labelEn: "Network",      color: "#00BFFF", angle: 150 },
  environment: { labelZh: "环境监测", labelEn: "Environment",  color: "#80FF80", angle: 210 },
};

const CX = 450;
const CY = 310;
const HUB_R = 38;
const CAT_R = 22;
const EQ_R = 14;
const ORBIT1 = 130;
const ORBIT2 = 240;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function catPos(angle: number) {
  const r = toRad(angle);
  return { x: CX + ORBIT1 * Math.cos(r), y: CY + ORBIT1 * Math.sin(r) };
}

function eqPos(catAngle: number, idx: number, total: number) {
  const spread = Math.min(50, 30 + total * 8);
  const startAngle = catAngle - (spread * (total - 1)) / 2;
  const angle = startAngle + spread * idx;
  const r = toRad(angle);
  return { x: CX + ORBIT2 * Math.cos(r), y: CY + ORBIT2 * Math.sin(r) };
}

export function EquipmentSchematic() {
  const { selectedEquipmentId, setSelectedEquipmentId, language } = useDashboard();

  const { data: equipment = [] } = useListEquipment(undefined, {
    query: { queryKey: getListEquipmentQueryKey() },
  });

  const grouped = useMemo(() => {
    const g: Record<string, typeof equipment> = {};
    for (const eq of equipment) {
      const cat = eq.category ?? "data";
      if (!g[cat]) g[cat] = [];
      g[cat].push(eq);
    }
    return g;
  }, [equipment]);

  const categories = Object.keys(CATEGORY_META);

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center bg-transparent select-none">
      <svg
        viewBox="0 0 900 620"
        className="w-full h-full"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      >
        <defs>
          <filter id="eq-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="eq-glow-sm">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="hub-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* title */}
        <text
          x={CX}
          y={22}
          textAnchor="middle"
          fill="#00F0FF"
          fillOpacity="0.9"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="3"
        >
          EQUIPMENT HIERARCHY — NODE GRAPH
        </text>

        {/* orbit rings */}
        <circle cx={CX} cy={CY} r={ORBIT1} fill="none" stroke="#00F0FF" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 8" />
        <circle cx={CX} cy={CY} r={ORBIT2} fill="none" stroke="#00F0FF" strokeWidth="0.5" strokeOpacity="0.10" strokeDasharray="4 12" />

        {/* category → equipment edges */}
        {categories.map((catId) => {
          const catMeta = CATEGORY_META[catId];
          const cp = catPos(catMeta.angle);
          const eqs = grouped[catId] ?? [];
          return eqs.map((eq, idx) => {
            const ep = eqPos(catMeta.angle, idx, eqs.length);
            const isSelected = selectedEquipmentId === eq.id;
            const eqColor = STATUS_COLOR[eq.status] ?? catMeta.color;
            return (
              <line
                key={eq.id + "-edge"}
                x1={cp.x}
                y1={cp.y}
                x2={ep.x}
                y2={ep.y}
                stroke={isSelected ? eqColor : catMeta.color}
                strokeWidth={isSelected ? 1.5 : 0.8}
                strokeOpacity={isSelected ? 0.8 : 0.25}
              />
            );
          });
        })}

        {/* hub → category edges */}
        {categories.map((catId) => {
          const catMeta = CATEGORY_META[catId];
          const cp = catPos(catMeta.angle);
          return (
            <line
              key={catId + "-hub-edge"}
              x1={CX}
              y1={CY}
              x2={cp.x}
              y2={cp.y}
              stroke={catMeta.color}
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
          );
        })}

        {/* category nodes */}
        {categories.map((catId) => {
          const catMeta = CATEGORY_META[catId];
          const cp = catPos(catMeta.angle);
          const label = language === "zh" ? catMeta.labelZh : catMeta.labelEn;
          const eqs = grouped[catId] ?? [];
          const hasSelected = eqs.some((eq) => eq.id === selectedEquipmentId);
          return (
            <g key={catId}>
              <circle
                cx={cp.x}
                cy={cp.y}
                r={CAT_R + 8}
                fill="none"
                stroke={catMeta.color}
                strokeWidth="1"
                strokeOpacity={hasSelected ? 0.5 : 0.15}
                strokeDasharray="3 5"
              />
              <circle
                cx={cp.x}
                cy={cp.y}
                r={CAT_R}
                fill="rgba(0,5,20,0.9)"
                stroke={catMeta.color}
                strokeWidth="1.8"
                strokeOpacity={hasSelected ? 1 : 0.6}
                filter={hasSelected ? "url(#eq-glow-sm)" : undefined}
              />
              <circle cx={cp.x} cy={cp.y} r={4} fill={catMeta.color} fillOpacity="0.8" />
              <text
                x={cp.x}
                y={cp.y + CAT_R + 14}
                textAnchor="middle"
                fill={catMeta.color}
                fillOpacity="0.85"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="600"
              >
                {label}
              </text>
              <text
                x={cp.x}
                y={cp.y + CAT_R + 25}
                textAnchor="middle"
                fill={catMeta.color}
                fillOpacity="0.5"
                fontSize="7.5"
                fontFamily="monospace"
              >
                {eqs.length} units
              </text>
            </g>
          );
        })}

        {/* equipment nodes */}
        {categories.map((catId) => {
          const catMeta = CATEGORY_META[catId];
          const eqs = grouped[catId] ?? [];
          return eqs.map((eq, idx) => {
            const ep = eqPos(catMeta.angle, idx, eqs.length);
            const color = STATUS_COLOR[eq.status] ?? catMeta.color;
            const isSelected = selectedEquipmentId === eq.id;
            const label = language === "zh" ? eq.name : eq.nameEn;
            const shortLabel = label.length > 12 ? label.slice(0, 11) + "…" : label;

            return (
              <g
                key={eq.id}
                onClick={() => setSelectedEquipmentId(isSelected ? null : eq.id)}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={label}
              >
                {isSelected && (
                  <circle cx={ep.x} cy={ep.y} r={EQ_R + 10} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" filter="url(#eq-glow)">
                    <animate attributeName="r" values={`${EQ_R + 6};${EQ_R + 16};${EQ_R + 6}`} dur="1.4s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.5;0.1;0.5" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                )}

                <circle
                  cx={ep.x}
                  cy={ep.y}
                  r={EQ_R}
                  fill="rgba(0,5,20,0.92)"
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={isSelected ? "url(#eq-glow-sm)" : undefined}
                />
                <circle cx={ep.x} cy={ep.y} r={isSelected ? 5 : 3.5} fill={color} />

                <text
                  x={ep.x}
                  y={ep.y + EQ_R + 10}
                  textAnchor="middle"
                  fill={color}
                  fillOpacity={isSelected ? 1 : 0.75}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight={isSelected ? "700" : "400"}
                >
                  {shortLabel}
                </text>
                <text
                  x={ep.x}
                  y={ep.y + EQ_R + 19}
                  textAnchor="middle"
                  fill={color}
                  fillOpacity="0.5"
                  fontSize="6.5"
                  fontFamily="monospace"
                >
                  {eq.id}
                </text>
              </g>
            );
          });
        })}

        {/* hub node */}
        <circle cx={CX} cy={CY} r={HUB_R + 16} fill="url(#hub-grad)" />
        <circle
          cx={CX}
          cy={CY}
          r={HUB_R}
          fill="rgba(0,5,20,0.95)"
          stroke="#00F0FF"
          strokeWidth="2"
          strokeOpacity="0.9"
          filter="url(#eq-glow)"
        />
        <circle cx={CX} cy={CY} r={8} fill="#00F0FF" fillOpacity="0.9" />
        <text
          x={CX}
          y={CY - 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#00F0FF"
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="1"
        >
          DIGITAL
        </text>
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#00F0FF"
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="1"
        >
          TWIN
        </text>
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#00F0FF"
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="1"
        >
          HUB
        </text>

        {/* legend */}
        {Object.entries(STATUS_COLOR).map(([status, color], i) => (
          <g key={status} transform={`translate(${20 + i * 150}, 598)`}>
            <circle cx={6} cy={6} r={5} fill="rgba(0,5,20,0.9)" stroke={color} strokeWidth="1.5" />
            <circle cx={6} cy={6} r={2} fill={color} />
            <text x={15} y={6} dominantBaseline="middle" fill={color} fillOpacity="0.8" fontSize="9" fontFamily="monospace">
              {status}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
