import { Canvas } from '@react-three/fiber';
import { OceanSimulation } from './components/OceanSimulation';
import { OrbitControls } from '@react-three/drei';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [10, 10, 10], fov: 45 }}
        style={{ position: 'fixed', top: 0, left: 0 }}
        dpr={[1, 2]}
      >
        <OceanSimulation />
        <OrbitControls makeDefault />
      </Canvas>
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        color: 'white',
        zIndex: 10,
        pointerEvents: 'none',
        fontFamily: 'monospace',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '0.2em' }}>INFINITE OCEAN</h1>
        <p style={{ opacity: 0.7, fontSize: '0.8rem' }}>GERSTNER WAVE SIMULATION V1.0</p>
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        color: 'white',
        opacity: 0.5,
        fontSize: '0.7rem',
        fontFamily: 'monospace'
      }}>
        DRAG TO ROTATE • SCROLL TO ZOOM
      </div>
    </div>
  );
}

export default App;
