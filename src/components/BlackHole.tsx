import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

#define MAX_STEPS 200
#define STEP_SIZE 0.1
#define RS 2.0
#define DISK_IN 3.5
#define DISK_OUT 10.0

// Procedural noise for the accretion disk
float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + 113.0*p.z;
    return mix(mix(mix(hash(n+0.0), hash(n+1.0), f.x),
                   mix(hash(n+57.0), hash(n+58.0), f.x), f.y),
               mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                   mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
}

mat2 rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c,-s,s,c);
}

void main() {
    // Standardize UVs
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
    
    // Fixed camera distance to avoid "white out" clipping
    vec3 ro = vec3(0, 0, -18);
    
    // Rotation based on mouse
    float pitch = clamp(-iMouse.y * 1.5, -1.4, 1.4);
    float yaw = -iMouse.x * 3.14 + iTime * 0.05;
    
    ro.yz *= rot(pitch);
    ro.xz *= rot(yaw);
    
    // Ray direction (Standard perspective)
    vec3 ww = normalize(-ro);
    vec3 uu = normalize(cross(ww, vec3(0, 1, 0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 2.5 * ww);
    
    vec3 col = vec3(0.0);
    vec3 p = ro;
    
    // Integration parameters
    float h = STEP_SIZE;
    
    for(int i = 0; i < MAX_STEPS; i++) {
        float r = length(p);
        
        // Schwarzschild Gravitational Lensing logic
        // We bend the ray direction based on the force toward the center
        vec3 n = -p / r;
        float force = 1.5 * RS * RS / (r * r * r);
        rd = normalize(rd + n * force * h);
        
        // Move ray
        p += rd * h;
        
        // Accretion Disk intersection check
        float distToPlane = abs(p.y);
        float distFromCenter = length(p.xz);
        
        if (distFromCenter > DISK_IN && distFromCenter < DISK_OUT) {
            float thickness = 0.1 * (distFromCenter - DISK_IN);
            if (distToPlane < thickness) {
                // Procedural texture for disk
                float angle = atan(p.z, p.x);
                float n = noise(vec3(distFromCenter * 0.5 - iTime * 0.8, angle * 4.0, p.y * 10.0));
                
                // Opacity and color
                float alpha = (1.0 - distToPlane/thickness) * smoothstep(DISK_OUT, DISK_IN + 1.0, distFromCenter);
                alpha *= n;
                
                vec3 diskCol = mix(vec3(1.0, 0.4, 0.1), vec3(1.0, 0.9, 0.7), smoothstep(DISK_OUT, DISK_IN, distFromCenter));
                
                // Side-dependent brightness (Doppler)
                float doppler = 1.0 + dot(normalize(cross(vec3(0,1,0), p)), rd) * 0.7;
                
                col += diskCol * alpha * doppler * 0.5;
                if (col.r > 1.0 && col.g > 1.0) break; // Optimization
            }
        }
        
        // Event Horizon check
        if (r < RS) {
            col = vec3(0.0);
            break;
        }
        
        // Background stars
        if (r > 60.0) {
            float s = noise(rd * 200.0);
            col += vec3(smoothstep(0.995, 1.0, s));
            break;
        }
    }
    
    // Tonemapping and Gamma
    col = 1.0 - exp(-col * 2.0);
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}
`;

const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

export const BlackHole = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  
  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(0, 0) },
    iMouse: { value: new THREE.Vector2(0, 0) }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.iTime.value = state.clock.getElapsedTime();
      material.uniforms.iMouse.value.set(state.mouse.x, state.mouse.y);
      material.uniforms.iResolution.value.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};
