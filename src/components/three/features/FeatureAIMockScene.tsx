import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Icosahedron, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const FeatureAIMockScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const waveforms = useMemo(() => Array.from({ length: 12 }), []);
  const waveRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 8, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (-state.pointer.y * Math.PI) / 8, 0.05);
    }
    if (coreRef.current) {
       coreRef.current.rotation.x += 0.005;
       coreRef.current.rotation.y += 0.01;
    }
    if (ringRef.current) {
       ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.5;
       ringRef.current.rotation.y += 0.02;
    }
    waveRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const scaleY = 1 + Math.sin(t * 5 + i * 0.5) * 1.5;
        mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, Math.max(0.2, scaleY), 0.1);
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={1} color="#a78bfa" distance={5} />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          
          <mesh ref={ringRef}>
            <Torus args={[1.6, 0.01, 16, 64]} rotation={[Math.PI / 3, 0, 0]}>
               <meshBasicMaterial color="#a78bfa" transparent opacity={0.8} />
            </Torus>
            <Sphere args={[0.08, 16, 16]} position={[1.6, 0, 0]}>
              <meshBasicMaterial color="#ffffff" />
              <pointLight intensity={1} color="#ffffff" distance={2} />
            </Sphere>
          </mesh>

          <mesh ref={coreRef}>
            <Icosahedron args={[0.7, 1]}>
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
            </Icosahedron>
          </mesh>
          
          <group position={[0, -1.2, 0]}>
            {waveforms.map((_, i) => (
              <mesh 
                key={i} 
                position={[(i - waveforms.length / 2) * 0.15 + 0.075, 0, 0]}
                ref={(el) => (waveRefs.current[i] = el as THREE.Mesh)}
              >
                <boxGeometry args={[0.08, 0.2, 0.02]} />
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.9} />
              </mesh>
            ))}
          </group>

        </Float>
      </group>
    </>
  );
};
