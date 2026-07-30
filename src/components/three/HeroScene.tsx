import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export const HeroScene = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle mouse interaction for the whole laptop
  useFrame((state) => {
    if (groupRef.current) {
      // Base rotation: tilted down slightly (0.2) and angled to the right (-0.4)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        -0.4 + (state.pointer.x * Math.PI) / 10,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0.2 + (-state.pointer.y * Math.PI) / 10,
        0.05
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8DAA91" />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#ffffff" />
      
      <group ref={groupRef} position={[0, -0.5, 0]}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
          
          {/* Laptop Base (Centered at 0,0,0. Dimensions: 4x0.1x2.8) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4, 0.1, 2.8]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
          </mesh>
          
          {/* Keyboard Area (Dark inset on top of base) */}
          <mesh position={[0, 0.051, -0.2]}>
            <boxGeometry args={[3.6, 0.01, 1.4]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
          
          {/* Trackpad */}
          <mesh position={[0, 0.051, 0.8]}>
            <boxGeometry args={[1.2, 0.01, 0.7]} />
            <meshStandardMaterial color="#a0aec0" roughness={0.4} />
          </mesh>

          {/* Laptop Screen Hinge (at the back of the base Z=-1.4, Y=0.05) */}
          <group position={[0, 0.05, -1.4]} rotation={[0.2, 0, 0]}>
            
            {/* Screen Lid (Outer shell, stands upright, leaned back by 0.2 rad from hinge) */}
            <mesh position={[0, 1.3, -0.05]}>
              <boxGeometry args={[4, 2.6, 0.1]} />
              <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Screen Bezel (Inner black frame) */}
            <mesh position={[0, 1.3, 0.01]}>
              <boxGeometry args={[3.9, 2.5, 0.01]} />
              <meshStandardMaterial color="#111827" roughness={0.8} />
            </mesh>

            {/* Glowing Screen backplate (behind HTML) */}
            <mesh position={[0, 1.3, 0.015]}>
              <planeGeometry args={[3.7, 2.3]} />
              <meshBasicMaterial color="#000000" />
            </mesh>

            {/* The actual HTML UI Screen */}
            <Html
              transform
              wrapperClass="htmlScreen"
              distanceFactor={1.5}
              position={[0, 1.3, 0.02]}
              rotation={[0, 0, 0]}
              style={{
                width: '740px',
                height: '460px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div className="w-full h-full flex flex-col font-sans bg-background border border-border">
                
                {/* Mock Browser/App Header */}
                <div className="h-12 bg-card border-b border-border flex items-center px-4 justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="font-semibold text-primary text-sm">InterviewForge Live Session</div>
                  <div className="w-16" />
                </div>

                {/* Interview Scene Body */}
                <div className="flex-1 flex p-4 gap-4">
                  {/* Left: Video Feeds */}
                  <div className="flex-1 flex flex-col gap-4">
                    {/* AI Interviewer Video Feed */}
                    <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative shadow-inner">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
                        className="w-full h-full object-cover opacity-80"
                        alt="AI Interviewer"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white text-xs font-medium border border-white/10">
                        Sarah (AI Engineer)
                      </div>
                      {/* Audio waveform visualization overlay */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
                         <div className="w-1.5 h-6 bg-accent rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                         <div className="w-1.5 h-10 bg-accent rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
                         <div className="w-1.5 h-4 bg-accent rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.4s]" />
                         <div className="w-1.5 h-8 bg-accent rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.1s]" />
                      </div>
                    </div>
                    
                    {/* User Video Feed */}
                    <div className="h-32 bg-gray-800 rounded-xl overflow-hidden relative shadow-inner w-48 border-2 border-primary">
                      <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px]">
                        You
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Code Editor / Sidebar */}
                  <div className="w-[300px] bg-[#1e1e1e] rounded-xl shadow-inner border border-gray-800 flex flex-col overflow-hidden">
                    <div className="h-10 border-b border-gray-700 flex items-center px-3 bg-[#2d2d2d]">
                      <span className="text-gray-300 text-xs font-mono">solution.ts</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed text-blue-300">
                      <p><span className="text-purple-400">function</span> <span className="text-yellow-200">twoSum</span>(nums, target) {'{'}</p>
                      <p className="pl-4"><span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> <span className="text-yellow-200">Map</span>();</p>
                      <p className="pl-4"><span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = 0; i &lt; nums.length; i++) {'{'}</p>
                      <p className="pl-8"><span className="text-purple-400">const</span> comp = target - nums[i];</p>
                      <p className="pl-8"><span className="text-purple-400">if</span> (map.<span className="text-yellow-200">has</span>(comp)) {'{'}</p>
                      <p className="pl-12 text-gray-400">// Highlighted by AI</p>
                      <p className="pl-12 text-white bg-green-500/20 rounded px-1 -mx-1 border-l-2 border-green-500"><span className="text-purple-400">return</span> [map.<span className="text-yellow-200">get</span>(comp), i];</p>
                      <p className="pl-8">{'}'}</p>
                      <p className="pl-8">map.<span className="text-yellow-200">set</span>(nums[i], i);</p>
                      <p className="pl-4">{'}'}</p>
                      <p>{'}'}</p>
                    </div>
                    <div className="h-20 bg-[#252526] border-t border-gray-700 p-3">
                      <div className="text-[10px] text-green-400 font-semibold mb-1">AI Suggestion:</div>
                      <div className="text-[10px] text-gray-300">Great O(n) approach using a HashMap. Can you explain the space complexity?</div>
                    </div>
                  </div>
                </div>

              </div>
            </Html>
          </group>

        </Float>
      </group>
      
      <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2} far={4} />
    </>
  );
};
