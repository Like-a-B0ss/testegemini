import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { Bloom, EffectComposer, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Overlay />
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 35 }}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
        dpr={[1, 2]} // High DPI support
      >
        <color attach="background" args={['#000000']} />
        <Experience />
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={1} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4} 
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.001, 0.001)}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;
