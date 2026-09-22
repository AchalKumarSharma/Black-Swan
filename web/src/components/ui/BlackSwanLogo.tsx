"use client";

import React from "react";

export interface BlackSwanLogoProps extends React.SVGProps<SVGSVGElement> {
  withCircle?: boolean;
}

/**
 * High-definition vector Black Swan emblem mark.
 * Uses `currentColor` to dynamically match editorial text colors across
 * Warm Parchment (Light) and Obsidian Vault (Dark) modes.
 */
export const BlackSwanLogo: React.FC<BlackSwanLogoProps> = ({
  className = "w-6 h-6",
  withCircle = false,
  ...props
}) => {
  const swanPath =
    "M 28.5 0.5 C 31.5 0.5, 33.2 1.5, 34 3 C 34.6 3.8, 36 4.8, 36.8 5.4 C 37.1 5.7, 36.9 6.2, 36.4 6.4 C 34.8 7, 33.2 7.3, 31.8 7.2 C 29.8 7, 28.5 5.8, 28 4.6 C 26 3.8, 24.8 5.8, 24.5 8.5 C 24.1 12, 25 15.5, 27 19 C 28.6 21.8, 28.5 24.5, 26 27 C 23.5 29.2, 19.5 29.8, 14.5 29.2 C 11 28.8, 9 27.5, 8.2 26 C 8 25.5, 8.5 25, 9.2 25.2 C 11.5 25.8, 14 25.5, 16 24.2 C 10.5 24.5, 7.2 22.8, 5.2 20.8 C 4.6 20.2, 5.1 19.5, 6 19.7 C 9.2 20.5, 13 20, 16 18.2 C 9.8 18.2, 6 16.2, 3.8 14.2 C 3.2 13.5, 3.8 12.8, 4.8 13 C 8.5 13.8, 12.5 13.5, 15.5 11.8 C 9.2 11.2, 5.5 9.2, 4.2 7.8 C 3.5 7.1, 4.2 6.4, 5.2 6.7 C 9.5 8.2, 14 10.2, 18.5 12 C 21.2 12.8, 22.5 11, 22.8 8.5 C 23.1 5, 25 1.5, 28.5 0.5 Z";

  const swanEye = "M 30.2 2.8 A 0.8 0.8 0 1 1 30.2 2.79 Z";

  if (withCircle) {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="Black Swan Emblem"
        {...props}
      >
        {/* Subtle medallion background & circular frame */}
        <circle
          cx="24"
          cy="24"
          r="22.5"
          className="fill-bg-surface-subtle stroke-noir/30 dark:stroke-border-subtle"
          strokeWidth="1.25"
        />
        {/* Scaled & centered swan silhouette */}
        <g transform="translate(4, 5.5) scale(0.95)">
          <path
            d={`${swanPath} ${swanEye}`}
            fill="currentColor"
            fillRule="evenodd"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Black Swan Mark"
      {...props}
    >
      <g transform="translate(0, 4.5)">
        <path
          d={`${swanPath} ${swanEye}`}
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
};
