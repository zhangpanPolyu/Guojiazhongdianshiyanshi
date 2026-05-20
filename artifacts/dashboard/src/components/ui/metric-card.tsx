import React from "react";
import { cn } from "@/lib/utils";
import { MetricTrend } from "@/types";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { GlassPanel } from "./glass-panel";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: MetricTrend | null;
  status?: 'normal' | 'warning' | 'critical';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  status = 'normal',
  icon,
  className
}: MetricCardProps) {
  
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return 'border-t-sci-amber shadow-[0_-2px_10px_rgba(255,184,0,0.2)]';
      case 'critical': return 'border-t-sci-red shadow-[0_-2px_15px_rgba(255,0,60,0.3)]';
      default: return 'border-t-sci-cyan shadow-[0_-2px_10px_rgba(0,240,255,0.1)]';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <ArrowUp className="w-3 h-3 text-sci-green" />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3 text-sci-red" />;
    return <Minus className="w-3 h-3 text-gray-500" />;
  };

  return (
    <GlassPanel 
      className={cn(
        "p-4 border-t-2 transition-all duration-300 hover:brightness-110",
        getStatusColor(),
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-white/60 font-medium tracking-wider">{title}</span>
        {icon && <div className="text-white/40">{icon}</div>}
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-2xl font-mono font-bold text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono text-white/50 mb-1">{unit}</span>
        )}
      </div>
      
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {getTrendIcon()}
        </div>
      )}
    </GlassPanel>
  );
}
