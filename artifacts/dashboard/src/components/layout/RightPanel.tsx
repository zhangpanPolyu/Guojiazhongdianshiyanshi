import React from "react";
import { AIAlertsTerminal } from "../dashboard/panels/AIAlertsTerminal";
import { GanttPanel } from "../dashboard/panels/GanttPanel";

export function RightPanel() {
  return (
    <div className="w-80 h-full p-4 flex flex-col gap-4 border-l border-white/10">
      <AIAlertsTerminal />
      <GanttPanel />
    </div>
  );
}
