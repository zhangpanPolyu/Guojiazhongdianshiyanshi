import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { WebGLErrorBoundary, WebGLFallback } from "./WebGLErrorBoundary";
import { isWebGLAvailable } from "./webglUtils";

function ParticleNetwork() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const particleCount = 100;
  const maxDistance = 3;
  
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }
    return { positions: pos, velocities: vel };
  }, [particleCount]);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;
    
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Update positions
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;
      
      // Bounce
      if (Math.abs(pos[i * 3]) > 5) velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 5) velocities[i].y *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 5) velocities[i].z *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Update lines
    const linePositions = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        
        if (distSq < maxDistance * maxDistance) {
          linePositions.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          );
        }
      }
    }
    
    const lineGeo = linesRef.current.geometry;
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#00F0FF" size={0.05} transparent opacity={0.8} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#00FF66" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

export function NetworkTopology() {
  if (!isWebGLAvailable()) {
    return <WebGLFallback />;
  }
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-full bg-transparent">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <ParticleNetwork />
          <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
