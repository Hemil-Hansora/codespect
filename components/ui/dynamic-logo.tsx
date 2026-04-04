'use client';

import { cn } from '@/lib/utils';

interface DynamicLogoProps {
  className?: string;
}

export function DynamicLogo({ className }: DynamicLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200"
      className={cn("w-full h-full", className)}
    >
      {/* Rounded square background using primary color */}
      <rect className="fill-primary" x="0" y="0" width="200" height="200" rx="32" ry="32"/>

      {/* Logo content using primary-foreground */}
      <g transform="translate(20, 60) scale(1.3)">
        <path
          className="fill-primary-foreground"
          d="M37.42,59.78C21.88,54.19,8.8,44.08,0,30.68,9.89,16.69,19.7,7.83,40.16.68c-20.74,11.74-22.35,45.43-2.74,59.1Z"
        />
        <path
          className="fill-primary-foreground"
          d="M120.02,30.68c-8.57,13.46-23.87,25-39.57,29.83,20.97-13.56,19.23-49.05-2.88-60.51,15.12,2.85,36.71,19.75,42.45,30.68Z"
        />

        <circle className="fill-primary-foreground" cx="60.01" cy="30.26" r="17" />

        {/* Code symbols using primary color */}
        <path
          className="stroke-primary fill-none"
          d="M53,25.5 L48,30.26 L53,35"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="stroke-primary fill-none"
          d="M67,25.5 L72,30.26 L67,35"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          className="stroke-primary"
          x1="63.5"
          y1="23.5"
          x2="56.5"
          y2="37"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
