import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

#define ITERATIONS 150
#define STEP_SIZE 0.08
#define RS 2.0

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

float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000*noise(p); p = p*2.02;
    f += 0.2500*noise(p); p = p*2.03;
    f += 0.1250*noise(p); p = p*2.01;
    f += 0.0625*noise(p);
    return f;
}

mat2 rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c,-s,s,c);
}

void main() {
    // Correctly centering the UVs based on resolution
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
    
    // Camera setup with mouse interaction
    vec3 ro = vec3(0, 0, -15);
    // Apply rotation based on mouse (iMouse is -1 to 1)
    float pitch = -iMouse.y * 1.5;
    float yaw = -iMouse.x * 3.14 + iTime * 0.1;
    
    ro.yz *= rot(pitch);
    ro.xz *= rot(yaw);
    
    vec3 target = vec3(0, 0, 0);
    vec3 ww = normalize(target - ro);
    vec3 uu = normalize(cross(ww, vec3(0, 1, 0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 2.0 * ww);
    
    vec3 col = vec3(0);
    vec3 p = ro;
    float h = STEP_SIZE;
    
    for(int i=0; i<ITERATIONS; i++) {
        float d = length(p);
        
        // Gravitational Lensing (Schwarzschild Geodesic approximation)
        vec3 toCenter = -p / d;
        float force = 1.5 * RS * RS / (d * d * d);
        rd = normalize(rd + toCenter * force * h);
        
        p += rd * h;
        
        // Accretion Disk
        float r = length(p.xz);
        if (r > RS * 1.2 && r < RS * 8.0) {
            float diskHeight = 0.05 * (r - RS * 1.2);
            if (abs(p.y) < diskHeight) {
                float angle = atan(p.z, p.x);
                float dNoise = fbm(vec3(r * 0.4 - iTime * 0.6, angle * 2.0, p.y * 10.0));
                
                float dens = (1.0 - abs(p.y)/diskHeight) * smoothstep(RS*8.0, RS*3.0, r);
                dens *= dNoise;
                
                vec3 diskCol = mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.4, 0.1), smoothstep(RS*1.2, RS*8.0, r));
                
                // Doppler shifting
                float doppler = 1.0 + dot(normalize(cross(vec3(0,1,0), p)), rd) * 0.6;
                diskCol *= doppler;
                
                col += diskCol * dens * 0.4;
            }
        }
        
        if (d < RS) {
            col = vec3(0);
            break;
        }
        
        if (d > 50.0) {
            float s = noise(rd * 150.0);
            if (s > 0.99) col += vec3(pow(smoothstep(0.99, 1.0, s), 20.0));
            break;
        }
    }
    
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
    iResolution: { value: new THREE.Vector2(size.width * viewport.dpr, size.height * viewport.dpr) },
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


