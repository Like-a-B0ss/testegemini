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

// Better Noise for Disk
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
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    
    // Camera setup
    vec3 ro = vec3(0, 2.5, -15);
    ro.yz *= rot(-iMouse.y * 1.5);
    ro.xz *= rot(-iMouse.x * 3.0 + iTime * 0.1);
    
    vec3 target = vec3(0, 0, 0);
    vec3 ww = normalize(target - ro);
    vec3 uu = normalize(cross(ww, vec3(0, 1, 0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);
    
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
        
        // Accretion Disk - Volumetric-like density
        float r = length(p.xz);
        if (r > RS * 1.5 && r < RS * 7.0 && abs(p.y) < 0.5) {
            float thickness = 0.4 * (1.0 - smoothstep(RS * 1.5, RS * 7.0, r));
            if (abs(p.y) < thickness) {
                // Procedural texture for the disk
                float angle = atan(p.z, p.x);
                float dNoise = fbm(vec3(r * 0.5 - iTime * 0.5, angle * 3.0, p.y * 5.0));
                
                // Realistic falloff and glow
                float dens = (1.0 - abs(p.y)/thickness) * smoothstep(RS*7.0, RS*3.0, r);
                dens *= dNoise;
                
                // Color based on temperature/distance
                vec3 diskCol = mix(vec3(1.0, 0.8, 0.5), vec3(1.0, 0.3, 0.05), smoothstep(RS*1.5, RS*7.0, r));
                
                // Doppler shifting approximation (blueshift one side, redshift the other)
                float doppler = 1.0 + dot(normalize(cross(vec3(0,1,0), p)), rd) * 0.5;
                diskCol *= doppler;
                
                col += diskCol * dens * 0.25;
            }
        }
        
        // Event Horizon
        if (d < RS) {
            col *= 0.0;
            break;
        }
        
        // Starfield background with lensing
        if (d > 40.0) {
            float s = noise(rd * 100.0);
            if (s > 0.98) col += vec3(pow(smoothstep(0.98, 1.0, s), 10.0));
            break;
        }
    }
    
    // Final Polish
    col = 1.0 - exp(-col * 1.5); // Exposure
    col = pow(col, vec3(0.4545)); // Gamma
    
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
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(size.width, size.height) },
    iMouse: { value: new THREE.Vector2(0, 0) }
  }), [size]);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.iTime.value = state.clock.getElapsedTime();
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.iMouse.value.set(
        state.mouse.x,
        state.mouse.y
      );
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.iResolution.value.set(
        state.size.width,
        state.size.height
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

