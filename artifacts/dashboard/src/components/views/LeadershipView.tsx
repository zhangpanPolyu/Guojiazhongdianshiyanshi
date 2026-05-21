import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, TrendingUp, Layers, Users,
} from "lucide-react";
import {
  ResponsiveContainer, Treemap, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell,
} from "recharts";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const ASSET_DATA = [
  {
    name: "资产分布",
    children: [
      { name: "结构实验室",     size: 3850, value: "3850万" },
      { name: "岩土科研实验室", size: 2960, value: "2960万" },
      { name: "BIM实验室",      size: 1840, value: "1840万" },
      { name: "材料实验室",     size: 2120, value: "2120万" },
      { name: "综合测试区",     size: 1430, value: "1430万" },
    ],
  },
];

const UTILISATION_DATA = [
  { name: "岩土工程课题组", rate: 94.2 },
  { name: "结构健康监测组", rate: 88.5 },
  { name: "BIM协同研究组",  rate: 82.1 },
  { name: "材料耐久性课题", rate: 76.8 },
  { name: "地下工程研究组", rate: 71.3 },
  { name: "智慧运维实验室", rate: 65.0 },
  { name: "防灾减灾课题组", rate: 58.4 },
].sort((a, b) => b.rate - a.rate);

const TREE_COLORS = ["#00F0FF", "#00CC88", "#0099DD", "#66AAFF", "#44DDCC"];

const BAR_COLOR = (rate: number) =>
  rate >= 85 ? "#00F0FF" : rate >= 70 ? "#00FF66" : "#FFB800";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, decimals = 0, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 60;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + inc, target);
      setValue(parseFloat(current.toFixed(decimals)));
      if (current >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, decimals, duration]);
  return value;
}

// ─── Treemap content ──────────────────────────────────────────────────────────

function TreeCell(props: any) {
  const { x, y, width, height, name, value, index } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect
        x={x + 1} y={y + 1}
        width={width - 2} height={height - 2}
        style={{
          fill: TREE_COLORS[index % TREE_COLORS.length],
          fillOpacity: 0.18,
          stroke: TREE_COLORS[index % TREE_COLORS.length],
          strokeOpacity: 0.5,
          strokeWidth: 1,
        }}
        rx={4}
      />
      {width > 60 && height > 30 && (
        <>
          <text x={x + 8} y={y + 18} fill="rgba(255,255,255,0.85)" fontSize={11} fontWeight={600}>
            {name}
          </text>
          <text x={x + 8} y={y + 32} fill="rgba(255,255,255,0.45)" fontSize={9}>
            ¥{value?.value ?? ""}
          </text>
        </>
      )}
    </g>
  );
}

// ─── Custom bar tooltip ───────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#050814] border border-sci-cyan/20 rounded-lg px-3 py-2 text-xs">
      <div className="text-white/70 mb-1">{d.name}</div>
      <div className="text-sci-cyan font-mono font-bold">{d.rate}%</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeadershipView() {
  const shareRate = useCountUp(87.5, 1);
  const machineHours = useCountUp(1240, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full h-full overflow-y-auto scrollbar-hide p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-sci-cyan/10 border border-sci-cyan/20 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-sci-cyan" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white/90 tracking-wide">领导决策中心</h1>
          <p className="text-[11px] text-white/40">核心KPI · 资产分布 · 设备稼动率排行</p>
        </div>
        <div className="ml-auto text-[11px] text-white/30 font-mono">
          数据周期: 2026 Q2
        </div>
      </div>

      {/* ── KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: "设备开放共享率",
            val: shareRate,
            unit: "%",
            icon: <TrendingUp className="w-4 h-4" />,
            color: "text-sci-cyan",
            border: "border-t-sci-cyan",
            glow: "shadow-[0_-2px_12px_rgba(0,240,255,0.2)]",
          },
          {
            label: "年均有效机时",
            val: machineHours,
            unit: "h",
            icon: <Layers className="w-4 h-4" />,
            color: "text-sci-green",
            border: "border-t-sci-green",
            glow: "shadow-[0_-2px_12px_rgba(0,255,102,0.2)]",
          },
          {
            label: "在线设备数量",
            val: 10,
            unit: "台",
            icon: <BarChart2 className="w-4 h-4" />,
            color: "text-sci-amber",
            border: "border-t-sci-amber",
            glow: "shadow-[0_-2px_12px_rgba(255,184,0,0.2)]",
          },
          {
            label: "活跃课题组",
            val: 7,
            unit: "组",
            icon: <Users className="w-4 h-4" />,
            color: "text-white/70",
            border: "border-t-white/40",
            glow: "",
          },
        ].map((kpi) => (
          <GlassPanel
            key={kpi.label}
            className={cn("p-4 border-t-2", kpi.border, kpi.glow)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-white/50 font-medium">{kpi.label}</span>
              <span className={cn("opacity-50", kpi.color)}>{kpi.icon}</span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className={cn("text-3xl font-mono font-bold tabular-nums tracking-tight", kpi.color)}>
                {kpi.val}
              </span>
              <span className="text-sm text-white/40 font-mono mb-1">{kpi.unit}</span>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* ── 资产分布树状图 */}
        <div className="col-span-12 lg:col-span-5">
          <GlassPanel className="p-4 h-[320px] flex flex-col">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-sci-cyan" />
              资产分布图
              <span className="ml-auto text-[10px] text-white/30 normal-case tracking-normal font-normal">单位: 万元</span>
            </h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={ASSET_DATA[0].children}
                  dataKey="size"
                  content={<TreeCell />}
                  aspectRatio={4 / 3}
                />
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </div>

        {/* ── 稼动率排行 */}
        <div className="col-span-12 lg:col-span-7">
          <GlassPanel className="p-4 h-[320px] flex flex-col">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-sci-cyan" />
              课题组设备稼动率排行
              <span className="ml-auto text-[10px] text-white/30 normal-case tracking-normal font-normal">本季度</span>
            </h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={UTILISATION_DATA}
                  layout="vertical"
                  margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
                  barSize={12}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {UTILISATION_DATA.map((d, i) => (
                      <Cell key={i} fill={BAR_COLOR(d.rate)} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </div>

        {/* ── Bottom detail table */}
        <div className="col-span-12">
          <GlassPanel className="p-4">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-sci-cyan" />
              设备调配建议
            </h2>
            <div className="space-y-2">
              {[
                { device: "大型离心机 (EQ001)", usage: "98%", suggestion: "建议新增同型号设备或协调跨组共享时间窗", level: "high" },
                { device: "MTS多功能试验台 (EQ002)", usage: "85%", suggestion: "当前负荷较高，建议限制单次预约时长至4小时", level: "mid" },
                { device: "动态信号分析仪 (EQ006)", usage: "41%", suggestion: "利用率偏低，建议向相邻院系开放共享", level: "low" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                  <span className="text-xs font-medium text-white/80 w-48 shrink-0">{row.device}</span>
                  <span className={cn(
                    "text-xs font-mono font-bold w-12 shrink-0",
                    row.level === "high" ? "text-sci-red" : row.level === "mid" ? "text-sci-amber" : "text-sci-green"
                  )}>
                    {row.usage}
                  </span>
                  <span className="text-[11px] text-white/45 flex-1">{row.suggestion}</span>
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded border font-semibold shrink-0",
                    row.level === "high"
                      ? "bg-sci-red/10 text-sci-red border-sci-red/25"
                      : row.level === "mid"
                      ? "bg-sci-amber/10 text-sci-amber border-sci-amber/25"
                      : "bg-sci-green/10 text-sci-green border-sci-green/25"
                  )}>
                    {row.level === "high" ? "紧急" : row.level === "mid" ? "建议" : "优化"}
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
