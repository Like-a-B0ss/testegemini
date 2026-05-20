import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Stars, Sky, Environment, KeyboardControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

// Realistic Gerstner Waves with varying parameters for a natural look
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
    float f = k * (dot(d, p.xz) - c * iTime * 1.2);
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
    // Varied wave parameters for a non-patterned look
    offset += gerstnerWave(vec2(1.0, 0.6), 0.25, 30.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(0.4, 0.9), 0.2, 15.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(-0.7, 0.3), 0.15, 8.0, p, tangent, binormal);
    offset += gerstnerWave(vec2(0.2, -0.8), 0.1, 5.0, p, tangent, binormal);
    
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
    
    // Deeper, richer water colors
    vec3 deepWater = vec3(0.005, 0.02, 0.06);
    vec3 shallowWater = vec3(0.0, 0.25, 0.35);
    vec3 foamColor = vec3(0.9, 0.95, 1.0);
    
    // Sub-surface scattering approximation based on wave height
    float sss = smoothstep(0.0, 1.5, vWaveHeight) * 0.2;
    vec3 color = mix(deepWater, shallowWater, smoothstep(-2.0, 1.0, vWaveHeight));
    color += vec3(0.0, 0.1, 0.15) * sss;
    
    // Natural Foam (concentrated on peaks)
    float foam = smoothstep(0.4, 1.5, vWaveHeight);
    color = mix(color, foamColor, foam * 0.3);
    
    // Fresnel for reflections
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);
    
    // Sun Specular (Golden highlights)
    vec3 lightDir = normalize(sunPosition);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float spec = pow(max(dot(reflectDir, viewDir), 0.0), 120.0);
    
    color += spec * vec3(1.0, 0.8, 0.4) * 1.5;
    color = mix(color, vec3(0.4, 0.6, 0.8), fresnel * 0.4);
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

const Boat = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [, get] = useKeyboardControls();
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const { forward, backward, left, right } = get();

    // Input Handling
    if (forward) velocity.current.z -= 10 * delta;
    if (backward) velocity.current.z += 6 * delta;
    if (left) rotation.current += 1.5 * delta;
    if (right) rotation.current -= 1.5 * delta;

    // Movement Logic
    velocity.current.multiplyScalar(0.98); // Friction
    groupRef.current.translateZ(velocity.current.z * delta);
    groupRef.current.rotation.y = rotation.current;

    // Better Buoyancy: Boat follows the wave height at its position
    const x = groupRef.current.position.x;
    const z = groupRef.current.position.z;
    
    // Mathematical approximation of the vertex shader wave height
    const waveHeight = 
        Math.sin(t * 1.4 + x * 0.1) * 0.6 + 
        Math.cos(t * 1.1 + z * 0.15) * 0.4 + 
        Math.sin(t * 2.0 + (x+z) * 0.2) * 0.2;
    
    // Smoothing height transition
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, waveHeight + 0.3, 0.1);
    
    // Tilt boat based on movement and waves
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -velocity.current.z * 0.02 + Math.sin(t * 1.5) * 0.05, 0.1);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, (left ? -0.1 : right ? 0.1 : 0) + Math.cos(t * 1.2) * 0.05, 0.1);
  });

  return (
    <group ref={groupRef}>
      {/* Visual Boat Body */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.7, 4]} />
        <meshStandardMaterial color="#4d2c18" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.8, -0.5]} castShadow>
        <boxGeometry args={[1.2, 0.9, 1.5]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      <mesh position={[0, 2, 0.5]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <pointLight position={[0, 1.5, 0]} intensity={0.6} color="#ffcc66" distance={5} />
    </group>
  );
};

export const OceanSimulation = () => {
  const waterRef = useRef<THREE.ShaderMaterial>(null);
  const sunPos = useMemo(() => new THREE.Vector3(50, 40, 100), []);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.uniforms.iTime.value = state.clock.getElapsedTime();
      waterRef.current.uniforms.sunPosition.value.copy(sunPos);
    }
  });

  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    sunPosition: { value: sunPos },
  }), [sunPos]);

  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
      ]}
    >
      <Sky sunPosition={[sunPos.x, sunPos.y, sunPos.z]} />
      <Stars radius={100} depth={50} count={3000} factor={4} fade />
      <directionalLight position={sunPos} intensity={1.5} castShadow />
      <Environment preset="sunset" />
      
      <Boat />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000, 512, 512]} />
        <shaderMaterial
          ref={waterRef}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </KeyboardControls>
  );
};
