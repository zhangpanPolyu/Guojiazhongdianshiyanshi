import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Box } from "@react-three/drei";
import * as THREE from "three";
import { WebGLErrorBoundary, WebGLFallback } from "./WebGLErrorBoundary";
import { isWebGLAvailable } from "./webglUtils";

function AnimatedBuilding() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base */}
      <Box args={[4, 0.5, 4]} position={[0, 0.25, 0]}>
        <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.3} />
      </Box>
      
      {/* Floors */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Box key={i} args={[3.5, 0.8, 3.5]} position={[0, 1.2 + i * 1, 0]}>
          <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.5} />
        </Box>
      ))}

      {/* Core core */}
      <Box args={[1, 5.5, 1]} position={[0, 3, 0]}>
        <meshBasicMaterial color="#00FF66" transparent opacity={0.2} />
      </Box>
    </group>
  );
}

export function BuildingModel() {
  if (!isWebGLAvailable()) {
    return <WebGLFallback />;
  }
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-full bg-transparent">
        <Canvas camera={{ position: [8, 5, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedBuilding />
          <Grid 
            infiniteGrid 
            fadeDistance={20} 
            sectionColor="#00F0FF" 
            sectionThickness={1} 
            cellColor="#00F0FF" 
            cellThickness={0.5} 
            position={[0, -0.1, 0]}
          />
          <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.1} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
