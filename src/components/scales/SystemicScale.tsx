import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

export const SystemicScale = ({ opacity = 1 }: { opacity?: number }) => {
  const gridCount = 8;
  const spacing = 4;
  
  const nodes = useMemo(() => {
    const n = [];
    for (let x = -gridCount / 2; x < gridCount / 2; x++) {
      for (let y = -gridCount / 2; y < gridCount / 2; y++) {
        if (Math.random() > 0.7) {
          n.push(new THREE.Vector3(x * spacing, y * spacing, (Math.random() - 0.5) * 5));
        }
      }
    }
    return n;
  }, []);

  return (
    <group>
      {nodes.map((pos, i) => (
        <group key={i} position={pos}>
          <Box args={[0.8, 0.8, 0.8]}>
            <meshStandardMaterial 
              color="#222" 
              emissive="#00ffff" 
              emissiveIntensity={0.2 * opacity}
              transparent
              opacity={opacity}
              wireframe
            />
          </Box>
          <pointLight color="#00ffff" intensity={0.5 * opacity} distance={2} />
        </group>
      ))}
      {/* Structural Lines */}
      <gridHelper args={[40, 10, '#333', '#111']} rotation={[Math.PI / 2, 0, 0]} transparent opacity={0.1 * opacity} />
    </group>
  );
};
