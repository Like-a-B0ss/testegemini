import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const ElectronWithOrbit = ({ radius, speed, offset, rotation, color }: { radius: number, speed: number, offset: number, rotation: [number, number, number], color: string }) => {
  const electronRef = useRef<THREE.Mesh>(null);
  
  // Create elliptical path points for the line
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.4, 0, 2 * Math.PI, false, 0);
    return curve.getPoints(100).map(p => new THREE.Vector3(p.x, p.y, 0));
  }, [radius]);

  useFrame((state) => {
    if (electronRef.current) {
      const t = state.clock.getElapsedTime() * speed + offset;
      // Position electron on the same ellipse as the line
      electronRef.current.position.set(
        Math.cos(t) * radius,
        Math.sin(t) * radius * 0.4,
        0
      );
    }
  });

  return (
    <group rotation={rotation}>
      {/* The Orbital Path */}
      <Line points={points} color="#ffffff" lineWidth={0.5} transparent opacity={0.2} />
      
      {/* The Electron */}
      <mesh ref={electronRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} />
        <pointLight distance={1} intensity={2} color={color} />
      </mesh>
    </group>
  );
};

const Nucleus = () => {
  const particles = useMemo(() => {
    const p = [];
    const count = 12; // 6 protons, 6 neutrons
    for (let i = 0; i < count; i++) {
      const color = i % 2 === 0 ? '#ff3333' : '#3333ff'; // Red Protons, Blue Neutrons
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ];
      p.push({ position, color });
    }
    return p;
  }, []);

  return (
    <group>
      {particles.map((particle, i) => (
        <Sphere key={i} args={[0.12, 16, 16]} position={particle.position}>
          <meshStandardMaterial 
            color={particle.color} 
            emissive={particle.color} 
            emissiveIntensity={0.5} 
            roughness={0.2}
          />
        </Sphere>
      ))}
      <pointLight intensity={3} distance={3} color="#ffffff" />
    </group>
  );
};

export const Atom = () => {
  return (
    <group>
      {/* Detailed Nucleus */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Nucleus />
      </Float>

      {/* Orbits & Electrons (Now perfectly synced) */}
      <ElectronWithOrbit 
        radius={2} 
        speed={1.2} 
        offset={0} 
        rotation={[0, 0, 0]} 
        color="#00ffff" 
      />

      <ElectronWithOrbit 
        radius={2.5} 
        speed={0.8} 
        offset={Math.PI / 3} 
        rotation={[Math.PI / 2.5, Math.PI / 4, 0]} 
        color="#ff00ff" 
      />

      <ElectronWithOrbit 
        radius={3} 
        speed={0.6} 
        offset={Math.PI / 1.5} 
        rotation={[-Math.PI / 2.5, -Math.PI / 4, 0]} 
        color="#ffff00" 
      />
    </group>
  );
};
