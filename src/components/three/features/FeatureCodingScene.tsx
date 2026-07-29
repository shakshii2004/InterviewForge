import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export const FeatureCodingScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const cursorRef = useRef<THREE.Mesh>(null);

  const codeLines = useMemo(() => [
    { w: 0.6, pos: [0.3, 0, 0], color: "#c084fc" },
    { w: 1.0, pos: [0.5, -0.2, 0], color: "#38bdf8" },
    { w: 1.2, pos: [0.6, -0.4, 0], color: "#a3e635" },
    { w: 0.8, pos: [0.4, -0.6, 0], color: "#94a3b8" },
    { w: 0.4, pos: [0.2, -0.8, 0], color: "#38bdf8" },
  ], []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 8, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (-state.pointer.y * Math.PI) / 8, 0.05);
    }
    if (cursorRef.current) {
       (cursorRef.current.material as THREE.Material).opacity = Math.sin(t * 10) > 0 ? 1 : 0;
       cursorRef.current.position.x = 0.4 + (Math.floor(t * 5) % 10) * 0.05; // Typewriter effect
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={1} color="#a78bfa" distance={5} />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <RoundedBox args={[2.5, 2.2, 0.05]} radius={0.1}>
            {/* UNIFIED GLASS MATERIAL (Darker tint for IDE) */}
            <meshPhysicalMaterial 
              color="#0f172a" 
              transmission={0.9} 
              opacity={1} 
              transparent 
              roughness={0.15} 
              ior={1.5}
              thickness={0.5} 
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
            <mesh position={[0, 1.0, 0.03]}><boxGeometry args={[2.5, 0.2, 0.02]} /><meshBasicMaterial color="#020617" /></mesh>
            <mesh position={[-1.1, 1.0, 0.04]}><circleGeometry args={[0.04, 16]} /><meshBasicMaterial color="#ef4444" /></mesh>
            <mesh position={[-0.95, 1.0, 0.04]}><circleGeometry args={[0.04, 16]} /><meshBasicMaterial color="#f59e0b" /></mesh>
            <mesh position={[-0.8, 1.0, 0.04]}><circleGeometry args={[0.04, 16]} /><meshBasicMaterial color="#10b981" /></mesh>

            <group position={[-1, 0.6, 0.03]}>
              {codeLines.map((line, i) => (
                 <mesh key={i} position={line.pos as [number, number, number]}>
                   <boxGeometry args={[line.w, 0.06, 0.01]} />
                   <meshBasicMaterial color={line.color} />
                 </mesh>
              ))}
              <mesh ref={cursorRef} position={[0.4, -0.8, 0]}>
                 <boxGeometry args={[0.06, 0.08, 0.02]} />
                 <meshBasicMaterial color="#ffffff" transparent />
              </mesh>
            </group>
          </RoundedBox>

          <RoundedBox args={[1.6, 0.8, 0.02]} radius={0.05} position={[0.8, -0.6, 0.2]} rotation={[0, -0.1, 0]}>
             <meshPhysicalMaterial color="#1e293b" transmission={0.9} opacity={0.9} roughness={0.2} />
             <mesh position={[-0.5, 0.2, 0.015]}><boxGeometry args={[0.4, 0.04, 0.01]} /><meshBasicMaterial color="#a3e635" /></mesh>
             <mesh position={[-0.4, 0, 0.015]}><boxGeometry args={[0.6, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
             <mesh position={[-0.2, -0.2, 0.015]}><boxGeometry args={[1.0, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
          </RoundedBox>

        </Float>
      </group>
    </>
  );
};
