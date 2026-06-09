import React from 'react';

export default function Logo({ className = '', showSlogan = false, size = 'md' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSize = isSm ? 'h-9 w-9' : isLg ? 'h-24 w-24' : 'h-14 w-14';
  const titleSize = isSm ? 'text-sm sm:text-base font-black' : isLg ? 'text-3xl sm:text-4xl font-black' : 'text-lg sm:text-xl font-black';
  const sloganSize = isSm ? 'text-[8px] sm:text-[9px] font-bold' : isLg ? 'text-xs sm:text-sm font-bold' : 'text-[10px] font-bold';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSize} flex-shrink-0`}
        aria-hidden="true"
      >
        {/* Background circuit tracks */}
        <path
          d="M 25 15 L 25 35 L 15 45 L 15 65 L 25 75"
          stroke="#64BC3C"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 35 8 L 35 25 L 22 38 L 22 62 L 35 75"
          stroke="#64BC3C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 75 85 L 75 65 L 85 55 L 85 35 L 75 25"
          stroke="#64BC3C"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 65 92 L 65 75 L 78 62 L 78 38 L 65 25"
          stroke="#64BC3C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Top & Bottom Cyan paths */}
        <path
          d="M 35 8 L 55 8 L 65 18 L 75 18"
          stroke="#00A8E1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 65 92 L 45 92 L 35 82 L 25 82"
          stroke="#00A8E1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Circle terminals */}
        <circle cx="75" cy="18" r="3.5" fill="#00A8E1" />
        <circle cx="25" cy="82" r="3.5" fill="#00A8E1" />
        <circle cx="25" cy="15" r="3.5" fill="#64BC3C" />
        <circle cx="75" cy="85" r="3.5" fill="#64BC3C" />
        <circle cx="35" cy="75" r="2.5" fill="#64BC3C" />
        <circle cx="65" cy="25" r="2.5" fill="#64BC3C" />

        {/* TYCS Center text */}
        <text
          x="50"
          y="56"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="17"
          fill="#64BC3C"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          TYCS
        </text>
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-display tracking-tight text-[#64BC3C] ${titleSize}`}
        >
          TEJYASH CYBER SOLUTIONS
        </span>
        {(showSlogan || isLg) && (
          <span
            className={`font-sans tracking-widest text-[#00A8E1] mt-1 uppercase ${sloganSize}`}
          >
            TECH TO THE RESCUE
          </span>
        )}
      </div>
    </div>
  );
}
