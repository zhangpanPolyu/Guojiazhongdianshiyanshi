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

const SIGNAL_QUALITY: Record<string, number> = {
  running: 0.95,
  warning: 0.60,
  fault: 0.20,
  maintenance: 0.50,
  offline: 0.05,
};

const NODE_POSITIONS: Record<string, { x: number; y: number; zone: string }> = {
  EQ001: { x: 320, y: 140, zone: "Zone A" },
  EQ002: { x: 210, y: 230, zone: "Lab B" },
  EQ003: { x: 560, y: 390, zone: "Struct. Lab" },
  EQ004: { x: 420, y: 290, zone: "Control" },
  EQ005: { x: 130, y: 310, zone: "Exterior" },
  EQ006: { x: 290, y: 360, zone: "Platform D" },
  EQ007: { x: 480, y: 460, zone: "Mat. Lab" },
  EQ008: { x: 600, y: 280, zone: "Mat. Lab" },
  EQ009: { x: 100, y: 180, zone: "Building B" },
  EQ010: { x: 650, y: 460, zone: "Test Hall" },
  EQ011: { x: 370, y: 480, zone: "NDT Lab" },
  EQ012: { x: 490, y: 110, zone: "Rooftop" },
};

const GATEWAY_POS = { x: 400, y: 290 };

const ZONE_AREAS = [
  { x: 80,  y: 90,  w: 320, h: 200, label: "Monitoring Wing",    color: "#00F0FF" },
  { x: 80,  y: 260, w: 220, h: 200, label: "Exterior / On-site", color: "#00BFFF" },
  { x: 350, y: 230, w: 330, h: 280, label: "Testing Complex",    color: "#FFB800" },
  { x: 420, y: 80,  w: 230, h: 170, label: "Control & Roof",     color: "#A080FF" },
];

function getConnections(equipment: { id: string; status: string }[]) {
  const connections: { a: string; b: string; quality: number }[] = [];
  const ids = equipment.map((e) => e.id);
  const statusMap = Object.fromEntries(equipment.map((e) => [e.id, e.status]));

  const LINKS = [
    ["EQ004", "EQ001"], ["EQ004", "EQ002"], ["EQ004", "EQ005"],
    ["EQ004", "EQ012"], ["EQ004", "EQ003"], ["EQ004", "EQ006"],
    ["EQ004", "EQ007"], ["EQ004", "EQ008"], ["EQ004", "EQ009"],
    ["EQ004", "EQ010"], ["EQ004", "EQ011"],
    ["EQ001", "EQ002"], ["EQ001", "EQ009"],
    ["EQ005", "EQ009"], ["EQ005", "EQ002"],
    ["EQ002", "EQ006"], ["EQ006", "EQ011"],
    ["EQ003", "EQ007"], ["EQ003", "EQ010"],
    ["EQ007", "EQ008"], ["EQ007", "EQ011"],
    ["EQ012", "EQ008"],
  ];

  for (const [a, b] of LINKS) {
    if (!ids.includes(a) || !ids.includes(b)) continue;
    const qa = SIGNAL_QUALITY[statusMap[a]] ?? 0.5;
    const qb = SIGNAL_QUALITY[statusMap[b]] ?? 0.5;
    connections.push({ a, b, quality: (qa + qb) / 2 });
  }
  return connections;
}

function signalColor(quality: number) {
  if (quality >= 0.85) return "#00FF66";
  if (quality >= 0.60) return "#80FF40";
  if (quality >= 0.40) return "#FFB800";
  if (quality >= 0.20) return "#FF6020";
  return "#FF003C";
}

export function NetworkTopology() {
  const { selectedEquipmentId, setSelectedEquipmentId, language } = useDashboard();

  const { data: equipment = [] } = useListEquipment(undefined, {
    query: { queryKey: getListEquipmentQueryKey() },
  });

  const connections = useMemo(() => getConnections(equipment), [equipment]);

  const equipMap = useMemo(
    () => Object.fromEntries(equipment.map((e) => [e.id, e])),
    [equipment]
  );

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center bg-transparent select-none">
      <svg
        viewBox="0 0 780 580"
        className="w-full h-full"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      >
        <defs>
          <filter id="topo-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="topo-glow-sm">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* heat-map radial gradients per equipment */}
          {equipment.map((eq) => {
            const pos = NODE_POSITIONS[eq.id];
            if (!pos) return null;
            const color = STATUS_COLOR[eq.status] ?? "#00F0FF";
            const q = SIGNAL_QUALITY[eq.status] ?? 0.5;
            return (
              <radialGradient
                key={`rg-${eq.id}`}
                id={`heat-${eq.id}`}
                cx="50%" cy="50%" r="50%"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.18 * q} />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            );
          })}

          <pattern id="topo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F0FF" strokeWidth="0.3" strokeOpacity="0.08" />
          </pattern>
        </defs>

        {/* background grid */}
        <rect x="0" y="0" width="780" height="580" fill="url(#topo-grid)" />

        {/* title */}
        <text
          x={390}
          y={22}
          textAnchor="middle"
          fill="#00F0FF"
          fillOpacity="0.9"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="3"
        >
          WIRELESS SENSOR NETWORK — TOPOLOGY MAP
        </text>

        {/* zone areas */}
        {ZONE_AREAS.map((zone, i) => (
          <g key={i}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              rx={6}
              fill={zone.color}
              fillOpacity="0.03"
              stroke={zone.color}
              strokeWidth="0.8"
              strokeOpacity="0.2"
              strokeDasharray="6 4"
            />
            <text
              x={zone.x + 8}
              y={zone.y + 14}
              fill={zone.color}
              fillOpacity="0.4"
              fontSize="8"
              fontFamily="monospace"
            >
              {zone.label}
            </text>
          </g>
        ))}

        {/* heatmap blobs */}
        {equipment.map((eq) => {
          const pos = NODE_POSITIONS[eq.id];
          if (!pos) return null;
          const q = SIGNAL_QUALITY[eq.status] ?? 0.5;
          const radius = 40 + q * 35;
          return (
            <ellipse
              key={`heat-${eq.id}`}
              cx={pos.x}
              cy={pos.y}
              rx={radius}
              ry={radius * 0.75}
              fill={`url(#heat-${eq.id})`}
            />
          );
        })}

        {/* connections */}
        {connections.map(({ a, b, quality }, i) => {
          const pa = NODE_POSITIONS[a];
          const pb = NODE_POSITIONS[b];
          if (!pa || !pb) return null;
          const isHighlighted =
            selectedEquipmentId === a || selectedEquipmentId === b;
          const color = signalColor(quality);
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={color}
              strokeWidth={isHighlighted ? 2 : 0.8}
              strokeOpacity={isHighlighted ? 0.8 : 0.2 + quality * 0.25}
              strokeDasharray={quality < 0.5 ? "4 4" : "none"}
            />
          );
        })}

        {/* nodes */}
        {equipment.map((eq) => {
          const pos = NODE_POSITIONS[eq.id];
          if (!pos) return null;
          const color = STATUS_COLOR[eq.status] ?? "#00F0FF";
          const isSelected = selectedEquipmentId === eq.id;
          const label = language === "zh" ? eq.name : eq.nameEn;
          const shortLabel = label.length > 16 ? label.slice(0, 15) + "…" : label;
          const q = SIGNAL_QUALITY[eq.status] ?? 0.5;
          const r = 11 + q * 4;

          return (
            <g
              key={eq.id}
              onClick={() => setSelectedEquipmentId(isSelected ? null : eq.id)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={label}
            >
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r + 14}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                  filter="url(#topo-glow)"
                >
                  <animate
                    attributeName="r"
                    values={`${r + 8};${r + 22};${r + 8}`}
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="0.6;0.1;0.6"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* signal strength ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r + 5}
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.2}
                strokeDasharray={`${(r + 5) * 2 * Math.PI * q} ${(r + 5) * 2 * Math.PI * (1 - q)}`}
                strokeLinecap="round"
                transform={`rotate(-90, ${pos.x}, ${pos.y})`}
              />

              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill="rgba(0,5,20,0.92)"
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter={isSelected ? "url(#topo-glow-sm)" : undefined}
              />
              <circle cx={pos.x} cy={pos.y} r={isSelected ? 5 : 3.5} fill={color} />

              {/* ID label inside node */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize="6"
                fontFamily="monospace"
                fontWeight="700"
                fillOpacity="0.7"
              >
                {eq.id}
              </text>

              {/* name label below node */}
              <rect
                x={pos.x - 42}
                y={pos.y + r + 4}
                width={84}
                height={13}
                rx={3}
                fill={isSelected ? color : "rgba(0,5,20,0.85)"}
                stroke={color}
                strokeWidth="0.5"
                strokeOpacity={isSelected ? 1 : 0.35}
              />
              <text
                x={pos.x}
                y={pos.y + r + 11}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? "#000" : color}
                fontSize="7"
                fontFamily="monospace"
                fontWeight={isSelected ? "700" : "400"}
              >
                {shortLabel}
              </text>

              {/* signal quality % */}
              <text
                x={pos.x}
                y={pos.y + r + 22}
                textAnchor="middle"
                fill={color}
                fillOpacity="0.5"
                fontSize="6.5"
                fontFamily="monospace"
              >
                {Math.round(q * 100)}% signal
              </text>
            </g>
          );
        })}

        {/* legend — signal quality */}
        <g transform="translate(20, 548)">
          <text fill="#00F0FF" fillOpacity="0.5" fontSize="8" fontFamily="monospace">
            SIGNAL QUALITY:
          </text>
          {[
            { label: "Excellent (≥85%)", color: "#00FF66" },
            { label: "Good (60–84%)",    color: "#80FF40" },
            { label: "Fair (40–59%)",    color: "#FFB800" },
            { label: "Poor (20–39%)",    color: "#FF6020" },
            { label: "Critical (<20%)",  color: "#FF003C" },
          ].map(({ label, color }, i) => (
            <g key={i} transform={`translate(${i * 138 + 110}, 0)`}>
              <line x1="0" y1="4" x2="12" y2="4" stroke={color} strokeWidth="2" />
              <text x={16} y={4} dominantBaseline="middle" fill={color} fillOpacity="0.8" fontSize="8" fontFamily="monospace">
                {label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
