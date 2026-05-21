import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import * as THREE from "three";
import { WebGLErrorBoundary, WebGLFallback } from "./WebGLErrorBoundary";
import { isWebGLAvailable } from "./webglUtils";

interface LabelDef {
  y: number;
  side: number;
  label: string;
  status: string;
  color: string;
}

const FLOOR_LABELS: LabelDef[] = [
  { y: 1.2, side: 3.2, label: "B1 | 地基与基础工程实验室", status: "待机", color: "#00F0FF" },
  { y: 2.6, side: 3.0, label: "F1 | 极端环境实验区 — 离心机", status: "运转中", color: "#00FF66" },
  { y: 3.9, side: 2.8, label: "F2 | 多场耦合实验室", status: "预约中", color: "#FFB800" },
  { y: 5.2, side: 2.6, label: "F3 | BIM 算力中心", status: "负载 85%", color: "#FFB800" },
  { y: 6.5, side: 2.3, label: "F4 | 材料性能检测平台", status: "运转中", color: "#00FF66" },
];

const FLOOR_DEFS = [
  { y: 0.25, w: 5.2, d: 4.2, h: 0.4 },
  { y: 1.1, w: 4.6, d: 3.6, h: 1.2 },
  { y: 2.6, w: 4.2, d: 3.2, h: 1.2 },
  { y: 3.9, w: 3.8, d: 2.9, h: 1.2 },
  { y: 5.2, w: 3.4, d: 2.6, h: 1.2 },
  { y: 6.5, w: 3.0, d: 2.3, h: 1.2 },
  { y: 7.5, w: 2.4, d: 1.8, h: 0.6 },
];

function FloatingLabel({ y, side, label, status, color }: LabelDef) {
  return (
    <Html
      position={[side, y, 0]}
      distanceFactor={12}
      style={{ pointerEvents: "none" }}
      center={false}
    >
      <div
        style={{
          background: "rgba(5,8,20,0.88)",
          border: `1px solid ${color}50`,
          borderLeft: `2px solid ${color}`,
          padding: "3px 8px",
          borderRadius: "3px",
          whiteSpace: "nowrap",
          backdropFilter: "blur(8px)",
          boxShadow: `0 0 12px ${color}25`,
          userSelect: "none",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: "1px",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "9px",
            color,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: "700",
            letterSpacing: "0.05em",
          }}
        >
          ◆ {status}
        </div>
      </div>
    </Html>
  );
}

function Institute() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.07;
    }
  });

  return (
    <group ref={groupRef}>
      {FLOOR_DEFS.map((f, i) => (
        <mesh key={i} position={[0, f.y, 0]}>
          <boxGeometry args={[f.w, f.h, f.d]} />
          <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.55} />
        </mesh>
      ))}

      <mesh position={[0, 3.9, 0]}>
        <boxGeometry args={[0.7, 8.0, 0.7]} />
        <meshBasicMaterial color="#00FF66" transparent opacity={0.12} />
      </mesh>

      <mesh position={[0, 9.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 6]} />
        <meshBasicMaterial color="#FFB800" />
      </mesh>

      <mesh position={[0, 10.2, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color="#FFB800" />
      </mesh>

      {FLOOR_LABELS.map((fl, i) => (
        <FloatingLabel key={i} {...fl} />
      ))}
    </group>
  );
}

const LEGEND_ITEMS = [
  { color: "#00FF66", label: "运转中" },
  { color: "#FFB800", label: "预约中" },
  { color: "#00F0FF", label: "待机" },
  { color: "#FF4444", label: "负载高" },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function HUDOverlay() {
  const now = useClock();

  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const timeStr = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <>
      {/* Title Banner — top of canvas */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, rgba(0,8,30,0.92) 0%, rgba(0,8,30,0.0) 100%)",
          padding: "10px 16px 18px",
        }}
      >
        {/* Left — building name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#00F0FF",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.12em",
              textShadow: "0 0 14px #00F0FF, 0 0 28px #00F0FF80",
            }}
          >
            ◈ 未来地下城市研究院
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.06em",
            }}
          >
            深圳大学土木工程国家重点实验室
          </div>
        </div>

        {/* Right — live clock */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 2,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#00F0FF",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.08em",
              textShadow: "0 0 10px #00F0FF80",
              lineHeight: 1,
            }}
          >
            {timeStr}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            {dateStr}
          </div>
        </div>
      </div>

      {/* Legend — bottom-right of canvas */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          zIndex: 10,
          pointerEvents: "none",
          background: "rgba(0,8,30,0.82)",
          border: "1px solid rgba(0,240,255,0.18)",
          borderRadius: 4,
          padding: "6px 10px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 16px rgba(0,240,255,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
            marginBottom: 2,
          }}
        >
          楼层状态图例
        </div>
        {LEGEND_ITEMS.map(({ color, label }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: color,
                boxShadow: `0 0 6px ${color}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.65)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export function ResearchInstituteBuilding() {
  if (!isWebGLAvailable()) {
    return <WebGLFallback />;
  }
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-full bg-transparent" style={{ position: "relative" }}>
        <HUDOverlay />
        <Canvas camera={{ position: [9, 5, 9], fov: 45 }}>
          <ambientLight intensity={0.25} />
          <pointLight position={[6, 12, 6]} intensity={0.6} color="#00F0FF" />
          <pointLight position={[-6, 4, -4]} intensity={0.35} color="#00FF66" />
          <pointLight position={[0, 0, 8]} intensity={0.2} color="#FFB800" />
          <Institute />
          <Grid
            infiniteGrid
            fadeDistance={28}
            sectionColor="#00F0FF"
            sectionThickness={0.4}
            cellColor="#00F0FF"
            cellThickness={0.25}
            position={[0, -0.1, 0]}
          />
          <OrbitControls
            enableZoom={true}
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI / 2 - 0.05}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
