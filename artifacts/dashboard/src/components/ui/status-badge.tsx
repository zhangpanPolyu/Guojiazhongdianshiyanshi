import React from "react";
import { cn } from "@/lib/utils";
import { EquipmentStatus } from "@/types";

interface StatusBadgeProps {
  status: EquipmentStatus | 'offline' | 'maintenance';
  text?: string;
  className?: string;
}

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return {
          dot: 'bg-sci-green',
          glow: 'shadow-[0_0_8px_var(--sci-green)]',
          textClass: 'text-sci-green'
        };
      case 'warning':
        return {
          dot: 'bg-sci-amber',
          glow: 'shadow-[0_0_8px_var(--sci-amber)]',
          textClass: 'text-sci-amber'
        };
      case 'fault':
        return {
          dot: 'bg-sci-red',
          glow: 'animate-pulse-danger shadow-[0_0_15px_var(--sci-red)]',
          textClass: 'text-sci-red'
        };
      case 'maintenance':
        return {
          dot: 'bg-sci-amber animate-pulse',
          glow: 'shadow-[0_0_8px_var(--sci-amber)]',
          textClass: 'text-sci-amber'
        };
      case 'offline':
      default:
        return {
          dot: 'bg-gray-500',
          glow: '',
          textClass: 'text-gray-400'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          styles.dot,
          styles.glow
        )}
      />
      {text && (
        <span className={cn("text-xs font-mono uppercase tracking-wider", styles.textClass)}>
          {text}
        </span>
      )}
    </div>
  );
}
