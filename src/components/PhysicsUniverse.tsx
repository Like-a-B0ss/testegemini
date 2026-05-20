import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Line } from '@react-three/drei';
import * as THREE from 'three';

const PARTICLE_COUNT = 60;
const COULOMB_CONSTANT = 5.0;
const STRONG_FORCE_WELL_DEPTH = 50.0;
const STRONG_FORCE_RANGE = 0.8;
const ELECTRON_ORBIT_BIAS = 2.0;
const DRAG = 0.94;

interface ParticleData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'proton' | 'neutron' | 'electron';
  charge: number;
  mass: number;
}

const NucleusBond = ({ p1, p2 }: { p1: THREE.Vector3, p2: THREE.Vector3 }) => {
  const points = useMemo(() => [p1, p2], [p1, p2]);
  return <Line points={points} color="#ffffff" lineWidth={0.5} transparent opacity={0.1} />;
};

const Particle = ({ data, allParticles }: { data: ParticleData, allParticles: ParticleData[] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5
  ));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const acc = new THREE.Vector3(0, 0, 0);

    allParticles.forEach((other) => {
      if (other.id === data.id) return;

      const diff = new THREE.Vector3().subVectors(other.position, meshRef.current!.position);
      const dist = diff.length();
      if (dist < 0.05) return;

      const dir = diff.normalize();

      // 1. Coulomb Force (Electrostatic)
      const fCoulomb = (data.charge * other.charge * COULOMB_CONSTANT) / (dist * dist);
      acc.add(dir.clone().multiplyScalar(-fCoulomb / data.mass));

      // 2. Strong Nuclear Force (Nucleons only)
      if ((data.type !== 'electron') && (other.type !== 'electron')) {
        // Morse-like Potential: Attractive at range, repulsive at very close
        if (dist < 2.0) {
          const attract = STRONG_FORCE_WELL_DEPTH * Math.exp(-(dist - STRONG_FORCE_RANGE));
          const repel = STRONG_FORCE_WELL_DEPTH * Math.exp(-2.0 * (dist - STRONG_FORCE_RANGE));
          acc.add(dir.clone().multiplyScalar((attract - repel) / data.mass));
        }
      }

      // 3. Electron Shell Bias (Simulating energy levels/orbits)
      if (data.type === 'electron' && other.type === 'proton') {
        const idealDist = 2.0 + (data.id % 2) * 1.5; // Two simple "shells"
        const shellForce = (dist - idealDist) * ELECTRON_ORBIT_BIAS;
        acc.add(dir.clone().multiplyScalar(shellForce / data.mass));
      }
    });

    // Containment
    const centerDist = meshRef.current.position.length();
    if (centerDist > 10) {
      acc.add(meshRef.current.position.clone().multiplyScalar(-0.5));
    }

    // Euler integration
    velocity.current.add(acc.multiplyScalar(delta));
    velocity.current.multiplyScalar(DRAG);
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));
    
    data.position.copy(meshRef.current.position);
  });

  const color = data.type === 'proton' ? '#ff4444' : data.type === 'neutron' ? '#4444ff' : '#00ffff';
  const size = data.type === 'electron' ? 0.06 : 0.25;

  return (
    <group>
      {data.type === 'electron' ? (
        <Trail width={0.4} length={8} color={new THREE.Color(color)} attenuation={(t) => t * t}>
          <Sphere ref={meshRef} args={[size, 12, 12]} position={data.position}>
            <meshBasicMaterial color={color} />
          </Sphere>
        </Trail>
      ) : (
        <Sphere ref={meshRef} args={[size, 16, 16]} position={data.position}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.1} />
        </Sphere>
      )}
    </group>
  );
};

export const PhysicsUniverse = () => {
  const particles = useMemo(() => {
    const p: ParticleData[] = [];
    // Start with pre-formed Helium nuclei to break the "soup" feel
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let type: 'proton' | 'neutron' | 'electron';
      if (i < 20) type = 'proton';
      else if (i < 40) type = 'neutron';
      else type = 'electron';

      p.push({
        id: i,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        type,
        charge: type === 'proton' ? 1 : type === 'electron' ? -1 : 0,
        mass: type === 'electron' ? 0.02 : 1.0
      });
    }
    return p;
  }, []);

  return (
    <group>
      {particles.map((p) => (
        <Particle key={p.id} data={p} allParticles={particles} />
      ))}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
    </group>
  );
};
