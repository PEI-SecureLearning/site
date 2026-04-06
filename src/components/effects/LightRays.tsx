"use client";

import { useRef, useEffect, useState, type CSSProperties } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";

/* ── Helpers ──────────────────────────────────────────── */

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 1, 1];
};

type RaysOrigin =
  | "top-left"
  | "top-center"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-center-elevated"
  | "bottom-right";

const getAnchorAndDir = (
  origin: RaysOrigin,
  w: number,
  h: number
): { anchor: [number, number]; dir: [number, number] } => {
  const outside = 0.2;
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case "top-right":
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case "left":
      return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case "right":
      return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, (1 + 0.03) * h], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * w, (1 + 0.03) * h], dir: [0, -1] };
    case "bottom-center-elevated":
      return { anchor: [0.5 * w, (1 - 0.3) * h], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [w, (1 + 0.03) * h], dir: [0, -1] };
    default:
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};

/* ── Shaders ─────────────────────────────────────────── */

const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;
uniform float hideOrigin;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  // Erase the hard geometrical dot if hideOrigin is requested
  float originFade = hideOrigin > 0.5 ? smoothstep(0.0, 60.0, distance) : 1.0;

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse * originFade;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  // Auto-flip gradient to match ray direction: bright at the SOURCE, dim at the far end.
  float vertRatio = coord.y / iResolution.y;
  float brightness = rayDir.y > 0.0 ? (1.0 - vertRatio) : vertRatio;
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

/* ── Types ───────────────────────────────────────────── */

interface LightRaysProps {
  raysOrigin?: RaysOrigin;
  /**
   * Override the ray direction vector [x, y]. When provided, this replaces
   * the default direction computed from raysOrigin. The vector is normalized
   * internally by the shader. Use this to aim rays at a custom angle —
   * e.g. [0.5, -1] from bottom-left to converge toward center-top.
   */
  raysDirection?: [number, number];
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
  style?: CSSProperties;
  /** Pause WebGL loop (e.g. when off-screen) */
  isPaused?: boolean;
  /** Hide the geometric vertex (donut fade effect) */
  hideOrigin?: boolean;
  /** Optionally pin the origin exactly to a DOM element's center via ID */
  originElementId?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ── Component ───────────────────────────────────────── */

export default function LightRays({
  raysOrigin = "top-center",
  raysDirection,
  raysColor = "#ffffff",
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1.0,
  saturation = 1.0,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0.0,
  distortion = 0.0,
  className = "",
  style,
  isPaused = false,
  hideOrigin = false,
  originElementId,
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uniformsRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationIdRef = useRef<number | null>(null);
  const meshRef = useRef<any>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* Intersection observer — only spin WebGL when in viewport */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  /* WebGL lifecycle */
  useEffect(() => {
    if (!isVisible || isPaused || !containerRef.current) return;

    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }

    const init = async () => {
      const container = containerRef.current;
      if (!container) return;
      await new Promise((r) => setTimeout(r, 10));
      if (!containerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";

      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(gl.canvas);

      const uniforms: any = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1 : 0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
        hideOrigin: { value: hideOrigin ? 1.0 : 0.0 },
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms,
      });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updatePlacement = () => {
        if (!containerRef.current || !renderer) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 2);
        const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
        renderer.setSize(wCSS, hCSS);
        const dpr = renderer.dpr;
        const w = wCSS * dpr;
        const h = hCSS * dpr;
        uniforms.iResolution.value = [w, h];
        
        let finalAnchor: [number, number];
        const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
        finalAnchor = anchor;

        if (originElementId) {
          const el = document.getElementById(originElementId);
          if (el) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const localX = (elRect.left + elRect.width / 2) - containerRect.left;
            const localY = (elRect.top + elRect.height / 2) - containerRect.top;
            finalAnchor = [localX * dpr, localY * dpr];
          }
        }

        uniforms.rayPos.value = finalAnchor;
        uniforms.rayDir.value = raysDirection ?? dir;
      };

      const loop = (t: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        uniforms.iTime.value = t * 0.001;
        if (followMouse && mouseInfluence > 0) {
          const s = 0.92;
          smoothMouseRef.current.x =
            smoothMouseRef.current.x * s + mouseRef.current.x * (1 - s);
          smoothMouseRef.current.y =
            smoothMouseRef.current.y * s + mouseRef.current.y * (1 - s);
          uniforms.mousePos.value = [
            smoothMouseRef.current.x,
            smoothMouseRef.current.y,
          ];
        }
        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch {
          return;
        }
      };

      window.addEventListener("resize", updatePlacement);
      updatePlacement();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupFnRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        window.removeEventListener("resize", updatePlacement);
        if (renderer) {
          try {
            const canvas = renderer.gl.canvas;
            const ext = renderer.gl.getExtension("WEBGL_lose_context");
            if (ext) ext.loseContext();
            if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
          } catch {
            /* noop */
          }
        }
        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    init();

    return () => {
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
    };
  }, [
    isVisible,
    isPaused,
    raysOrigin,
    raysDirection,
    raysColor,
    raysSpeed,
    lightSpread,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion,
    hideOrigin,
    originElementId,
  ]);

  /* Mouse tracking */
  useEffect(() => {
    if (!followMouse) return;
    const handle = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [followMouse]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        pointerEvents: "none",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}
