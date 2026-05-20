import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { GlassPanel } from "../ui/glass-panel";
import { MetricCard } from "../ui/metric-card";
import { useGetRecentAlerts, getGetRecentAlertsQueryKey, useAcknowledgeAlert, useGetEnvironmentMetrics, getGetEnvironmentMetricsQueryKey } from "@workspace/api-client-react";
import { AlertTriangle, Info, Bell, CheckCircle2, Thermometer, Droplets, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export function RightPanel() {
  const { language } = useDashboard();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading: alertsLoading } = useGetRecentAlerts({
    query: { queryKey: getGetRecentAlertsQueryKey(), refetchInterval: 30000 }
  });

  const { data: env, isLoading: envLoading } = useGetEnvironmentMetrics({
    query: { queryKey: getGetEnvironmentMetricsQueryKey(), refetchInterval: 30000 }
  });

  const ackAlert = useAcknowledgeAlert();

  const handleAcknowledge = (id: string) => {
    ackAlert.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRecentAlertsQueryKey() });
      }
    });
  };

  return (
    <div className="w-80 h-full p-4 flex flex-col gap-4 border-l border-white/10">
      <GlassPanel className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider text-white/80 uppercase flex items-center gap-2">
            <Bell className="w-4 h-4 text-sci-amber" />
            {language === 'zh' ? '告警中心' : 'Alert Center'}
          </h2>
          {alerts && alerts.length > 0 && (
            <span className="bg-sci-red/20 text-sci-red text-xs px-2 py-0.5 rounded-full font-mono border border-sci-red/30">
              {alerts.length}
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
          {alertsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 animate-pulse rounded-lg" />
            ))
          ) : alerts?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/40">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm">{language === 'zh' ? '无活动告警' : 'No active alerts'}</span>
            </div>
          ) : (
            alerts?.map(alert => (
              <div 
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border bg-white/5 flex flex-col gap-2 relative overflow-hidden group",
                  alert.severity === 'critical' ? 'border-sci-red/30' : 
                  alert.severity === 'warning' ? 'border-sci-amber/30' : 'border-white/10'
                )}
              >
                {alert.severity === 'critical' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sci-red shadow-[0_0_10px_var(--sci-red)]" />
                )}
                {alert.severity === 'warning' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sci-amber shadow-[0_0_10px_var(--sci-amber)]" />
                )}
                
                <div className="flex justify-between items-start ml-2">
                  <div className="flex items-center gap-2">
                    {alert.severity === 'critical' ? (
                      <AlertTriangle className="w-4 h-4 text-sci-red animate-pulse-danger" />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-sci-amber" />
                    ) : (
                      <Info className="w-4 h-4 text-sci-cyan" />
                    )}
                    <span className="text-xs font-bold text-white/90 truncate max-w-[140px]">
                      {alert.equipmentName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="text-xs text-white/70 ml-2 line-clamp-2">
                  {language === 'zh' ? alert.message : alert.messageEn}
                </div>
                
                <div className="flex justify-end mt-1">
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={ackAlert.isPending}
                    className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors border border-white/10 hover:border-sci-cyan/50 hover:text-sci-cyan"
                  >
                    {language === 'zh' ? '确认' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="h-[340px] p-4 flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-1">
          {language === 'zh' ? '环境监测' : 'Environment'}
        </h3>
        
        {envLoading || !env ? (
          <div className="flex-1 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 flex-1">
            <MetricCard 
              title={language === 'zh' ? '温度' : 'Temp'}
              value={env.temperature.toFixed(1)}
              unit="°C"
              status={env.temperature > 28 ? 'warning' : 'normal'}
              icon={<Thermometer />}
              className="p-3"
            />
            <MetricCard 
              title={language === 'zh' ? '湿度' : 'Humidity'}
              value={env.humidity.toFixed(1)}
              unit="%"
              status={env.humidity > 60 || env.humidity < 30 ? 'warning' : 'normal'}
              icon={<Droplets />}
              className="p-3"
            />
            <MetricCard 
              title={language === 'zh' ? '振动' : 'Vibration'}
              value={env.vibration.toFixed(2)}
              unit="mm/s"
              status={env.vibration > 2.0 ? 'critical' : 'normal'}
              icon={<Activity />}
              className="p-3"
            />
            <MetricCard 
              title={language === 'zh' ? '功耗' : 'Power'}
              value={env.power.toFixed(1)}
              unit="kW"
              status="normal"
              icon={<Zap />}
              className="p-3"
            />
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
