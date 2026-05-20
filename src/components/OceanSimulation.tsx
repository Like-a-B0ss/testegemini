import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Stars, Sky, Environment, useHelper } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced Gerstner Wave Shader with Wind and Foam
const waterVertexShader = `
  uniform float iTime;
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vWaveHeight;

  vec3 gerstnerWave(vec2 dir, float steepness, float wavelength, vec3 p, inout vec3 tangent, inout vec3 binormal) {
    float k = 2.0 * 3.14159 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(dir);
    float f = k * (dot(d, p.xz) - c * iTime * 1.5); // Wind speed multiplier
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
    offset += gerstnerWave(vec2(1.0, 0.6), 0.2, 25.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(0.4, 0.9), 0.15, 12.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(-0.8, 0.3), 0.1, 8.0, p, tangent, binormal);
    
    vWaveHeight = offset.y;
    vPos = p + offset;
    vNormal = normalize(cross(binormal, tangent));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPos, 1.0);
  }
`;

const waterFragmentShader = `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vWaveHeight;
  uniform vec3 sunPosition;
  uniform float iTime;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPos);
    
    // Water Colors based on wave height
    vec3 deepWater = vec3(0.0, 0.05, 0.1);
    vec3 shallowWater = vec3(0.0, 0.4, 0.5);
    vec3 foamColor = vec3(0.8, 0.9, 1.0);
    
    vec3 color = mix(deepWater, shallowWater, smoothstep(-1.0, 1.0, vWaveHeight));
    
    // Add Foam at crests
    float foam = smoothstep(0.5, 1.2, vWaveHeight);
    color = mix(color, foamColor, foam * 0.4);
    
    // Fresnel
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 5.0);
    
    // Specular Sun Reflection
    vec3 lightDir = normalize(sunPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfDir), 0.0), 256.0);
    
    color += spec * vec3(1.0, 0.9, 0.7) * 2.0;
    color = mix(color, vec3(0.5, 0.7, 1.0), fresnel * 0.3);
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

const Boat = ({ sunPos }: { sunPos: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Physics responding to waves
    const x = groupRef.current.position.x;
    const z = groupRef.current.position.z;
    
    // Mocking wave height at boat position
    const waveY = Math.sin(t * 1.5 + x * 0.1) * 0.4 + Math.cos(t * 1.2 + z * 0.1) * 0.3;
    
    groupRef.current.position.y = waveY - 0.2;
    groupRef.current.rotation.x = Math.sin(t * 1.1) * 0.05;
    groupRef.current.rotation.z = Math.cos(t * 0.8) * 0.08;
    groupRef.current.position.x = Math.sin(t * 0.2) * 2.0; // Slow drift
  });

  return (
    <group ref={groupRef}>
      {/* Hull */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.2, 0.6, 3]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.8, -0.4]} castShadow>
        <boxGeometry args={[1, 0.8, 1.2]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 1.8, 0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <pointLight position={[0, 1, 0]} intensity={0.5} color="#ffaa00" />
    </group>
  );
};

export const OceanSimulation = () => {
  const waterRef = useRef<THREE.ShaderMaterial>(null);
  
  // Day/Night State
  const sunRef = useRef(new THREE.Vector3());

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.1; // Speed of day cycle
    const sunY = Math.sin(t);
    const sunZ = Math.cos(t);
    sunRef.current.set(50, sunY * 100, sunZ * 100);

    if (waterRef.current) {
      waterRef.current.uniforms.iTime.value = state.clock.getElapsedTime();
      waterRef.current.uniforms.sunPosition.value.copy(sunRef.current);
    }
  });

  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    sunPosition: { value: new THREE.Vector3() },
  }), []);

  return (
    <>
      <Sky sunPosition={[sunRef.current.x, sunRef.current.y, sunRef.current.z]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <directionalLight 
        position={[sunRef.current.x, sunRef.current.y, sunRef.current.z]} 
        intensity={Math.max(0, sunRef.current.y / 100) * 2} 
        castShadow 
      />
      
      <Environment preset="night" />
      
      <Boat sunPos={[sunRef.current.x, sunRef.current.y, sunRef.current.z]} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 2000, 512, 512]} />
        <shaderMaterial
          ref={waterRef}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
      
      {/* Moon (visible at night) */}
      <Sphere args={[2, 32, 32]} position={[-50, -50, -100]}>
          <meshBasicMaterial color="#ffffcc" />
      </Sphere>
    </>
  );
};
