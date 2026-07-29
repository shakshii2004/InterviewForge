import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Ring } from '@react-three/drei';
import * as THREE from 'three';

export const FeatureReportsScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const bars = useMemo(() => [
    { pos: [0, 0, 0.1], targetH: 0.4, color: "#a78bfa" },
    { pos: [0.5, 0, 0.1], targetH: 0.8, color: "#2dd4bf" },
    { pos: [1.0, 0, 0.1], targetH: 1.2, color: "#38bdf8" },
    { pos: [1.5, 0, 0.1], targetH: 0.6, color: "#fbbf24" },
  ], []);
  
  const barRefs = useRef<THREE.Mesh[]>([]);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 8, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (-state.pointer.y * Math.PI) / 8, 0.05);
    }
    
    barRefs.current.forEach((bar, i) => {
      if (bar) {
        const scaleY = (Math.sin(t * 2 + i) + 1) / 2 * bars[i].targetH + 0.1;
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, scaleY, 0.1);
        bar.position.y = bar.scale.y / 2;
      }
    });

    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={1} color="#a78bfa" distance={5} />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <RoundedBox args={[2.8, 2.0, 0.05]} radius={0.1}>
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
            
            <group position={[-1.0, -0.6, 0.03]}>
              {bars.map((bar, i) => (
                <mesh key={i} position={bar.pos as [number, number, number]} ref={el => barRefs.current[i] = el as THREE.Mesh}>
                  <boxGeometry args={[0.3, 1, 0.2]} />
                  <meshPhysicalMaterial color={bar.color} roughness={0.2} transmission={0.5} />
                </mesh>
              ))}
            </group>
            
            <group position={[-0.8, 0.4, 0.05]}>
               <Ring args={[0.25, 0.35, 32]} ref={ringRef}>
                 <meshBasicMaterial color="#a78bfa" side={THREE.DoubleSide} />
               </Ring>
               <mesh position={[0, 0, 0]}><circleGeometry args={[0.2, 32]} /><meshBasicMaterial color="#f3f4f6" transparent opacity={0.5} /></mesh>
               <mesh position={[0, 0, 0.01]}><boxGeometry args={[0.1, 0.05, 0.01]} /><meshBasicMaterial color="#1e293b" /></mesh>
            </group>
            
            <group position={[-0.2, 0.4, 0.03]}>
               <mesh position={[0.4, 0.1, 0]}><boxGeometry args={[0.8, 0.06, 0.01]} /><meshBasicMaterial color="#1e293b" /></mesh>
               <mesh position={[0.6, -0.1, 0]}><boxGeometry args={[1.2, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
               <mesh position={[0.5, -0.25, 0]}><boxGeometry args={[1.0, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
            </group>

          </RoundedBox>
        </Float>
      </group>
    </>
  );
};
