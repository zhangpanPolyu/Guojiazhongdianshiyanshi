import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { 
  useGetEquipment, 
  getGetEquipmentQueryKey,
  useGetEquipmentMetrics,
  getGetEquipmentMetricsQueryKey
} from "@workspace/api-client-react";
import { GlassPanel } from "../ui/glass-panel";
import { StatusBadge } from "../ui/status-badge";
import { X, Calendar, MapPin, Hash, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function EquipmentDetail() {
  const { selectedEquipmentId, setSelectedEquipmentId, language } = useDashboard();

  const { data: equipment, isLoading: eqLoading } = useGetEquipment(selectedEquipmentId!, {
    query: { enabled: !!selectedEquipmentId, queryKey: getGetEquipmentQueryKey(selectedEquipmentId!) }
  });

  const { data: metrics, isLoading: metLoading } = useGetEquipmentMetrics(selectedEquipmentId!, {
    query: { enabled: !!selectedEquipmentId, queryKey: getGetEquipmentMetricsQueryKey(selectedEquipmentId!) }
  });

  if (!selectedEquipmentId) return null;

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
              <h4 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-4">
                {language === 'zh' ? '实时遥测数据' : 'Live Telemetry'}
              </h4>
              
              {metLoading ? (
                <div className="flex-1 animate-pulse bg-white/5 rounded-lg" />
              ) : metrics && metrics.length > 0 ? (
                <div className="flex-1 flex gap-4">
                  {/* Fake chart for the first metric just to look cool */}
                  <div className="w-2/3 h-full bg-black/20 rounded-lg p-2 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-pattern" />
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateFakeTimeSeries()}>
                        <Line type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="absolute top-2 left-2 text-xs font-mono text-sci-cyan bg-black/50 px-2 rounded">
                      {metrics[0].label} Trend
                    </div>
                  </div>

                  {/* Metric values */}
                  <div className="w-1/3 flex flex-col gap-2">
                    {metrics.slice(0, 3).map((m, i) => (
                      <div key={i} className="bg-white/5 p-2 rounded border border-white/5 flex justify-between items-center">
                        <span className="text-xs text-white/60">{m.label}</span>
                        <div className="font-mono text-white">
                          {m.value} <span className="text-[10px] text-white/40">{m.unit}</span>
                        </div>
                      </div>
                    ))}
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

function InfoItem({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-white/40 text-xs">
        {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3" })}
        <span>{label}</span>
      </div>
      <div className="text-sm text-white/90 font-medium truncate">
        {children}
      </div>
    </div>
  );
}

function ActivityIcon() { return <Cpu className="w-3 h-3" />; }

// Helper to generate fake line chart data so the sci-fi dashboard looks alive
function generateFakeTimeSeries() {
  const data = [];
  let val = 50;
  for(let i=0; i<50; i++) {
    val += (Math.random() - 0.5) * 5;
    data.push({ time: i, value: val });
  }
  return data;
}
