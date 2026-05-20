import React from "react";
import { RadarCompliancePanel } from "../dashboard/panels/RadarCompliancePanel";
import { OEEPanel } from "../dashboard/panels/OEEPanel";

export function LeftPanel() {
  return (
    <div className="w-72 h-full p-4 flex flex-col gap-4 border-r border-white/10">
      <RadarCompliancePanel />
      <OEEPanel />
    </div>
  );
}
