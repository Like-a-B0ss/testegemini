import { ScrollControls, Scroll, useScroll, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GenerativeBackground } from './GenerativeBackground';

const Scene = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const offset = scroll.offset;
    // Camera movement based on scroll
    state.camera.position.z = 5 - offset * 3;
    state.camera.position.y = offset * 2;
    state.camera.lookAt(0, 0, 0);
    
    if (groupRef.current) {
        groupRef.current.rotation.y = offset * Math.PI * 2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[1, 15]} />
          <meshStandardMaterial color="#333" wireframe />
        </mesh>
      </Float>
      <GenerativeBackground />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
};

export const Experience = () => {
  return (
    <ScrollControls pages={3} damping={0.25}>
      <Scene />
      <Scroll html>
        <div style={{ width: '100vw' }}>
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '0 10%' }}>
            <h1 style={{ fontSize: '5rem', fontWeight: '900', margin: 0 }}>LEONARDO</h1>
          </section>
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 10%' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', margin: 0 }}>CREATIVE STUDIO</h2>
          </section>
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '0 10%' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', margin: 0 }}>FUTURE OF WEB</h2>
          </section>
        </div>
      </Scroll>
    </ScrollControls>
  );
};
