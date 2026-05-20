import { Stars, Sparkles, Float } from '@react-three/drei';

export const CosmicScale = ({ opacity = 1 }: { opacity?: number }) => {
  return (
    <group>
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
      <Sparkles 
        count={200} 
        size={2} 
        scale={[10, 10, 10]} 
        speed={0.2} 
        opacity={opacity} 
        color="#ffffff" 
      />
      
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[10, 5, -20]}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial 
            color="#111" 
            emissive="#001133" 
            emissiveIntensity={0.5 * opacity}
            transparent
            opacity={opacity}
          />
        </mesh>
      </Float>
    </group>
  );
};
