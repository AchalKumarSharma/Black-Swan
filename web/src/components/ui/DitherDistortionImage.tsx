"use client";

import React, { useRef, useState, useEffect, useId, useCallback } from "react";

interface DitherDistortionImageProps {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  aspectRatio?: string;
  maxTilt?: number;
  maxDistortion?: number;
}

export const DitherDistortionImage: React.FC<DitherDistortionImageProps> = ({
  src,
  alt = "Black Swan Intelligence Asset",
  className = "",
  containerClassName = "",
  children,
  aspectRatio,
  maxTilt = 6,
  maxDistortion = 14,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const dispMapRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  const rawId = useId();
  const filterId = `dither-lens-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Animation frame and physics state stored in refs to avoid React re-renders at 60fps
  const stateRef = useRef({
    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,
    targetScale: 1,
    currentScale: 1,
    targetDistortion: 0,
    currentDistortion: 0,
    mouseX: 0,
    mouseY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    velocity: 0,
    isHovered: false,
    reducedMotion: false,
    rafId: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      if (stateRef.current.rafId) {
        cancelAnimationFrame(stateRef.current.rafId);
      }
    };
  }, []);

  // RAF loop for buttery 60fps interpolation without layout thrashing
  const startAnimationLoop = useCallback(() => {
    const loop = () => {
      const s = stateRef.current;

      // Damping / lerp physics
      s.currentRotX += (s.targetRotX - s.currentRotX) * 0.12;
      s.currentRotY += (s.targetRotY - s.currentRotY) * 0.12;
      s.currentScale += (s.targetScale - s.currentScale) * 0.12;
      s.currentDistortion += (s.targetDistortion - s.currentDistortion) * 0.14;

      // Update card tilt directly in the DOM
      if (cardRef.current && !s.reducedMotion) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${s.currentRotX.toFixed(
          2
        )}deg) rotateY(${s.currentRotY.toFixed(2)}deg) scale3d(${s.currentScale.toFixed(
          3
        )}, ${s.currentScale.toFixed(3)}, 1)`;
      }

      // Update SVG displacement map scale directly
      if (dispMapRef.current && !s.reducedMotion) {
        dispMapRef.current.setAttribute(
          "scale",
          s.currentDistortion.toFixed(1)
        );
      }

      // Slight animated turbulence baseFrequency shift based on velocity
      if (turbRef.current && !s.reducedMotion) {
        const baseFreq = 0.035 + Math.min(s.velocity * 0.001, 0.04);
        turbRef.current.setAttribute("baseFrequency", `${baseFreq.toFixed(4)} 0.035`);
      }

      // Update Spotlight position
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(circle 320px at ${s.mouseX}px ${s.mouseY}px, rgba(107, 77, 58, 0.28) 0%, rgba(26, 22, 19, 0.12) 45%, transparent 75%)`;
        spotlightRef.current.style.opacity = s.isHovered ? "1" : "0";
      }

      // Decay velocity
      s.velocity *= 0.88;
      if (!s.isHovered) {
        s.targetDistortion = 0;
      }

      // Continue loop if active or still settling
      const isSettled =
        Math.abs(s.targetRotX - s.currentRotX) < 0.01 &&
        Math.abs(s.targetRotY - s.currentRotY) < 0.01 &&
        Math.abs(s.targetDistortion - s.currentDistortion) < 0.05 &&
        !s.isHovered;

      if (!isSettled) {
        s.rafId = requestAnimationFrame(loop);
      } else {
        s.rafId = 0;
      }
    };

    if (!stateRef.current.rafId) {
      stateRef.current.rafId = requestAnimationFrame(loop);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = stateRef.current;
    const dx = x - s.lastMouseX;
    const dy = y - s.lastMouseY;
    s.velocity = Math.sqrt(dx * dx + dy * dy);
    s.lastMouseX = x;
    s.lastMouseY = y;

    s.mouseX = x;
    s.mouseY = y;
    s.isHovered = true;

    // Normalize coordinates from -1 to 1 relative to center
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Set 3D tilt targets
    s.targetRotX = -normY * maxTilt;
    s.targetRotY = normX * maxTilt;
    s.targetScale = 1.02;

    // Distortion scale dynamically jumps with cursor velocity & distance from center
    const distFromCenter = Math.sqrt(normX * normX + normY * normY);
    s.targetDistortion = Math.min(
      maxDistortion,
      4 + distFromCenter * 6 + s.velocity * 0.4
    );

    startAnimationLoop();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    stateRef.current.lastMouseX = e.clientX - rect.left;
    stateRef.current.lastMouseY = e.clientY - rect.top;
    stateRef.current.isHovered = true;
    startAnimationLoop();
  };

  const handleMouseLeave = () => {
    const s = stateRef.current;
    s.isHovered = false;
    s.targetRotX = 0;
    s.targetRotY = 0;
    s.targetScale = 1;
    s.targetDistortion = 0;
    startAnimationLoop();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-lg cursor-crosshair select-none ${containerClassName}`}
      style={{
        transformStyle: "preserve-3d",
        aspectRatio: aspectRatio,
      }}
    >
      {/* Hidden SVG Filter Definition */}
      <svg
        className="pointer-events-none absolute h-0 w-0"
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            filterUnits="userSpaceOnUse"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.035 0.035"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              ref={dispMapRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 3D Transforming Card Container */}
      <div
        ref={cardRef}
        className="relative h-full w-full will-change-transform transition-transform duration-75 ease-out"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* The Graphic / Image with Dynamic Filter */}
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            filter: mounted ? `url(#${filterId})` : "none",
          }}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              className={`h-full w-full object-cover block transition-opacity duration-300 ${className}`}
            />
          ) : (
            children
          )}
        </div>

        {/* Tactical MI6 Optical Reticle Overlays */}
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Corner Optical L-Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-swan-sepia/70" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-swan-sepia/70" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-swan-sepia/70" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-swan-sepia/70" />

          {/* Crosshair Center Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border border-dashed border-parchment/60" />
              <div className="absolute top-1/2 left-0 w-full h-px bg-parchment/50" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-parchment/50" />
            </div>
          </div>
        </div>

        {/* Dynamic Surveillance Scanline / Halftone Screen Layer */}
        <div
          className="pointer-events-none absolute inset-0 z-15 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26, 22, 19, 0.4) 2px, rgba(26, 22, 19, 0.4) 4px)`,
          }}
        />

        {/* Dynamic Cursor Spotlight Flare */}
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-200"
          style={{
            mixBlendMode: "overlay",
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
};
