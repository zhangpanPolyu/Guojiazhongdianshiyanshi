import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { GlassPanel } from "../ui/glass-panel";
import { MetricCard } from "../ui/metric-card";
import {
  useAcknowledgeAlert,
  useGetEnvironmentMetrics,
  getGetEnvironmentMetricsQueryKey,
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import {
  AlertTriangle,
  Info,
  Bell,
  CheckCircle2,
  Thermometer,
  Droplets,
  Activity,
  Zap,
  BarChart3,
  ShieldCheck,
  ServerCrash,
  Wrench,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getGetRecentAlertsQueryKey } from "@workspace/api-client-react";
import { AIAlertsTerminal } from "../dashboard/panels/AIAlertsTerminal";
import { GanttPanel } from "../dashboard/panels/GanttPanel";
import { useEnvironmentHistory } from "@/hooks/useEnvironmentHistory";
import { motion, AnimatePresence } from "framer-motion";

export function RightPanel() {
  const { language, userRole, alerts, alertsLoading, hasNewAlerts, clearNewAlerts, rightPanelTab: activeTab, setRightPanelTab: setActiveTab, } = useDashboard();
  const queryClient = useQueryClient();

  const ackAlert = useAcknowledgeAlert();

  const handleAcknowledge = (id: string) => {
    ackAlert.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRecentAlertsQueryKey() });
      }
    });
  };

  const criticalCount = alerts.filter(a => a.severity === "critical").length;

  const handleRoleTabClick = () => {
    setActiveTab("role");
    clearNewAlerts();
  };

  return (
    <div className="w-80 h-full flex flex-col border-l border-white/10">
      {/* Tab bar */}
      <div className="h-10 flex shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <TabButton
          active={activeTab === "situational"}
          onClick={() => setActiveTab("situational")}
          icon={<Bot className="w-3.5 h-3.5" />}
          label="AI 态势感知"
        />
        <TabButton
          active={activeTab === "role"}
          onClick={handleRoleTabClick}
          icon={<Bell className="w-3.5 h-3.5" />}
          label={language === "zh" ? "角色视图" : "Role View"}
          badge={criticalCount > 0 ? criticalCount : undefined}
          pulseBadge={hasNewAlerts}
        />
      </div>

      {/* Situational awareness tab: AI terminal + Gantt */}
      {activeTab === "situational" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
          <AIAlertsTerminal />
          <GanttPanel />
        </div>
      )}

      {/* Role view tab: alerts + role-specific widget */}
      {activeTab === "role" && (
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* Alerts panel */}
          <GlassPanel className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wider text-white/80 uppercase flex items-center gap-2">
                <Bell className="w-4 h-4 text-sci-amber" />
                {language === "zh" ? "告警中心" : "Alert Center"}
              </h2>
              {alerts.length > 0 && (
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
              ) : alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">{language === "zh" ? "无活动告警" : "No active alerts"}</span>
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 rounded-lg border bg-white/5 flex flex-col gap-2 relative overflow-hidden",
                      alert.severity === "critical" ? "border-sci-red/30" :
                      alert.severity === "warning" ? "border-sci-amber/30" : "border-white/10"
                    )}
                  >
                    {alert.severity === "critical" && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-sci-red shadow-[0_0_10px_var(--sci-red)]" />
                    )}
                    {alert.severity === "warning" && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-sci-amber shadow-[0_0_10px_var(--sci-amber)]" />
                    )}

                    <div className="flex justify-between items-start ml-2">
                      <div className="flex items-center gap-2">
                        {alert.severity === "critical" ? (
                          <AlertTriangle className="w-4 h-4 text-sci-red animate-pulse" />
                        ) : alert.severity === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-sci-amber" />
                        ) : (
                          <Info className="w-4 h-4 text-sci-cyan" />
                        )}
                        <span className="text-xs font-bold text-white/90 truncate max-w-[140px]">
                          {alert.equipmentName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-xs text-white/70 ml-2 line-clamp-2">
                      {language === "zh" ? alert.message : alert.messageEn}
                    </div>

                    {userRole !== "operator" && (
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={ackAlert.isPending}
                          className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors border border-white/10 hover:border-sci-cyan/50 hover:text-sci-cyan"
                        >
                          {language === "zh" ? "确认" : "Acknowledge"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassPanel>

          {/* Role-configurable widget */}
          {userRole === "operator" && <OperatorWidget language={language} />}
          {userRole === "engineer" && <EngineerWidget language={language} />}
          {userRole === "manager" && <ManagerWidget language={language} />}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
  pulseBadge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  pulseBadge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide relative transition-colors",
        active ? "text-sci-cyan" : "text-white/45 hover:text-white/70"
      )}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className={cn(
          "bg-sci-red/25 text-sci-red text-[9px] px-1 py-px rounded-full font-mono border border-sci-red/30 leading-tight",
          pulseBadge && "animate-pulse"
        )}>
          {badge}
        </span>
      )}
      {pulseBadge && badge === undefined && (
        <span className="absolute top-1 right-4 w-1.5 h-1.5 rounded-full bg-sci-red animate-ping" />
      )}
      {active && (
        <div className="absolute bottom-0 left-2 right-2 h-px bg-sci-cyan shadow-[0_0_6px_var(--sci-cyan)]" />
      )}
    </button>
  );
}

function OperatorWidget({ language }: { language: string }) {
  const { data: env, isLoading } = useGetEnvironmentMetrics({
    query: { queryKey: getGetEnvironmentMetricsQueryKey(), refetchInterval: 5000 }
  });

  const { data: history } = useEnvironmentHistory(5000);

  const tempHistory = history?.map(r => r.temperature);
  const humidityHistory = history?.map(r => r.humidity);
  const vibrationHistory = history?.map(r => r.vibration);
  const powerHistory = history?.map(r => r.power);

  return (
    <GlassPanel className="h-[280px] p-4 flex flex-col gap-3 shrink-0">
      <h3 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-1 flex items-center gap-2">
        <Thermometer className="w-3.5 h-3.5 text-sci-cyan" />
        {language === "zh" ? "环境监测" : "Environment"}
      </h3>

      {isLoading || !env ? (
        <div className="flex-1 grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 flex-1">
          <MetricCard
            title={language === "zh" ? "温度" : "Temp"}
            value={env.temperature.toFixed(1)}
            unit="°C"
            status={env.temperature > 28 ? "warning" : "normal"}
            icon={<Thermometer />}
            className="p-3"
            sparklineData={tempHistory}
          />
          <MetricCard
            title={language === "zh" ? "湿度" : "Humidity"}
            value={env.humidity.toFixed(1)}
            unit="%"
            status={env.humidity > 60 || env.humidity < 30 ? "warning" : "normal"}
            icon={<Droplets />}
            className="p-3"
            sparklineData={humidityHistory}
          />
          <MetricCard
            title={language === "zh" ? "振动" : "Vibration"}
            value={env.vibration.toFixed(2)}
            unit="mm/s"
            status={env.vibration > 2.0 ? "critical" : "normal"}
            icon={<Activity />}
            className="p-3"
            sparklineData={vibrationHistory}
          />
          <MetricCard
            title={language === "zh" ? "功耗" : "Power"}
            value={env.power.toFixed(1)}
            unit="kW"
            status="normal"
            icon={<Zap />}
            className="p-3"
            sparklineData={powerHistory}
          />
        </div>
      )}
    </GlassPanel>
  );
}

function EngineerWidget({ language }: { language: string }) {
  const { data: env, isLoading } = useGetEnvironmentMetrics({
    query: { queryKey: getGetEnvironmentMetricsQueryKey(), refetchInterval: 5000 }
  });

  return (
    <GlassPanel className="h-[280px] p-4 flex flex-col gap-3 shrink-0">
      <h3 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-1 flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-sci-cyan" />
        {language === "zh" ? "技术参数" : "Technical Parameters"}
      </h3>

      {isLoading || !env ? (
        <div className="flex-1 bg-white/5 animate-pulse rounded-lg" />
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          <ParameterRow
            label={language === "zh" ? "实验室温度" : "Lab Temperature"}
            value={`${env.temperature.toFixed(2)} °C`}
            threshold={language === "zh" ? "阈值: 28°C" : "Threshold: 28°C"}
            pct={Math.min(100, (env.temperature / 35) * 100)}
            color={env.temperature > 28 ? "bg-sci-amber" : "bg-sci-cyan"}
          />
          <ParameterRow
            label={language === "zh" ? "相对湿度" : "Relative Humidity"}
            value={`${env.humidity.toFixed(1)} %`}
            threshold={language === "zh" ? "阈值: 30–60%" : "Threshold: 30–60%"}
            pct={env.humidity}
            color={env.humidity > 60 || env.humidity < 30 ? "bg-sci-amber" : "bg-sci-green"}
          />
          <ParameterRow
            label={language === "zh" ? "地板振动" : "Floor Vibration"}
            value={`${env.vibration.toFixed(3)} mm/s`}
            threshold={language === "zh" ? "阈值: 2.0 mm/s" : "Threshold: 2.0 mm/s"}
            pct={Math.min(100, (env.vibration / 5) * 100)}
            color={env.vibration > 2.0 ? "bg-sci-red" : "bg-sci-green"}
          />
          <ParameterRow
            label={language === "zh" ? "系统总功耗" : "System Power Draw"}
            value={`${env.power.toFixed(1)} kW`}
            threshold={language === "zh" ? "容量: 200 kW" : "Capacity: 200 kW"}
            pct={Math.min(100, (env.power / 200) * 100)}
            color="bg-sci-cyan"
          />
        </div>
      )}
    </GlassPanel>
  );
}

function ParameterRow({ label, value, threshold, pct, color }: {
  label: string;
  value: string;
  threshold: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-white/60">{label}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            className="text-xs font-mono text-white/90 font-bold"
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          animate={{ width: `${Math.max(2, pct)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="text-[10px] text-white/30 font-mono">{threshold}</div>
    </div>
  );
}

function ManagerWidget({ language }: { language: string }) {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 5000 }
  });

  return (
    <GlassPanel className="h-[280px] p-4 flex flex-col gap-3 shrink-0">
      <h3 className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-1 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-sci-cyan" />
        {language === "zh" ? "管理概览" : "Management Overview"}
      </h3>

      {isLoading || !summary ? (
        <div className="flex-1 bg-white/5 animate-pulse rounded-lg" />
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
              {language === "zh" ? "系统健康度" : "System Health"}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={summary.healthScore.toFixed(1)}
                className={cn(
                  "text-3xl font-bold font-mono",
                  summary.healthScore >= 80 ? "text-sci-green" :
                  summary.healthScore >= 60 ? "text-sci-amber" : "text-sci-red"
                )}
                initial={{ opacity: 0.4, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {summary.healthScore.toFixed(1)}
                <span className="text-sm text-white/50 ml-1">%</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <KpiTile
              label={language === "zh" ? "运行中" : "Running"}
              value={summary.runningCount}
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="text-sci-green"
            />
            <KpiTile
              label={language === "zh" ? "警告" : "Warning"}
              value={summary.warningCount}
              icon={<AlertTriangle className="w-4 h-4" />}
              color="text-sci-amber"
            />
            <KpiTile
              label={language === "zh" ? "故障" : "Fault"}
              value={summary.faultCount}
              icon={<ServerCrash className="w-4 h-4" />}
              color="text-sci-red"
            />
            <KpiTile
              label={language === "zh" ? "维护中" : "Maintenance"}
              value={summary.maintenanceCount}
              icon={<Wrench className="w-4 h-4" />}
              color="text-white/60"
            />
          </div>

          <div className={cn(
            "rounded-lg p-2.5 border flex items-center gap-2",
            summary.criticalAlerts > 0
              ? "bg-sci-red/10 border-sci-red/30"
              : "bg-sci-green/10 border-sci-green/30"
          )}>
            <AlertTriangle className={cn(
              "w-4 h-4 shrink-0",
              summary.criticalAlerts > 0 ? "text-sci-red animate-pulse" : "text-sci-green"
            )} />
            <div>
              <div className={cn(
                "text-xs font-bold",
                summary.criticalAlerts > 0 ? "text-sci-red" : "text-sci-green"
              )}>
                {summary.criticalAlerts > 0
                  ? `${summary.criticalAlerts} ${language === "zh" ? "条紧急告警" : "Critical Alerts"}`
                  : language === "zh" ? "无紧急告警" : "No Critical Alerts"
                }
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">
                {language === "zh"
                  ? `共 ${summary.activeAlerts} 条活跃告警`
                  : `${summary.activeAlerts} active alerts total`
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}

function KpiTile({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 flex items-center gap-2">
      <span className={cn("shrink-0", color)}>{icon}</span>
      <div>
        <div className={cn("text-lg font-bold font-mono leading-none", color)}>{value}</div>
        <div className="text-[10px] text-white/40 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
