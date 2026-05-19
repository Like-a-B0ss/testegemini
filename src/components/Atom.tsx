import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Electron = ({ radius, speed, offset, color }: { radius: number, speed: number, offset: number, color: string }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() * speed + offset;
      ref.current.position.set(
        Math.cos(t) * radius,
        Math.sin(t) * radius * 0.4, // Flattened orbit
        Math.sin(t) * radius
      );
    }
  });

  return (
    <group ref={ref}>
      <Sphere args={[0.05, 16, 16]}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </group>
  );
};

const Orbit = ({ radius, rotation }: { radius: number, rotation: [number, number, number] }) => {
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.4, 0, 2 * Math.PI, false, 0);
    return curve.getPoints(100).map(p => new THREE.Vector3(p.x, p.y, 0));
  }, [radius]);

  return (
    <group rotation={rotation}>
      <Line points={points} color="#555" lineWidth={0.5} transparent opacity={0.3} />
    </group>
  );
};

export const Atom = () => {
  return (
    <group>
      {/* Nucleus */}
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.3, 32, 32]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </Sphere>
      </Float>

      {/* Orbits & Electrons */}
      <Orbit radius={1.5} rotation={[0, 0, 0]} />
      <Electron radius={1.5} speed={2} offset={0} color="#00ffff" />

      <Orbit radius={2} rotation={[Math.PI / 3, 0, 0]} />
      <Electron radius={2} speed={1.5} offset={Math.PI} color="#ff00ff" />

      <Orbit radius={2.5} rotation={[-Math.PI / 3, Math.PI / 4, 0]} />
      <Electron radius={2.5} speed={1.2} offset={Math.PI / 2} color="#ffff00" />
      
      {/* Glow Effect for Nucleus */}
      <pointLight intensity={2} distance={5} color="#ffffff" />
    </group>
  );
};
