import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import { WebGLErrorBoundary, WebGLFallback } from "./WebGLErrorBoundary";
import { isWebGLAvailable } from "./webglUtils";

function Node({ position, color, size = 0.3 }: { position: [number, number, number], color: string, size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Sphere ref={meshRef} args={[size, 16, 16]} position={position}>
      <meshBasicMaterial color={color} wireframe />
    </Sphere>
  );
}

function AnimatedSchematic() {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo(() => [
    { pos: [0, 0, 0] as [number,number,number], color: "#00F0FF", size: 0.5 }, // Central
    { pos: [3, 2, 0] as [number,number,number], color: "#00FF66" },
    { pos: [-3, 1, 2] as [number,number,number], color: "#00FF66" },
    { pos: [1, -2, 3] as [number,number,number], color: "#FFB800" },
    { pos: [-2, -1, -3] as [number,number,number], color: "#00FF66" },
    { pos: [2, -1, -2] as [number,number,number], color: "#FF003C" },
  ], []);

  const lines = useMemo(() => {
    const l = [];
    for (let i = 1; i < nodes.length; i++) {
      l.push([nodes[0].pos, nodes[i].pos]);
    }
    // Connect some outer nodes
    l.push([nodes[1].pos, nodes[2].pos]);
    l.push([nodes[3].pos, nodes[4].pos]);
    return l;
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Node key={i} position={node.pos} color={node.color} size={node.size} />
      ))}
      
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points as any}
          color="#00F0FF"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}

export function EquipmentSchematic() {
  if (!isWebGLAvailable()) {
    return <WebGLFallback />;
  }
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-full bg-transparent">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <AnimatedSchematic />
          <OrbitControls autoRotate autoRotateSpeed={1} enableZoom={true} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
