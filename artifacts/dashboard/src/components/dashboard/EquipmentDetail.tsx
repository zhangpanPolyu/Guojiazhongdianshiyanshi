import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { 
  useGetEquipment, 
  getGetEquipmentQueryKey,
  useGetEquipmentMetrics,
  getGetEquipmentMetricsQueryKey
} from "@workspace/api-client-react";
import { useEquipmentMetricsHistory } from "@/hooks/useEquipmentMetricsHistory";
import { GlassPanel } from "../ui/glass-panel";
import { StatusBadge } from "../ui/status-badge";
import { X, Calendar, MapPin, Hash, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export function EquipmentDetail() {
  const { selectedEquipmentId, setSelectedEquipmentId, language } = useDashboard();

  const { data: equipment, isLoading: eqLoading } = useGetEquipment(selectedEquipmentId!, {
    query: { enabled: !!selectedEquipmentId, queryKey: getGetEquipmentQueryKey(selectedEquipmentId!), refetchInterval: 8000 }
  });

  const { data: metrics, isLoading: metLoading } = useGetEquipmentMetrics(selectedEquipmentId!, {
    query: { enabled: !!selectedEquipmentId, queryKey: getGetEquipmentMetricsQueryKey(selectedEquipmentId!), refetchInterval: 5000 }
  });

  const { data: metricsHistory } = useEquipmentMetricsHistory(selectedEquipmentId, 8000);

  if (!selectedEquipmentId) return null;

  const primaryHistory = metricsHistory && metricsHistory.length > 0 ? metricsHistory[0] : null;
  const primaryChartData = primaryHistory
    ? primaryHistory.history.map((v, i) => ({ i, value: v }))
    : [];

  return (
    <div className="absolute bottom-4 left-4 right-4 h-64 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300">
      <GlassPanel className="w-full h-full flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] border-t-sci-cyan">
        {eqLoading ? (
          <div className="p-4 h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-sci-cyan border-t-transparent animate-spin" />
          </div>
        ) : equipment ? (
          <div className="flex h-full">
            {/* Info Side */}
            <div className="w-1/3 p-4 border-r border-white/10 flex flex-col gap-4 bg-sci-bg/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {language === 'zh' ? equipment.name : equipment.nameEn}
                  </h3>
                  <span className="text-xs font-mono text-sci-cyan/70">{equipment.id}</span>
                </div>
                <button 
                  onClick={() => setSelectedEquipmentId(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <InfoItem icon={<ActivityIcon />} label={language === 'zh' ? '状态' : 'Status'}>
                  <StatusBadge status={equipment.status} text={equipment.status} />
                </InfoItem>
                <InfoItem icon={<MapPin />} label={language === 'zh' ? '位置' : 'Location'}>
                  {language === 'zh' ? equipment.location : (equipment.locationEn || equipment.location)}
                </InfoItem>
                <InfoItem icon={<Calendar />} label={language === 'zh' ? '上次维护' : 'Last Maint.'}>
                  {new Date(equipment.lastMaintenance).toLocaleDateString()}
                </InfoItem>
                <InfoItem icon={<Hash />} label={language === 'zh' ? '型号' : 'Model'}>
                  {equipment.model || 'N/A'}
                </InfoItem>
              </div>
            </div>

            {/* Metrics Side */}
            <div className="flex-1 p-4 flex flex-col">
              <h4 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-3">
                {language === 'zh' ? '实时遥测数据' : 'Live Telemetry'}
              </h4>
              
              {metLoading ? (
                <div className="flex-1 animate-pulse bg-white/5 rounded-lg" />
              ) : metrics && metrics.length > 0 ? (
                <div className="flex-1 flex gap-4 min-h-0">
                  {/* Live chart for primary metric */}
                  <div className="w-2/3 h-full bg-black/20 rounded-lg p-2 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-pattern" />
                    {primaryChartData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={primaryChartData}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#00F0FF"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={400}
                          />
                          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                          <Tooltip
                            contentStyle={{ background: 'rgba(0,10,20,0.9)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: 4 }}
                            labelStyle={{ display: 'none' }}
                            itemStyle={{ color: '#00F0FF', fontSize: 11 }}
                            formatter={(v: number) => [
                              `${v} ${primaryHistory?.unit ?? ''}`,
                              primaryHistory?.label ?? ''
                            ]}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full border-2 border-sci-cyan border-t-transparent animate-spin" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 text-xs font-mono text-sci-cyan bg-black/50 px-2 rounded">
                      {primaryHistory?.label ?? metrics[0].label} Trend
                    </div>
                    {/* Live pulse dot */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sci-cyan opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-sci-cyan" />
                      </span>
                      <span className="text-[10px] font-mono text-sci-cyan/70">LIVE</span>
                    </div>
                  </div>

                  {/* Metric rows with mini sparklines */}
                  <div className="w-1/3 flex flex-col gap-2 overflow-y-auto">
                    {metrics.slice(0, 4).map((m, i) => {
                      const mHistory = metricsHistory?.find(h => h.key === m.key);
                      const sparkData = mHistory?.history ?? [];
                      return (
                        <MetricRow
                          key={m.key}
                          label={m.label}
                          value={m.value}
                          unit={m.unit}
                          sparklineData={sparkData}
                          index={i}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
                  {language === 'zh' ? '无可用遥测数据' : 'No telemetry data available'}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </GlassPanel>
    </div>
  );
}

function MetricRow({
  label,
  value,
  unit,
  sparklineData,
  index,
}: {
  label: string;
  value: number;
  unit: string;
  sparklineData: number[];
  index: number;
}) {
  const valueKey = String(value);
  return (
    <div className="bg-white/5 px-2 py-1.5 rounded border border-white/5 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-white/50 truncate">{label}</div>
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={valueKey}
              className="font-mono text-sm font-bold text-white tabular-nums"
              initial={{ opacity: 0.4, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] text-white/40 font-mono">{unit}</span>
        </div>
      </div>
      {sparklineData.length >= 2 && (
        <MiniSparkline data={sparklineData} />
      )}
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  const width = 56;
  const height = 20;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2);
  const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2);
  const fillPath = `${pathD} L ${lastX},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className="flex-shrink-0 overflow-visible">
      <path d={fillPath} fill="rgba(0,240,255,0.08)" />
      <motion.path
        key={data.length}
        d={pathD}
        fill="none"
        stroke="rgba(0,240,255,0.8)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <circle cx={lastX} cy={lastY} r={2} fill="rgba(0,240,255,0.9)" />
    </svg>
  );
}

function InfoItem({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-white/40 text-xs">
        <span className="w-3 h-3 flex items-center justify-center [&>svg]:w-3 [&>svg]:h-3">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-sm text-white/90 font-medium truncate">
        {children}
      </div>
    </div>
  );
}

function ActivityIcon() { return <Cpu className="w-3 h-3" />; }
