import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sphere, Torus, Icosahedron, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export const ResumeScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scannerRef = useRef<THREE.Mesh>(null);

  // Elegant, tiny floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4 - 1
      ] as [number, number, number],
      scale: Math.random() * 0.03 + 0.01,
      speed: Math.random() * 0.2 + 0.1,
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Smoother, tighter parallax tracking
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        (state.pointer.x * Math.PI) / 12,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (-state.pointer.y * Math.PI) / 12,
        0.05
      );
    }

    if (scannerRef.current) {
      // Smooth sine wave scanning motion
      scannerRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 1.6;
    }
  });

  // Premium Glass Material Settings
  const glassMaterial = (
    <meshPhysicalMaterial 
      color="#ffffff"
      transmission={0.95}
      opacity={1}
      transparent
      roughness={0.1}
      ior={1.5}
      thickness={0.5}
      specularIntensity={1}
      clearcoat={1}
    />
  );

  return (
    <>
      {/* Refined Lighting for Glassmorphism */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8DAA91" />
      
      {/* Colorful glows to reflect in the glass */}
      <pointLight position={[-3, 2, -2]} intensity={2} color="#a78bfa" distance={10} />
      <pointLight position={[3, -2, 2]} intensity={1.5} color="#2dd4bf" distance={10} />
      
      <group ref={groupRef}>
        
        {/* Background Particles */}
        {particles.map((p, i) => (
          <Float key={i} speed={p.speed} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={p.position} scale={p.scale}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#a78bfa" : "#2dd4bf"} transparent opacity={0.4} />
            </mesh>
          </Float>
        ))}

        {/* --- Centerpiece: Premium Resume Card --- */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <RoundedBox args={[2.8, 3.8, 0.05]} radius={0.1} position={[0, 0, 0]}>
            {glassMaterial}
            
            {/* Darker Mock Text lines for contrast against white background */}
            <group position={[-0.9, 1.2, 0.03]}>
              <mesh position={[0.4, 0, 0]}><boxGeometry args={[1, 0.06, 0.01]} /><meshBasicMaterial color="#1e293b" opacity={0.8} transparent /></mesh>
              <mesh position={[0.9, -0.3, 0]}><boxGeometry args={[2.0, 0.04, 0.01]} /><meshBasicMaterial color="#64748b" opacity={0.4} transparent /></mesh>
              <mesh position={[0.7, -0.5, 0]}><boxGeometry args={[1.6, 0.04, 0.01]} /><meshBasicMaterial color="#64748b" opacity={0.4} transparent /></mesh>
              
              <mesh position={[0.2, -1.0, 0]}><boxGeometry args={[0.6, 0.06, 0.01]} /><meshBasicMaterial color="#1e293b" opacity={0.8} transparent /></mesh>
              <mesh position={[0.9, -1.3, 0]}><boxGeometry args={[2.0, 0.04, 0.01]} /><meshBasicMaterial color="#64748b" opacity={0.4} transparent /></mesh>
              <mesh position={[0.8, -1.5, 0]}><boxGeometry args={[1.8, 0.04, 0.01]} /><meshBasicMaterial color="#64748b" opacity={0.4} transparent /></mesh>
              <mesh position={[0.6, -1.7, 0]}><boxGeometry args={[1.4, 0.04, 0.01]} /><meshBasicMaterial color="#64748b" opacity={0.4} transparent /></mesh>
              
              <mesh position={[0.3, -2.2, 0]}><boxGeometry args={[0.8, 0.06, 0.01]} /><meshBasicMaterial color="#1e293b" opacity={0.8} transparent /></mesh>
              <mesh position={[0.9, -2.5, 0]}><boxGeometry args={[2.0, 0.04, 0.01]} /><meshBasicMaterial color="#64748b" opacity={0.4} transparent /></mesh>
              <mesh position={[0.7, -2.7, 0]}><boxGeometry args={[1.6, 0.04, 0.01]} /><meshBasicMaterial color="#64748b" opacity={0.4} transparent /></mesh>
            </group>
          </RoundedBox>

          {/* AI Scanning Beam (Glowing edge) */}
          <mesh ref={scannerRef} position={[0, 1.8, 0.05]}>
            <Cylinder args={[1.4, 1.4, 0.02, 32]} rotation={[0, 0, Math.PI / 2]}>
               <meshBasicMaterial color="#a78bfa" transparent opacity={0.8} />
            </Cylinder>
            {/* The actual light emitted by the beam */}
            <pointLight intensity={2} color="#a78bfa" distance={2} />
          </mesh>
        </Float>

        {/* --- Abstract Premium Orbiting Objects --- */}

        {/* Abstract Gem (Icosahedron) - Top Left */}
        <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5} position={[-2.2, 1.4, 0.8]}>
          <Icosahedron args={[0.5, 0]}>
            <meshPhysicalMaterial 
              color="#a78bfa" 
              transmission={0.8} 
              opacity={1} 
              roughness={0.1} 
              metalness={0.2} 
              thickness={1} 
            />
          </Icosahedron>
        </Float>

        {/* Abstract Ring (Torus) - Bottom Right */}
        <Float speed={1.5} rotationIntensity={2} floatIntensity={1} position={[2.2, -1.2, 0.5]}>
          <Torus args={[0.4, 0.15, 16, 32]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
             <meshPhysicalMaterial 
               color="#2dd4bf" 
               transmission={0.9} 
               roughness={0} 
               thickness={0.5} 
               ior={1.5} 
             />
          </Torus>
        </Float>

        {/* Sleek UI Card (Analytics/Code representation) - Top Right */}
        <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.2} position={[2.5, 1.2, -0.5]}>
          <RoundedBox args={[1.4, 1, 0.02]} radius={0.05} rotation={[0, -Math.PI / 6, 0]}>
            {glassMaterial}
            {/* Mini colorful bars */}
            <group position={[-0.3, -0.2, 0.015]}>
               <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.1, 0.2, 0.01]} /><meshBasicMaterial color="#a78bfa" /></mesh>
               <mesh position={[0.25, 0.2, 0]}><boxGeometry args={[0.1, 0.4, 0.01]} /><meshBasicMaterial color="#8DAA91" /></mesh>
               <mesh position={[0.5, 0.3, 0]}><boxGeometry args={[0.1, 0.6, 0.01]} /><meshBasicMaterial color="#38bdf8" /></mesh>
            </group>
          </RoundedBox>
        </Float>

        {/* Sleek UI Card (Code snippet representation) - Bottom Left */}
        <Float speed={2.2} rotationIntensity={0.8} floatIntensity={1} position={[-2.4, -1.2, 0.2]}>
          <RoundedBox args={[1.5, 0.8, 0.02]} radius={0.05} rotation={[0, Math.PI / 6, 0]}>
             {glassMaterial}
             {/* Mini code lines */}
             <group position={[-0.5, 0.15, 0.015]}>
               <mesh position={[0.2, 0, 0]}><boxGeometry args={[0.4, 0.04, 0.01]} /><meshBasicMaterial color="#a78bfa" /></mesh>
               <mesh position={[0.4, -0.15, 0]}><boxGeometry args={[0.6, 0.04, 0.01]} /><meshBasicMaterial color="#2dd4bf" /></mesh>
               <mesh position={[0.3, -0.3, 0]}><boxGeometry args={[0.4, 0.04, 0.01]} /><meshBasicMaterial color="#f472b6" /></mesh>
             </group>
          </RoundedBox>
        </Float>

        {/* Floating Glass Sphere (AI Core) */}
        <Float speed={1.2} rotationIntensity={1} floatIntensity={1.5} position={[0, -2.8, 0.5]}>
          <Sphere args={[0.4, 32, 32]}>
             <meshPhysicalMaterial 
               color="#ffffff" 
               transmission={1} 
               roughness={0} 
               ior={1.5} 
               thickness={1} 
             />
             <pointLight intensity={0.5} color="#38bdf8" distance={2} />
          </Sphere>
        </Float>

      </group>
    </>
  );
};
