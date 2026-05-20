import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Sky } from '@react-three/drei';
import * as THREE from 'three';

// Water Shader (Gerstner Waves for realism)
const waterVertexShader = `
  uniform float iTime;
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;

  struct Wave {
    vec2 dir;
    float steepness;
    float wavelength;
  };

  #define WAVE_COUNT 4
  uniform Wave waves[WAVE_COUNT];

  vec3 gerstnerWave(vec2 dir, float steepness, float wavelength, vec3 p, inout vec3 tangent, inout vec3 binormal) {
    float k = 2.0 * 3.14159 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(dir);
    float f = k * (dot(d, p.xz) - c * iTime);
    float a = steepness / k;

    tangent += vec3(
      -d.x * d.x * (steepness * sin(f)),
      d.x * (steepness * cos(f)),
      -d.x * d.y * (steepness * sin(f))
    );
    binormal += vec3(
      -d.x * d.y * (steepness * sin(f)),
      d.y * (steepness * cos(f)),
      -d.y * d.y * (steepness * sin(f))
    );

    return vec3(
      d.x * (a * cos(f)),
      a * sin(f),
      d.y * (a * cos(f))
    );
  }

  void main() {
    vUv = uv;
    vec3 p = position;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    
    vec3 offset = vec3(0.0);
    offset += gerstnerWave(vec2(1.0, 0.5), 0.15, 20.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(0.5, 1.0), 0.1, 10.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(-0.5, 0.8), 0.05, 5.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(0.8, -0.2), 0.08, 15.0, p, tangent, binormal);
    
    vPos = p + offset;
    vNormal = normalize(cross(binormal, tangent));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPos, 1.0);
  }
`;

const waterFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;
  uniform vec3 iColor;
  uniform vec3 cameraPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPos);
    float fresnel = pow(1.0 - dot(vNormal, viewDir), 5.0);
    
    vec3 deepWater = vec3(0.01, 0.05, 0.1);
    vec3 shallowWater = vec3(0.1, 0.4, 0.5);
    vec3 color = mix(deepWater, shallowWater, vNormal.y);
    
    // Add specular highlight
    vec3 lightDir = normalize(vec3(5.0, 10.0, 2.0));
    float spec = pow(max(dot(reflect(-lightDir, vNormal), viewDir), 0.0), 128.0);
    
    color += spec * 0.5;
    color = mix(color, vec3(0.8, 0.9, 1.0), fresnel * 0.5);
    
    gl_FragColor = vec4(color, 0.9);
  }
`;

const Boat = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Simple Buoyancy Simulation
    // In a real SPH this would be complex, here we mimic the Gerstner wave displacement
    const x = meshRef.current.position.x;
    const z = meshRef.current.position.z;
    const y = Math.sin(t * 0.5 + x * 0.1) * 0.5 + Math.cos(t * 0.3 + z * 0.1) * 0.3;
    
    meshRef.current.position.y = y;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.1;
    meshRef.current.rotation.z = Math.cos(t * 0.5) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* Detailed Procedural Boat */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1, 0.5, 2.5]} />
        <meshStandardMaterial color="#4a3b2a" />
      </mesh>
      <mesh position={[0, 0.6, -0.5]}>
        <boxGeometry args={[0.8, 0.8, 1]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <mesh position={[0, 1.2, -0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
};

export const OceanSimulation = () => {
  const waterRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.uniforms.iTime.value = state.clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    iColor: { value: new THREE.Color('#001e3f') },
  }), []);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Boat />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[1000, 1000, 256, 256]} />
        <shaderMaterial
          ref={waterRef}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};
