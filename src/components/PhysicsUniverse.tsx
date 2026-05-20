import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float } from '@react-three/drei';
import * as THREE from 'three';

const PARTICLE_COUNT = 40;
const BOUNDS = 10;
const COULOMB_CONSTANT = 2.0;
const STRONG_FORCE_CONSTANT = 15.0;
const DRAG = 0.95;

interface ParticleData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'proton' | 'neutron' | 'electron';
  charge: number;
  mass: number;
}

const Particle = ({ data, particles }: { data: ParticleData, particles: ParticleData[] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const acceleration = new THREE.Vector3(0, 0, 0);

    // Physics Interactions
    particles.forEach((other) => {
      if (other.id === data.id) return;

      const diff = new THREE.Vector3().subVectors(other.position, meshRef.current!.position);
      const dist = diff.length();
      if (dist < 0.1) return;

      const dir = diff.normalize();

      // 1. Coulomb Force (Repulsion/Attraction)
      const coulombForce = (data.charge * other.charge * COULOMB_CONSTANT) / (dist * dist);
      acceleration.add(dir.clone().multiplyScalar(-coulombForce / data.mass));

      // 2. Strong Nuclear Force (Short range attraction for Nucleons)
      if ((data.type === 'proton' || data.type === 'neutron') && 
          (other.type === 'proton' || other.type === 'neutron')) {
        if (dist < 2.0) {
          const strongForce = STRONG_FORCE_CONSTANT * Math.exp(-dist * 2.0);
          acceleration.add(dir.clone().multiplyScalar(strongForce / data.mass));
        }
      }
    });

    // Central gravity to keep them in view
    const toCenter = new THREE.Vector3(0, 0, 0).sub(meshRef.current.position);
    acceleration.add(toCenter.multiplyScalar(0.1));

    // Update Physics
    velocity.current.add(acceleration.multiplyScalar(delta));
    velocity.current.multiplyScalar(DRAG); // Artificial drag for stability
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));
    
    // Update shared data for other particles to read
    data.position.copy(meshRef.current.position);
  });

  const color = data.type === 'proton' ? '#ff3333' : data.type === 'neutron' ? '#3333ff' : '#ffff00';
  const size = data.type === 'electron' ? 0.1 : 0.25;

  return (
    <group>
      <Sphere ref={meshRef} args={[size, 16, 16]} position={data.position}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={1} 
          metalness={0.8}
          roughness={0.2}
        />
        {data.type === 'electron' && <pointLight intensity={0.5} color={color} />}
      </Sphere>
    </group>
  );
};

export const PhysicsUniverse = () => {
  const particles = useMemo(() => {
    const p: ParticleData[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const type = i < 15 ? 'proton' : i < 30 ? 'neutron' : 'electron';
      p.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        type,
        charge: type === 'proton' ? 1 : type === 'electron' ? -1 : 0,
        mass: type === 'electron' ? 0.1 : 1.0
      });
    }
    return p;
  }, []);

  return (
    <group>
      {particles.map((p) => (
        <Particle key={p.id} data={p} particles={particles} />
      ))}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
    </group>
  );
};
