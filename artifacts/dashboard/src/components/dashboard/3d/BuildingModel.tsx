import React, { useMemo } from "react";
import {
  useListEquipment,
  getListEquipmentQueryKey,
} from "@workspace/api-client-react";
import { useDashboard } from "@/context/DashboardContext";

const FLOOR_COUNT = 5;
const FLOOR_H = 80;
const BLDG_LEFT = 120;
const BLDG_RIGHT = 660;
const BLDG_TOP = 60;
const BLDG_W = BLDG_RIGHT - BLDG_LEFT;

function floorY(floor: number) {
  return BLDG_TOP + (FLOOR_COUNT - floor) * FLOOR_H;
}

const STATUS_COLOR: Record<string, string> = {
  running: "#00FF66",
  warning: "#FFB800",
  fault: "#FF003C",
  maintenance: "#A080FF",
  offline: "#607090",
};

const FLOOR_PLACEMENT: Record<string, { floor: number; xFrac: number }> = {
  EQ001: { floor: 3, xFrac: 0.42 },
  EQ002: { floor: 2, xFrac: 0.28 },
  EQ003: { floor: 0, xFrac: 0.38 },
  EQ004: { floor: 1, xFrac: 0.60 },
  EQ005: { floor: 1, xFrac: 0.22 },
  EQ006: { floor: 2, xFrac: 0.68 },
  EQ007: { floor: 0, xFrac: 0.55 },
  EQ008: { floor: 0, xFrac: 0.72 },
  EQ009: { floor: 2, xFrac: 0.84 },
  EQ010: { floor: 0, xFrac: 0.20 },
  EQ011: { floor: 3, xFrac: 0.75 },
  EQ012: { floor: 4, xFrac: 0.50 },
};

const FLOOR_LABELS = ["B1·Lab", "1F·Control", "2F·Lab B", "3F·Zone A", "4F·Roof"];

export function BuildingModel() {
  const { selectedEquipmentId, setSelectedEquipmentId, language } = useDashboard();

  const { data: equipment = [] } = useListEquipment(undefined, {
    query: { queryKey: getListEquipmentQueryKey() },
  });

  const equipMap = useMemo(
    () => Object.fromEntries(equipment.map((e) => [e.id, e])),
    [equipment]
  );

  const viewH = BLDG_TOP + FLOOR_COUNT * FLOOR_H + 60;
  const viewW = 800;

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center bg-transparent select-none">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full h-full"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      >
        <defs>
          <filter id="glow-node">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="bldg-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.06" />
          </linearGradient>
          <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#00F0FF" strokeWidth="0.4" strokeOpacity="0.15" />
          </pattern>
        </defs>

        {/* building body fill */}
        <rect
          x={BLDG_LEFT}
          y={BLDG_TOP}
          width={BLDG_W}
          height={FLOOR_COUNT * FLOOR_H}
          fill="url(#bldg-grad)"
          stroke="#00F0FF"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* floor slabs */}
        {Array.from({ length: FLOOR_COUNT + 1 }).map((_, i) => {
          const y = BLDG_TOP + i * FLOOR_H;
          return (
            <line
              key={i}
              x1={BLDG_LEFT}
              y1={y}
              x2={BLDG_RIGHT}
              y2={y}
              stroke="#00F0FF"
              strokeWidth={i === 0 || i === FLOOR_COUNT ? 2 : 0.8}
              strokeOpacity={i === 0 || i === FLOOR_COUNT ? 0.8 : 0.35}
              strokeDasharray={i === 0 || i === FLOOR_COUNT ? "none" : "6 4"}
            />
          );
        })}

        {/* structural columns */}
        {[0.12, 0.35, 0.65, 0.88].map((xf, ci) => {
          const x = BLDG_LEFT + xf * BLDG_W;
          return (
            <line
              key={ci}
              x1={x}
              y1={BLDG_TOP}
              x2={x}
              y2={BLDG_TOP + FLOOR_COUNT * FLOOR_H}
              stroke="#00F0FF"
              strokeWidth="1"
              strokeOpacity="0.2"
              strokeDasharray="3 5"
            />
          );
        })}

        {/* central core */}
        <rect
          x={BLDG_LEFT + BLDG_W * 0.44}
          y={BLDG_TOP}
          width={BLDG_W * 0.12}
          height={FLOOR_COUNT * FLOOR_H}
          fill="url(#hatch)"
          stroke="#00F0FF"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        <text
          x={BLDG_LEFT + BLDG_W * 0.50}
          y={BLDG_TOP + FLOOR_COUNT * FLOOR_H * 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#00F0FF"
          fillOpacity="0.35"
          fontSize="8"
          fontFamily="monospace"
          transform={`rotate(-90, ${BLDG_LEFT + BLDG_W * 0.50}, ${BLDG_TOP + FLOOR_COUNT * FLOOR_H * 0.5})`}
        >
          CORE
        </text>

        {/* floor labels on left */}
        {FLOOR_LABELS.map((label, i) => {
          const floor = i;
          const y = floorY(floor) + FLOOR_H / 2;
          return (
            <g key={i}>
              <text
                x={BLDG_LEFT - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#00F0FF"
                fillOpacity="0.7"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {label}
              </text>
              <line
                x1={BLDG_LEFT - 6}
                y1={y}
                x2={BLDG_LEFT}
                y2={y}
                stroke="#00F0FF"
                strokeWidth="0.8"
                strokeOpacity="0.5"
              />
            </g>
          );
        })}

        {/* elevation markers on right */}
        {Array.from({ length: FLOOR_COUNT + 1 }).map((_, i) => {
          const y = BLDG_TOP + i * FLOOR_H;
          const elevation = (FLOOR_COUNT - i) * 4;
          return (
            <text
              key={i}
              x={BLDG_RIGHT + 8}
              y={y}
              dominantBaseline="middle"
              fill="#00F0FF"
              fillOpacity="0.4"
              fontSize="8"
              fontFamily="monospace"
            >
              +{elevation}m
            </text>
          );
        })}

        {/* building label */}
        <text
          x={BLDG_LEFT + BLDG_W / 2}
          y={BLDG_TOP - 12}
          textAnchor="middle"
          fill="#00F0FF"
          fillOpacity="0.9"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="700"
          letterSpacing="3"
        >
          BUILDING WIREFRAME — SENSOR PLACEMENT DIAGRAM
        </text>

        {/* equipment sensor nodes */}
        {equipment.map((eq) => {
          const placement = FLOOR_PLACEMENT[eq.id];
          if (!placement) return null;
          const cx = BLDG_LEFT + placement.xFrac * BLDG_W;
          const cy = floorY(placement.floor) + FLOOR_H / 2;
          const color = STATUS_COLOR[eq.status] ?? "#00F0FF";
          const isSelected = selectedEquipmentId === eq.id;
          const label = language === "zh" ? eq.name : eq.nameEn;
          const shortLabel = label.length > 14 ? label.slice(0, 13) + "…" : label;

          return (
            <g
              key={eq.id}
              onClick={() =>
                setSelectedEquipmentId(isSelected ? null : eq.id)
              }
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={label}
            >
              {/* glow ring when selected */}
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={20}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                  filter="url(#glow-node)"
                >
                  <animate
                    attributeName="r"
                    values="16;24;16"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="0.6;0.1;0.6"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* outer ring */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 10 : 7}
                fill="rgba(0,0,0,0.7)"
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter={isSelected ? "url(#glow-node)" : undefined}
              />

              {/* inner dot */}
              <circle cx={cx} cy={cy} r={isSelected ? 4 : 3} fill={color} />

              {/* connector line to label */}
              <line
                x1={cx}
                y1={cy - (isSelected ? 10 : 7)}
                x2={cx}
                y2={cy - 18}
                stroke={color}
                strokeWidth="0.8"
                strokeOpacity="0.6"
              />

              {/* label background */}
              <rect
                x={cx - 36}
                y={cy - 35}
                width={72}
                height={14}
                rx={3}
                fill={isSelected ? color : "rgba(0,5,20,0.85)"}
                stroke={color}
                strokeWidth="0.5"
                strokeOpacity={isSelected ? 1 : 0.4}
              />

              {/* label text */}
              <text
                x={cx}
                y={cy - 27}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? "#000" : color}
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight={isSelected ? "700" : "400"}
              >
                {shortLabel}
              </text>

              {/* ID badge */}
              <text
                x={cx}
                y={cy + (isSelected ? 10 : 7) + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize="6.5"
                fontFamily="monospace"
                fontWeight="600"
                fillOpacity="0.8"
              >
                {eq.id}
              </text>
            </g>
          );
        })}

        {/* legend */}
        {Object.entries(STATUS_COLOR).map(([status, color], i) => (
          <g key={status} transform={`translate(${BLDG_LEFT + i * 110}, ${viewH - 22})`}>
            <circle cx={6} cy={6} r={5} fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx={6} cy={6} r={2.5} fill={color} />
            <text x={15} y={6} dominantBaseline="middle" fill={color} fillOpacity="0.8" fontSize="9" fontFamily="monospace">
              {status}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
