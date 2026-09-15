import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function LiquidShaderBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Dynamic Shader Material (Interactive Liquid Glass Shader with chromatic aberration & fluid turbulence)
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_intensity: { value: 1.0 },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_intensity;
      varying vec2 vUv;

      // Simplex-like smooth noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 pos = (st - 0.5) * vec2(aspect, 1.0);

        float t = u_time * 0.25;
        vec2 mouseOffset = (u_mouse - 0.5) * 0.35;

        // Layered liquid wave field
        float n1 = snoise(pos * 2.2 + vec2(t * 0.35, -t * 0.25) + mouseOffset);
        float n2 = snoise(pos * 4.0 - vec2(-t * 0.2, t * 0.4) + n1 * 0.6);
        float n3 = snoise(pos * 1.5 + vec2(t * 0.15, t * 0.3) + n2 * 0.4);

        // Fluid color palettes (Deep Cyber Indigo, Electric Cyan, Neon Magenta, Amber Gold)
        vec3 colorDeep = vec3(0.035, 0.05, 0.09); // Deep dark space background
        vec3 colorCyan = vec3(0.05, 0.72, 0.95);  // Electric Cyan
        vec3 colorIndigo = vec3(0.39, 0.40, 0.95); // Royal Indigo
        vec3 colorMagenta = vec3(0.85, 0.20, 0.75); // Neon Magenta
        vec3 colorAmber = vec3(0.96, 0.62, 0.15); // Warm Gold

        // Mix colors dynamically based on multi-frequency liquid noise
        float mix1 = smoothstep(-0.6, 0.8, n1 + n2 * 0.5);
        float mix2 = smoothstep(-0.4, 0.9, n2 + n3 * 0.4);
        float mix3 = smoothstep(-0.2, 1.0, n3 + sin(u_time * 0.2) * 0.2);

        vec3 col = mix(colorDeep, colorIndigo, mix1 * 0.45);
        col = mix(col, colorCyan, mix2 * 0.35);
        col = mix(col, colorMagenta, mix3 * 0.25);

        // Soft vignette and depth
        float dist = length(pos);
        col *= (1.25 - dist * 0.55);

        // Subtle fluid glass chromatic shimmer
        col += vec3(0.02, 0.04, 0.06) * (n2 * 2.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse interaction tracking
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = 1.0 - (e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handling
    const handleResize = () => {
      if (!renderer) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      uniforms.u_resolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;
      uniforms.u_time.value = elapsedTime;

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      uniforms.u_mouse.value.set(currentMouseX, currentMouseY);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-90 transition-opacity duration-1000"
      style={{ filter: 'blur(30px)', transform: 'scale(1.05)' }}
    />
  );
}
