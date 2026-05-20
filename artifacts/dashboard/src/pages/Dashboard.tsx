import React from "react";
import { TopStatusBar } from "../components/layout/TopStatusBar";
import { LeftPanel } from "../components/layout/LeftPanel";
import { RightPanel } from "../components/layout/RightPanel";
import { CenterStage } from "../components/layout/CenterStage";
import { BottomDataStrip } from "../components/layout/BottomDataStrip";
import { AICopilotDrawer } from "../components/ai/AICopilotDrawer";

export default function Dashboard() {
  return (
    <div className="w-screen h-screen flex flex-col bg-sci-bg overflow-hidden relative">
      {/* Global scanline animation overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-overlay opacity-20">
        <div className="w-full h-1 bg-sci-cyan animate-scan-line shadow-[0_0_20px_var(--sci-cyan)]" />
      </div>

      <TopStatusBar />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <CenterStage />
        <RightPanel />
      </div>
      
      <BottomDataStrip />

      {/* AI Copilot — floating button + slide-out drawer */}
      <AICopilotDrawer />
    </div>
  );
}
