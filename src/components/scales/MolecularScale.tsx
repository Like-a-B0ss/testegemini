import { useRef, useMemo } from 'react';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const skills = [
  { name: 'React', color: '#61dafb', position: [0, 0, 0] },
  { name: 'Node.js', color: '#68a063', position: [2, 1, -1] },
  { name: 'TypeScript', color: '#3178c6', position: [-1, 2, 1] },
  { name: 'Python', color: '#3776ab', position: [1, -2, 2] },
  { name: 'Next.js', color: '#ffffff', position: [-2, -1, -2] },
  { name: 'AI/LLMs', color: '#ff00ff', position: [2, -1.5, -0.5] },
];

export const MolecularScale = ({ opacity = 1 }: { opacity?: number }) => {
  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        const dist = new THREE.Vector3(...skills[i].position as [number, number, number]).distanceTo(
          new THREE.Vector3(...skills[j].position as [number, number, number])
        );
        if (dist < 4) {
          lines.push([skills[i].position, skills[j].position]);
        }
      }
    }
    return lines;
  }, []);

  return (
    <group>
      {skills.map((skill, i) => (
        <group key={i} position={skill.position as [number, number, number]}>
          <Sphere args={[0.2, 16, 16]}>
            <meshStandardMaterial 
              color={skill.color} 
              emissive={skill.color} 
              emissiveIntensity={0.5 * opacity}
              transparent
              opacity={opacity}
            />
          </Sphere>
        </group>
      ))}
      {connections.map((points, i) => (
        <Line 
          key={i} 
          points={points as [number, number, number][]} 
          color="#ffffff" 
          lineWidth={0.5} 
          transparent 
          opacity={0.1 * opacity} 
        />
      ))}
    </group>
  );
};
