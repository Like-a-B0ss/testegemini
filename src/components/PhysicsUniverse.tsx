import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const PARTICLE_COUNT = 50;
const COULOMB_CONSTANT = 4.0;
const STRONG_FORCE_CONSTANT = 30.0;
const DRAG = 0.92;
const REPULSION_STRENGTH = 5.0; // Pauli exclusion proxy

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
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  ));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const acceleration = new THREE.Vector3(0, 0, 0);

    particles.forEach((other) => {
      if (other.id === data.id) return;

      const diff = new THREE.Vector3().subVectors(other.position, meshRef.current!.position);
      const dist = diff.length();
      if (dist < 0.01) return;

      const dir = diff.normalize();

      // 1. Coulomb Force
      const coulombForce = (data.charge * other.charge * COULOMB_CONSTANT) / (dist * dist);
      acceleration.add(dir.clone().multiplyScalar(-coulombForce / data.mass));

      // 2. Strong Nuclear Force (Nucleons only)
      if ((data.type === 'proton' || data.type === 'neutron') && 
          (other.type === 'proton' || other.type === 'neutron')) {
        if (dist < 1.5) {
          const strongForce = STRONG_FORCE_CONSTANT * Math.exp(-dist * 3.0);
          acceleration.add(dir.clone().multiplyScalar(strongForce / data.mass));
        }
      }

      // 3. Short-range Repulsion (Pauli/Collision)
      if (dist < 0.6) {
        const repulsion = (REPULSION_STRENGTH / Math.pow(dist, 3));
        acceleration.add(dir.clone().multiplyScalar(-repulsion / data.mass));
      }
    });

    // Orbital containment
    const distFromCenter = meshRef.current.position.length();
    if (distFromCenter > 8) {
      acceleration.add(meshRef.current.position.clone().normalize().multiplyScalar(-2.0));
    }

    // Update Physics
    velocity.current.add(acceleration.multiplyScalar(delta));
    velocity.current.multiplyScalar(DRAG);
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));
    
    data.position.copy(meshRef.current.position);
  });

  const color = data.type === 'proton' ? '#ff3e3e' : data.type === 'neutron' ? '#3e3eff' : '#00ffff';
  const size = data.type === 'electron' ? 0.08 : 0.22;

  return (
    <group>
      {data.type === 'electron' ? (
        <Trail width={0.5} length={5} color={new THREE.Color(color)} attenuation={(t) => t * t}>
          <Sphere ref={meshRef} args={[size, 16, 16]} position={data.position}>
            <meshBasicMaterial color={color} />
          </Sphere>
        </Trail>
      ) : (
        <Sphere ref={meshRef} args={[size, 16, 16]} position={data.position}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.8} 
            roughness={0}
          />
        </Sphere>
      )}
    </group>
  );
};

export const PhysicsUniverse = () => {
  const particles = useMemo(() => {
    const p: ParticleData[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const type = i < 20 ? 'proton' : i < 40 ? 'neutron' : 'electron';
      p.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        type,
        charge: type === 'proton' ? 1 : type === 'electron' ? -1 : 0,
        mass: type === 'electron' ? 0.05 : 1.0
      });
    }
    return p;
  }, []);

  return (
    <group>
      {particles.map((p) => (
        <Particle key={p.id} data={p} particles={particles} />
      ))}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#444" />
    </group>
  );
};

