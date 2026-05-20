import { Canvas } from '@react-three/fiber';
import { BlackHole } from './components/BlackHole';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ position: 'fixed', top: 0, left: 0 }}
        dpr={[1, 2]}
      >
        <BlackHole />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.8} />
        </EffectComposer>
      </Canvas>
      
      {/* Minimal Overlay for context */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        color: 'white',
        zIndex: 10,
        pointerEvents: 'none',
        fontFamily: 'monospace'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '0.2em' }}>SINGULARITY ENGINE</h1>
        <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>GRAVITATIONAL LENSING SIMULATION V1.0</p>
      </div>
    </div>
  );
}

export default App;
