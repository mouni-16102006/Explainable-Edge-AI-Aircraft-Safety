"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface PartState {
  name: string;
  color: string;
  risk: number;
  description: string;
}

interface ComponentProps {
  probabilities: Record<string, number>;
  onPartSelect: (part: PartState) => void;
}

// Sub-component rendering the actual 3D objects
function AircraftModel({ probabilities, onPartSelect }: ComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Slow rotation for idling animation
  useFrame((state) => {
    if (groupRef.current && !state.pointer.x && !state.pointer.y) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  // Calculate colors based on failure probabilities
  const getSubsystemColor = (prob: number) => {
    if (prob > 0.70) return "#EF4444"; // Red (Emergency)
    if (prob > 0.40) return "#F97316"; // Orange (Critical)
    if (prob > 0.15) return "#EAB308"; // Yellow (Warning)
    return "#10B981"; // Green (Nominal)
  };

  const parts = [
    {
      name: "Cockpit / Avionics",
      probKey: "electrical_fault",
      position: [0, 0.2, 2.5] as [number, number, number],
      geometry: "sphere",
      args: [0.6, 16, 16],
      description: "Primary flight control deck and instrumentation bus."
    },
    {
      name: "Main Engine",
      probKey: "engine_fault",
      position: [0, -0.1, -1.8] as [number, number, number],
      geometry: "cylinder",
      args: [0.55, 0.55, 1.5, 16],
      description: "Turbojet core propulsion assembly."
    },
    {
      name: "Left Wing (Fuel Cell A)",
      probKey: "fuel_fault",
      position: [-2.6, 0, 0] as [number, number, number],
      geometry: "box",
      args: [3.4, 0.08, 1.2],
      description: "Structural port wing housing fuel cells and roll control flaps."
    },
    {
      name: "Right Wing (Flight Control B)",
      probKey: "flight_control_fault",
      position: [2.6, 0, 0] as [number, number, number],
      geometry: "box",
      args: [3.4, 0.08, 1.2],
      description: "Structural starboard wing housing telemetry receivers and spoilers."
    },
    {
      name: "Landing Gear System",
      probKey: "landing_gear_fault",
      position: [0, -0.9, 0.8] as [number, number, number],
      geometry: "box",
      args: [0.4, 0.8, 0.4],
      description: "Hydraulic landing strut retraction and steering lock."
    },
    {
      name: "Hydraulic Tail Stabilizer",
      probKey: "hydraulic_fault",
      position: [0, 0.6, -2.4] as [number, number, number],
      geometry: "box",
      args: [0.1, 1.0, 0.9],
      description: "Rear elevator control lines and yaw stabilizers."
    }
  ];

  const handlePointerOver = (e: any, name: string) => {
    e.stopPropagation();
    setHoveredPart(name);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredPart(null);
  };

  const handlePartClick = (e: any, part: typeof parts[0]) => {
    e.stopPropagation();
    const prob = probabilities[part.probKey] || 0.05;
    onPartSelect({
      name: part.name,
      color: getSubsystemColor(prob),
      risk: prob,
      description: part.description
    });
  };

  return (
    <group ref={groupRef}>
      {/* 3D Grid Overlay for Hologram feel */}
      <gridHelper args={[20, 20, "#0891b2", "#1e293b"]} position={[0, -1.8, 0]} />

      {/* Futuristic Holographic Airplane Group */}
      <group position={[0, 0, 0]}>
        
        {/* Fuselage Core (Not interactive, just base structure) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 4.8, 16]} />
          <meshBasicMaterial 
            color="#1e293b" 
            wireframe 
            transparent 
            opacity={0.4} 
          />
        </mesh>

        {/* Dynamic Interactive Components */}
        {parts.map((part) => {
          const prob = probabilities[part.probKey] || 0.05;
          const partColor = getSubsystemColor(prob);
          const isHovered = hoveredPart === part.name;

          return (
            <mesh
              key={part.name}
              position={part.position}
              onPointerOver={(e) => handlePointerOver(e, part.name)}
              onPointerOut={handlePointerOut}
              onClick={(e) => handlePartClick(e, part)}
            >
              {part.geometry === "sphere" && <sphereGeometry args={part.args as [number, number, number]} />}
              {part.geometry === "cylinder" && <cylinderGeometry args={part.args as [number, number, number, number]} />}
              {part.geometry === "box" && <boxGeometry args={part.args as [number, number, number]} />}

              <meshStandardMaterial
                color={isHovered ? "#22d3ee" : partColor}
                wireframe
                transparent
                opacity={isHovered ? 0.85 : 0.65}
                emissive={isHovered ? "#22d3ee" : partColor}
                emissiveIntensity={isHovered ? 0.8 : 0.3}
              />
            </mesh>
          );
        })}

        {/* Visual Engine Exhaust Glow effects */}
        <mesh position={[0, -0.1, -2.8]}>
          <coneGeometry args={[0.3, 1.2, 16]} />
          <meshBasicMaterial 
            color={getSubsystemColor(probabilities["engine_fault"] || 0.0)} 
            transparent 
            opacity={0.25} 
          />
        </mesh>

      </group>
    </group>
  );
}

export default function Aircraft3D({ probabilities, onPartSelect }: ComponentProps) {
  // Default values in case they aren't fully resolved
  const safeProbabilities = {
    engine_fault: 0.02,
    hydraulic_fault: 0.04,
    electrical_fault: 0.01,
    fuel_fault: 0.02,
    landing_gear_fault: 0.03,
    flight_control_fault: 0.01,
    ...probabilities
  };

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-2xl border border-slate-900 bg-slate-950/80 shadow-inner overflow-hidden">
      
      {/* 3D Canvas */}
      <Canvas style={{ background: "transparent" }}>
        <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={40} />
        
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        
        {/* Model */}
        <AircraftModel 
          probabilities={safeProbabilities} 
          onPartSelect={onPartSelect} 
        />
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={4}
          maxDistance={12}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>

      {/* Hologram Corner Accents */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-cyan-500/60 select-none">
        <div>SYS: DIGITAL_TWIN_MAPPING</div>
        <div>MODEL: F-22_CYBER_STRUCTURE</div>
        <div>GRID: 10m x 10m</div>
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[9px] text-slate-500 select-none">
        Drag to Rotate | Scroll to Zoom
      </div>

    </div>
  );
}
