import React from "react";

export default function Logo({ className = "", size = 24 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Big circle at the bottom */}
      <circle cx="50" cy="68" r="22" />
      {/* Small circle at the top */}
      <circle cx="46" cy="22" r="10" />
      {/* Connecting diagonal line */}
      <path d="M 30 61 L 46 32" />
    </svg>
  );
}
