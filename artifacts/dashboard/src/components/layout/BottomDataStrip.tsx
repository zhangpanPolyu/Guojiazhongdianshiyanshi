import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetEnvironmentMetrics, getGetEnvironmentMetricsQueryKey } from "@workspace/api-client-react";

export function BottomDataStrip() {
  const { language } = useDashboard();
  
  const { data: summary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 30000 }
  });

  const { data: env } = useGetEnvironmentMetrics({
    query: { queryKey: getGetEnvironmentMetricsQueryKey(), refetchInterval: 30000 }
  });

  if (!summary || !env) return <div className="h-20 border-t border-white/10 bg-sci-bg/90 backdrop-blur-md" />;

  const metrics = [
    { label: language === 'zh' ? '设备总数' : 'Total Equipment', value: summary.totalEquipment, color: 'text-white' },
    { label: language === 'zh' ? '运行中' : 'Running', value: summary.runningCount, color: 'text-sci-green' },
    { label: language === 'zh' ? '故障' : 'Faults', value: summary.faultCount, color: 'text-sci-red' },
    { label: language === 'zh' ? '活动告警' : 'Active Alerts', value: summary.activeAlerts, color: 'text-sci-amber' },
    { label: language === 'zh' ? '环境温度' : 'Avg Temp', value: `${env.temperature.toFixed(1)}°C`, color: 'text-white' },
    { label: language === 'zh' ? '平均湿度' : 'Avg Humidity', value: `${env.humidity.toFixed(1)}%`, color: 'text-white' },
    { label: language === 'zh' ? '总功耗' : 'Total Power', value: `${env.power.toFixed(1)}kW`, color: 'text-sci-cyan' },
  ];

  return (
    <div className="h-20 border-t border-white/10 bg-sci-bg/95 backdrop-blur-md overflow-hidden flex items-center relative z-50">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-sci-bg to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-sci-bg to-transparent z-10" />
      
      <div className="flex animate-ticker-scroll whitespace-nowrap">
        {/* Render twice for continuous looping */}
        {[...metrics, ...metrics].map((metric, i) => (
          <div key={i} className="flex items-center mx-8">
            <span className="text-xs text-white/50 uppercase tracking-widest mr-3">
              {metric.label}
            </span>
            <span className={`font-mono text-lg font-bold ${metric.color}`}>
              {metric.value}
            </span>
            <span className="text-sci-cyan/30 text-xs ml-16">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
