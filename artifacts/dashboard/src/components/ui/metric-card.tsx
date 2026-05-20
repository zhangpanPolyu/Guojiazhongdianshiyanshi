import React from "react";
import { cn } from "@/lib/utils";
import { MetricTrend } from "@/types";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { GlassPanel } from "./glass-panel";
import { motion, AnimatePresence } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: MetricTrend | null;
  status?: 'normal' | 'warning' | 'critical';
  icon?: React.ReactNode;
  className?: string;
  sparklineData?: number[];
}

function Sparkline({ data, status }: { data: number[]; status: 'normal' | 'warning' | 'critical' }) {
  if (!data || data.length < 2) return null;

  const width = 80;
  const height = 24;
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

  const color =
    status === 'critical' ? 'rgba(255,0,60,0.9)' :
    status === 'warning' ? 'rgba(255,184,0,0.9)' :
    'rgba(0,240,255,0.9)';

  const fillColor =
    status === 'critical' ? 'rgba(255,0,60,0.12)' :
    status === 'warning' ? 'rgba(255,184,0,0.12)' :
    'rgba(0,240,255,0.12)';

  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2);
  const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2);
  const fillPath = `${pathD} L ${lastX},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={fillPath} fill={fillColor} />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  );
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  status = 'normal',
  icon,
  className,
  sparklineData,
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

  const valueKey = String(value);

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
        <AnimatePresence mode="wait">
          <motion.span
            key={valueKey}
            className="text-2xl font-mono font-bold text-white tracking-tight tabular-nums"
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {unit && (
          <span className="text-sm font-mono text-white/50 mb-1">{unit}</span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
          </div>
        )}
        {sparklineData && sparklineData.length >= 2 && (
          <div className="ml-auto">
            <Sparkline data={sparklineData} status={status} />
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
