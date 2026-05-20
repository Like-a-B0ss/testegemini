import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

// Realistic Black Hole Shader using Raymarching
// Inspired by General Relativity visual effects

#define MAX_STEPS 100
#define MIN_DIST 0.01
#define MAX_DIST 100.0

mat2 Rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// Gravitational Lensing simulation
vec3 getRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = p+f*z,
        i = c + uv.x*r + uv.y*u,
        d = normalize(i-p);
    return d;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0, 3, -12);
    ro.yz *= Rot(-iMouse.y * 3.14 + 0.5);
    ro.xz *= Rot(-iMouse.x * 6.28 + iTime * 0.1);
    
    vec3 rd = getRayDir(uv, ro, vec3(0,0,0), 1.0);
    vec3 col = vec3(0);
    
    float t = 0.0;
    vec3 p = ro;
    
    // Black Hole parameters
    float rs = 2.0; // Schwarzschild radius
    
    for(int i=0; i<128; i++) {
        float d = length(p);
        
        // Bending light
        float force = 1.5 * rs / (d * d);
        vec3 toCenter = normalize(-p);
        rd = normalize(rd + toCenter * force * 0.05);
        
        p += rd * 0.1;
        
        // Accretion Disk
        float disk = length(p.xz);
        if(disk > rs * 1.5 && disk < rs * 5.0 && abs(p.y) < 0.1) {
            float intensity = pow(1.0 - (disk - rs * 1.5) / (rs * 3.5), 2.0);
            vec3 diskCol = vec3(1.0, 0.5, 0.2) * intensity * 2.0;
            // Add noise/texture to disk
            diskCol *= 0.8 + 0.4 * sin(disk * 10.0 - iTime * 5.0);
            col += diskCol * 0.2;
        }
        
        // Event Horizon
        if(d < rs) {
            col = vec3(0);
            break;
        }
        
        if(length(p) > 20.0) {
            // Background stars
            float stars = pow(fract(sin(dot(rd, vec3(12.9898, 78.233, 45.164))) * 43758.5453), 20.0);
            col += vec3(stars) * 0.5;
            break;
        }
    }

    // Post processing in shader
    col = pow(col, vec3(0.4545)); // Gamma correction
    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const BlackHole = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(size.width, size.height, 1) },
    iMouse: { value: new THREE.Vector4(0, 0, 0, 0) }
  }), [size]);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.iTime.value = state.clock.getElapsedTime();
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.iMouse.value.set(
        state.mouse.x,
        state.mouse.y,
        0, 0
      );
    }
  });

  return (
    <mesh ref={meshRef} scale={[size.width, size.height, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};
