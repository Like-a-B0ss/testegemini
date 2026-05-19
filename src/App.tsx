import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Overlay />
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 35 }}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
      >
        <color attach="background" args={['#000000']} />
        <Experience />
        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;
