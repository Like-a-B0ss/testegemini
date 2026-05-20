import { Canvas } from '@react-three/fiber';
import { PhysicsUniverse } from './components/PhysicsUniverse';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        style={{ position: 'fixed', top: 0, left: 0 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        <PhysicsUniverse />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls makeDefault />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} intensity={1.5} radius={0.4} />
        </EffectComposer>
      </Canvas>
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        color: 'white',
        zIndex: 10,
        pointerEvents: 'none',
        fontFamily: 'monospace'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '0.2em' }}>SUBATOMIC SIMULATOR</h1>
        <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>QUANTUM PHYSICS ENGINE V1.0</p>
        <div style={{ marginTop: '20px', fontSize: '0.7rem', display: 'flex', gap: '20px' }}>
          <span><span style={{color: '#ff3333'}}>●</span> PROTONS</span>
          <span><span style={{color: '#3333ff'}}>●</span> NEUTRONS</span>
          <span><span style={{color: '#ffff00'}}>●</span> ELECTRONS</span>
        </div>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        color: 'white',
        opacity: 0.3,
        fontSize: '0.7rem',
        fontFamily: 'monospace'
      }}>
        DRAG TO ROTATE • SCROLL TO ZOOM
      </div>
    </div>
  );
}

export default App;
