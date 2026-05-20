import React, { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Globe, UserCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopStatusBar() {
  const { language, setLanguage, userRole, setUserRole } = useDashboard();
  const [time, setTime] = useState(new Date());

  const { data: summary } = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey(),
      refetchInterval: 30000
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  return (
    <header className="h-14 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between px-6 relative z-50">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-sci-cyan font-mono font-bold tracking-wider text-lg glow-text-cyan flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {language === 'zh' ? '数智孪生设备管理平台' : 'Digital Twin Equipment Platform'}
          </h1>
          <span className="text-[10px] text-white/50 uppercase tracking-widest">
            {language === 'zh' ? '深圳大学土木工程国家重点实验室' : 'National Key Lab of Civil Engineering, SZU'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {summary && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {summary.healthScore > 80 ? (
              <ShieldCheck className="w-4 h-4 text-sci-green" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-sci-amber" />
            )}
            <span className="text-xs text-white/70">
              {language === 'zh' ? '系统健康度' : 'Sys Health'}
            </span>
            <span className={cn(
              "font-mono font-bold text-sm",
              summary.healthScore > 80 ? "text-sci-green" : "text-sci-amber"
            )}>
              {summary.healthScore}%
            </span>
          </div>
        )}

        <div className="flex flex-col items-end">
          <span className="font-mono text-white text-lg leading-tight">{formatTime(time)}</span>
          <span className="font-mono text-[10px] text-white/50">{formatDate(time)}</span>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6">
          <div className="w-2 h-2 rounded-full bg-sci-green shadow-[0_0_8px_var(--sci-green)] animate-pulse" />
          <span className="text-sci-green text-xs font-mono tracking-wider">
            {language === 'zh' ? '在线' : 'ONLINE'}
          </span>
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <select 
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as any)}
            className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-sci-cyan font-sans outline-none"
            data-testid="select-role"
          >
            <option value="operator" className="bg-sci-bg">{language === 'zh' ? '操作员' : 'Operator'}</option>
            <option value="engineer" className="bg-sci-bg">{language === 'zh' ? '工程师' : 'Engineer'}</option>
            <option value="manager" className="bg-sci-bg">{language === 'zh' ? '管理员' : 'Manager'}</option>
          </select>

          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold text-sci-cyan border border-sci-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            data-testid="btn-toggle-lang"
          >
            {language === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>
    </header>
  );
}
