import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

const PARTICLE_COUNT = 60;
const COULOMB_CONSTANT = 3.0;
const STRONG_FORCE_WELL_DEPTH = 60.0;
const STRONG_FORCE_RANGE = 0.7;
const DRAG = 0.92;
const MAX_FORCE = 50.0; // Prevent shooting off to infinity

interface ParticleData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'proton' | 'neutron' | 'electron';
  charge: number;
  mass: number;
}

const Particle = ({ data, allParticles }: { data: ParticleData, allParticles: ParticleData[] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.1,
    (Math.random() - 0.5) * 0.1,
    (Math.random() - 0.5) * 0.1
  ));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const acc = new THREE.Vector3(0, 0, 0);
    const nucleusCenter = new THREE.Vector3(0, 0, 0);
    let nucleonCount = 0;

    allParticles.forEach((other) => {
      if (other.id === data.id) return;

      const diff = new THREE.Vector3().subVectors(other.position, meshRef.current!.position);
      const dist = diff.length();
      if (dist < 0.05) return;

      const dir = diff.normalize();

      // Track Nucleus Center for Electrons
      if (other.type !== 'electron') {
          nucleusCenter.add(other.position);
          nucleonCount++;
      }

      // 1. Coulomb Force (Repulsion for same charges)
      if (data.charge !== 0 && other.charge !== 0) {
          const fCoulomb = (data.charge * other.charge * COULOMB_CONSTANT) / (dist * dist);
          const f = dir.clone().multiplyScalar(-fCoulomb / data.mass);
          f.clampLength(0, MAX_FORCE);
          acc.add(f);
      }

      // 2. Strong Nuclear Force (Nucleons only)
      if (data.type !== 'electron' && other.type !== 'electron') {
        if (dist < 2.5) {
          const attract = STRONG_FORCE_WELL_DEPTH * Math.exp(-(dist - STRONG_FORCE_RANGE));
          const repel = STRONG_FORCE_WELL_DEPTH * Math.exp(-2.0 * (dist - STRONG_FORCE_RANGE));
          const f = dir.clone().multiplyScalar((attract - repel) / data.mass);
          f.clampLength(0, MAX_FORCE);
          acc.add(f);
        }
      }
    });

    // 3. Electron Specific Logic: Attract to Nucleus Center of Mass
    if (data.type === 'electron' && nucleonCount > 0) {
        nucleusCenter.divideScalar(nucleonCount);
        const toNucleus = new THREE.Vector3().subVectors(nucleusCenter, meshRef.current.position);
        const distToNucleus = toNucleus.length();
        const dirToNucleus = toNucleus.normalize();
        
        // Ideal orbital shell
        const idealDist = 4.0 + (data.id % 3) * 1.5;
        const shellForce = (distToNucleus - idealDist) * 5.0;
        const f = dirToNucleus.multiplyScalar(shellForce / data.mass);
        f.clampLength(0, MAX_FORCE);
        acc.add(f);
        
        // Add orbital velocity (cross product with Up vector)
        const tangent = new THREE.Vector3().crossVectors(toNucleus, new THREE.Vector3(0, 1, 0)).normalize();
        acc.add(tangent.multiplyScalar(2.0 / data.mass));
    }

    // 4. Global Containment (Infinite well)
    const centerDist = meshRef.current.position.length();
    if (centerDist > 15) {
        const pull = meshRef.current.position.clone().multiplyScalar(-0.2);
        acc.add(pull);
    }

    // Physics Update
    const finalDelta = Math.min(delta, 0.03); // Cap delta to prevent tunneling
    velocity.current.add(acc.multiplyScalar(finalDelta));
    velocity.current.multiplyScalar(DRAG);
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(finalDelta));
    
    data.position.copy(meshRef.current.position);
  });

  const color = data.type === 'proton' ? '#ff4444' : data.type === 'neutron' ? '#4444ff' : '#00ffff';
  const size = data.type === 'electron' ? 0.12 : 0.3;

  return (
    <group>
      {data.type === 'electron' ? (
        <Trail width={0.8} length={12} color={new THREE.Color(color)} attenuation={(t) => t * t}>
          <Sphere ref={meshRef} args={[size, 12, 12]} position={data.position}>
            <meshBasicMaterial color={color} />
            <pointLight intensity={0.5} color={color} distance={2} />
          </Sphere>
        </Trail>
      ) : (
        <Sphere ref={meshRef} args={[size, 16, 16]} position={data.position}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.6} 
            metalness={0.9}
            roughness={0.1} 
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
      let type: 'proton' | 'neutron' | 'electron';
      if (i < 20) type = 'proton';
      else if (i < 40) type = 'neutron';
      else type = 'electron';

      p.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        type,
        charge: type === 'proton' ? 1 : type === 'electron' ? -1 : 0,
        mass: type === 'electron' ? 0.2 : 1.0 // Increased electron mass for stability
      });
    }
    return p;
  }, []);

  return (
    <group>
      {particles.map((p) => (
        <Particle key={p.id} data={p} allParticles={particles} />
      ))}
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={2} />
    </group>
  );
};
