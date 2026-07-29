import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

export const FeatureResumeScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scannerRef = useRef<THREE.Mesh>(null);

  const keywords = useMemo(() => [
    { text: "React", pos: [-1.2, 1, 0.5], delay: 0 },
    { text: "Node.js", pos: [1.2, 0, 0.2], delay: 1 },
    { text: "System Design", pos: [-1, -1, 0.8], delay: 2 },
  ], []);
  const keywordRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 8, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (-state.pointer.y * Math.PI) / 8, 0.05);
    }
    if (scannerRef.current) {
      scannerRef.current.position.y = Math.sin(t * 1.5) * 1.3;
    }
    keywordRefs.current.forEach((mesh, i) => {
       if (mesh) {
          mesh.position.y += Math.sin(t * 2 + keywords[i].delay) * 0.002;
       }
    });
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={1} color="#a78bfa" distance={5} />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <RoundedBox args={[2.2, 3.2, 0.05]} radius={0.1}>
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
            <group position={[-0.7, 1.0, 0.03]}>
              <mesh position={[0.3, 0, 0]}><boxGeometry args={[0.8, 0.08, 0.01]} /><meshBasicMaterial color="#1e293b" /></mesh>
              <mesh position={[0.6, -0.3, 0]}><boxGeometry args={[1.4, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
              <mesh position={[0.4, -0.5, 0]}><boxGeometry args={[1.0, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
              <mesh position={[0.2, -1.0, 0]}><boxGeometry args={[0.6, 0.08, 0.01]} /><meshBasicMaterial color="#1e293b" /></mesh>
              <mesh position={[0.6, -1.3, 0]}><boxGeometry args={[1.4, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
              <mesh position={[0.5, -1.5, 0]}><boxGeometry args={[1.2, 0.04, 0.01]} /><meshBasicMaterial color="#94a3b8" /></mesh>
            </group>
          </RoundedBox>

          <mesh ref={scannerRef} position={[0, 1.2, 0.06]}>
            <Cylinder args={[1.2, 1.2, 0.02, 32]} rotation={[0, 0, Math.PI / 2]}>
               <meshBasicMaterial color="#a78bfa" transparent opacity={0.8} />
            </Cylinder>
          </mesh>
          
          {keywords.map((kw, i) => (
             <mesh key={i} position={kw.pos as [number, number, number]} ref={el => keywordRefs.current[i] = el as THREE.Mesh}>
               <RoundedBox args={[0.8, 0.3, 0.02]} radius={0.05}>
                 <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} />
                 <Text position={[0, 0, 0.02]} fontSize={0.12} color="#0f172a" fontWeight={700}>
                   {kw.text}
                 </Text>
               </RoundedBox>
             </mesh>
          ))}
        </Float>
      </group>
    </>
  );
};
