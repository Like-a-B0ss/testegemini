import { ScrollControls, Scroll, useScroll, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { Atom } from './Atom';
import { SubatomicScale } from './scales/SubatomicScale';
import { MolecularScale } from './scales/MolecularScale';
import { SystemicScale } from './scales/SystemicScale';
import { CosmicScale } from './scales/CosmicScale';

const Scene = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  // References for visibility and depth management
  const subatomicRef = useRef<THREE.Group>(null);
  const atomicRef = useRef<THREE.Group>(null);
  const molecularRef = useRef<THREE.Group>(null);
  const systemicRef = useRef<THREE.Group>(null);
  const cosmicRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const offset = scroll.offset; // 0 to 1

    // EXTREME 3D SCALE: Zooming from Z=5 to Z=250
    // We use a non-linear curve for more "explosive" transitions at the end
    const zoomProgress = Math.pow(offset, 1.5);
    state.camera.position.z = 8 + zoomProgress * 250;
    state.camera.position.y = Math.sin(offset * Math.PI) * 10;
    state.camera.position.x = Math.cos(offset * Math.PI * 0.5) * 5;
    state.camera.lookAt(0, 0, 0);

    // Section visibility triggers (spaced out across the vast Z-space)
    if (subatomicRef.current) subatomicRef.current.visible = offset < 0.2;
    if (atomicRef.current) atomicRef.current.visible = offset > 0.05 && offset < 0.35;
    if (molecularRef.current) molecularRef.current.visible = offset > 0.25 && offset < 0.55;
    if (systemicRef.current) systemicRef.current.visible = offset > 0.45 && offset < 0.75;
    if (cosmicRef.current) cosmicRef.current.visible = offset > 0.65;
    
    // Slow cinematic rotation of the entire universe
    if (groupRef.current) {
        groupRef.current.rotation.y = offset * Math.PI * 0.2;
        groupRef.current.rotation.z = offset * Math.PI * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Subatomic (Z: 0-10) */}
      <group ref={subatomicRef} position={[0, 0, 0]}>
        <SubatomicScale />
      </group>
      
      {/* 2. Atomic (Z: 20-40) */}
      <group ref={atomicRef} position={[0, 0, 30]}>
        <Atom />
      </group>

      {/* 3. Molecular (Z: 60-90) */}
      <group ref={molecularRef} position={[0, 0, 80]}>
        <MolecularScale />
      </group>

      {/* 4. Systemic (Z: 120-160) */}
      <group ref={systemicRef} position={[0, 0, 150]}>
        <SystemicScale />
      </group>

      {/* 5. Cosmic (Z: 200+) */}
      <group ref={cosmicRef} position={[0, 0, 250]}>
        <CosmicScale />
      </group>

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, -10, 300]} intensity={2} color="#ff00ff" />
    </group>
  );
};

export const Experience = () => {
  return (
    <ScrollControls pages={10} damping={0.3} distance={1}>
      <Scene />
      <Scroll html>
        <div style={{ width: '100vw', color: 'white', textTransform: 'uppercase', pointerEvents: 'none' }}>
          
          <section style={{ height: '150vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
            <h1 style={{ fontSize: '15vw', fontWeight: '900', margin: 0, lineHeight: 0.8, letterSpacing: '-0.05em' }}>
              LEONARDO<br/><span style={{ color: 'transparent', WebkitTextStroke: '1px white' }}>PAES</span>
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.4, maxWidth: '400px', marginTop: '40px', letterSpacing: '0.2em' }}>
              REDEFINING SCALES THROUGH SOFTWARE ENGINEERING
            </p>
          </section>

          <section style={{ height: '150vh', display: 'flex', alignItems: 'center', padding: '0 15%' }}>
            <div style={{ maxWidth: '500px' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '0.5em' }}>PHASE 01 // ATOMIC</span>
              <h2 style={{ fontSize: '5rem', fontWeight: '900', margin: '20px 0' }}>THE CORE</h2>
              <p style={{ fontSize: '1.1rem', textTransform: 'none', lineHeight: 1.8, opacity: 0.7 }}>
                Every complex system begins with a single fundamental unit. My journey started by mastering the atoms of computation.
              </p>
            </div>
          </section>

          <section style={{ height: '150vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 15%' }}>
            <div style={{ textAlign: 'right', maxWidth: '500px' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '0.5em' }}>PHASE 02 // MOLECULAR</span>
              <h2 style={{ fontSize: '5rem', fontWeight: '900', margin: '20px 0' }}>LOGIC</h2>
              <p style={{ fontSize: '1.1rem', textTransform: 'none', lineHeight: 1.8, opacity: 0.7 }}>
                Connecting technologies to build functional modules. React, TypeScript, and Node.js are the covalent bonds of my stack.
              </p>
            </div>
          </section>

          <section style={{ height: '150vh', display: 'flex', alignItems: 'center', padding: '0 15%' }}>
            <div style={{ maxWidth: '600px' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '0.5em' }}>PHASE 03 // SYSTEMIC</span>
              <h2 style={{ fontSize: '5rem', fontWeight: '900', margin: '20px 0' }}>ENGINEERING</h2>
              <div style={{ marginTop: '40px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '30px' }}>
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>RELMIN</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>AI-driven structural analysis & reporting</p>
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>GHOST</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Private localized data infrastructure</p>
                </div>
              </div>
            </div>
          </section>

          <section style={{ height: '200vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.3, letterSpacing: '1em', marginBottom: '40px' }}>TERMINAL VELOCITY</span>
            <h2 style={{ fontSize: '12vw', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>COSMOS</h2>
            <p style={{ fontSize: '1.5rem', marginTop: '20px', opacity: 0.6 }}>THE NEXT HORIZON IS DIGITAL</p>
            
            <div style={{ marginTop: '100px', pointerEvents: 'auto' }}>
              <button style={{ background: 'white', color: 'black', border: 'none', padding: '20px 40px', fontWeight: '900', cursor: 'pointer', letterSpacing: '0.2em' }}>
                INITIATE CONTACT
              </button>
            </div>
          </section>

        </div>
      </Scroll>
    </ScrollControls>
  );
};
