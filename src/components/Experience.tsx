import { ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { Atom } from './Atom';
import { SubatomicScale } from './scales/SubatomicScale';
import { MolecularScale } from './scales/MolecularScale';
import { CosmicScale } from './scales/CosmicScale';

const Scene = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  // References for opacity management
  const subatomicRef = useRef<THREE.Group>(null);
  const atomicRef = useRef<THREE.Group>(null);
  const molecularRef = useRef<THREE.Group>(null);
  const cosmicRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const offset = scroll.offset; // 0 to 1

    // Camera zoom out narrative
    // 0.0 - 0.2: Subatomic
    // 0.2 - 0.4: Atomic
    // 0.4 - 0.6: Molecular (Skills)
    // 0.6 - 0.8: Systemic (Projects) - Using Molecular as proxy for now
    // 0.8 - 1.0: Cosmic

    state.camera.position.z = 5 + offset * 40;
    state.camera.position.y = offset * 5;
    state.camera.lookAt(0, 0, 0);

    // Visibility and Opacity logic (simplified for initial implementation)
    if (subatomicRef.current) subatomicRef.current.visible = offset < 0.3;
    if (atomicRef.current) atomicRef.current.visible = offset > 0.1 && offset < 0.5;
    if (molecularRef.current) molecularRef.current.visible = offset > 0.3 && offset < 0.8;
    if (cosmicRef.current) cosmicRef.current.visible = offset > 0.6;
    
    if (groupRef.current) {
        groupRef.current.rotation.y = offset * Math.PI * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={subatomicRef}>
        <SubatomicScale />
      </group>
      
      <group ref={atomicRef} position={[0, 0, 0]}>
        <Atom />
      </group>

      <group ref={molecularRef} position={[0, 0, 15]}>
        <MolecularScale />
      </group>

      <group ref={cosmicRef} position={[0, 0, 30]}>
        <CosmicScale />
      </group>

      <ambientLight intensity={0.5} />
    </group>
  );
};

export const Experience = () => {
  return (
    <ScrollControls pages={6} damping={0.25}>
      <Scene />
      <Scroll html>
        <div style={{ width: '100vw', color: 'white', textTransform: 'uppercase' }}>
          
          {/* 1. HERO / SUBATOMIC */}
          <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%' }}>
            <h1 style={{ fontSize: '10vw', fontWeight: '900', margin: 0, lineHeight: 0.8 }}>LEONARDO<br/>PAES</h1>
            <p style={{ fontSize: '1.5rem', opacity: 0.6, maxWidth: '600px', marginTop: '20px' }}>
              Software Engineer. From fundamental structures to digital universes.
            </p>
          </section>

          {/* 2. ABOUT / ATOMIC */}
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '0 10%' }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: '700' }}>The Essence</h2>
              <p style={{ fontSize: '1.2rem', textTransform: 'none', lineHeight: 1.6 }}>
                I build digital products starting from the core foundations. Understanding the "atoms" of code allows me to construct resilient and scalable systems.
              </p>
            </div>
          </section>

          {/* 3. SKILLS / MOLECULAR */}
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 10%' }}>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: '700' }}>Molecular Logic</h2>
              <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>React • TypeScript • Node • Python • AI</p>
            </div>
          </section>

          {/* 4. PROJECTS / SYSTEMS */}
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '0 10%' }}>
            <div>
              <h2 style={{ fontSize: '3rem', fontWeight: '700' }}>Complex Systems</h2>
              <div style={{ display: 'grid', gap: '20px', marginTop: '40px' }}>
                <div><strong>RELMIN</strong> - AI Powered Reports</div>
                <div><strong>GHOST</strong> - Local Recording System</div>
                <div><strong>NEXUS</strong> - Interactive Experiences</div>
              </div>
            </div>
          </section>

          {/* 5. PHILOSOPHY */}
          <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <h2 style={{ fontSize: '4vw', fontWeight: '900', maxWidth: '80%' }}>
               Everything is connected. Scale is just a matter of perspective.
             </h2>
          </section>

          {/* 6. CONTACT / COSMIC */}
          <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700' }}>Let's build the future</h2>
            <div style={{ marginTop: '40px', display: 'flex', gap: '40px' }}>
              <a href="#" style={{ color: 'white' }}>GitHub</a>
              <a href="#" style={{ color: 'white' }}>LinkedIn</a>
              <a href="#" style={{ color: 'white' }}>Email</a>
            </div>
          </section>

        </div>
      </Scroll>
    </ScrollControls>
  );
};
