import React from "react";
import { TopStatusBar } from "../components/layout/TopStatusBar";
import { LeftPanel } from "../components/layout/LeftPanel";
import { RightPanel } from "../components/layout/RightPanel";
import { CenterStage } from "../components/layout/CenterStage";
import { BottomDataStrip } from "../components/layout/BottomDataStrip";
import { AICopilotDrawer } from "../components/ai/AICopilotDrawer";
import { NavRail } from "../components/layout/NavRail";
import { WorkspaceView } from "../components/views/WorkspaceView";
import { LeadershipView } from "../components/views/LeadershipView";
import { VideoSurveillanceView } from "../components/views/VideoSurveillanceView";
import { HazardDetectionView } from "../components/views/HazardDetectionView";
import { useDashboard } from "../context/DashboardContext";
import { AnimatePresence, motion } from "framer-motion";

const FULL_VIEWS: Record<string, React.ComponentType> = {
  workbench: WorkspaceView,
  decision:  LeadershipView,
  cctv:      VideoSurveillanceView,
  hazard:    HazardDetectionView,
};

function DashboardContent() {
  const { activeView } = useDashboard();
  const FullView = FULL_VIEWS[activeView] ?? null;

  return (
    <div className="w-screen h-screen flex flex-col bg-sci-bg overflow-hidden relative">
      {/* Global scanline animation overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-overlay opacity-20">
        <div className="w-full h-1 bg-sci-cyan animate-scan-line shadow-[0_0_20px_var(--sci-cyan)]" />
      </div>

      <TopStatusBar />

      <div className="flex-1 flex overflow-hidden relative">
        <NavRail />

        <AnimatePresence mode="wait">
          {FullView ? (
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden relative"
            >
              <FullView />
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex overflow-hidden"
            >
              <LeftPanel />
              <CenterStage />
              <RightPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomDataStrip />

      {/* AI Copilot — floating button + slide-out drawer */}
      <AICopilotDrawer />
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
