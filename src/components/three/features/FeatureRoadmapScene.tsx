import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Line, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

export const FeatureRoadmapScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = [
    { pos: [-1.2, -1.2, 0], color: "#a78bfa", label: "Basics" },
    { pos: [0, -0.4, 0.5], color: "#2dd4bf", label: "Trees" },
    { pos: [1.2, 0.6, 0], color: "#38bdf8", label: "Graphs" },
    { pos: [-0.6, 0.8, -0.5], color: "#fbbf24", label: "System Design" },
    { pos: [1.5, -0.8, -0.2], color: "#f472b6", label: "DP" }
  ];

  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 8, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (-state.pointer.y * Math.PI) / 8, 0.05);
      groupRef.current.rotation.y += 0.002;
    }
    // Flowing path animation: pulsing lines
    if (linesRef.current) {
       linesRef.current.children.forEach((child, i) => {
          (child as any).material.opacity = 0.4 + Math.sin(t * 3 + i) * 0.4;
       });
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={1} color="#a78bfa" distance={5} />
      
      <group ref={groupRef}>
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          {nodes.map((node, i) => (
            <group key={i} position={node.pos as [number, number, number]}>
               <Sphere args={[0.2, 32, 32]}>
                 <meshPhysicalMaterial color={node.color} transmission={0.9} opacity={1} transparent roughness={0.1} clearcoat={1} />
                 <pointLight intensity={1} color={node.color} distance={3} />
               </Sphere>
               <RoundedBox args={[0.8, 0.25, 0.02]} radius={0.05} position={[0, 0.4, 0]}>
                 {/* UNIFIED GLASS MATERIAL */}
                 <meshPhysicalMaterial 
                   color="#ffffff" 
                   transmission={0.9} 
                   opacity={1} 
                   transparent 
                   roughness={0.15} 
                   ior={1.5}
                   thickness={0.5} 
                   clearcoat={1}
                   clearcoatRoughness={0.1}
                 />
                 <Text position={[0, 0, 0.02]} fontSize={0.1} color="#0f172a" fontWeight={700}>
                   {node.label}
                 </Text>
               </RoundedBox>
            </group>
          ))}
          
          <group ref={linesRef}>
            <Line points={[nodes[0].pos as [number, number, number], nodes[1].pos as [number, number, number]]} color="#c4b5fd" lineWidth={3} transparent opacity={0.8} />
            <Line points={[nodes[1].pos as [number, number, number], nodes[2].pos as [number, number, number]]} color="#c4b5fd" lineWidth={3} transparent opacity={0.8} />
            <Line points={[nodes[1].pos as [number, number, number], nodes[3].pos as [number, number, number]]} color="#c4b5fd" lineWidth={3} transparent opacity={0.8} />
            <Line points={[nodes[0].pos as [number, number, number], nodes[4].pos as [number, number, number]]} color="#c4b5fd" lineWidth={3} transparent opacity={0.8} />
          </group>
        </Float>
      </group>
    </>
  );
};
