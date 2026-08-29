import React from 'react';
import growthLogoImg from '../assets/images/silar_ai_growth_logo_1787161422563.jpg';
import sharpEmblemImg from '../assets/images/s_sharp_modern_emblem_1787576880426.jpg';

interface SilarAiBrandLogoProps {
  customLogoImg?: string;
  variant?: 'light' | 'dark' | 'auto';
  isScrolled?: boolean;
  className?: string;
  showTagline?: boolean;
  useImageDirectly?: boolean;
}

export const SilarAiBrandLogo: React.FC<SilarAiBrandLogoProps> = ({
  customLogoImg,
  variant = 'auto',
  isScrolled = false,
  className = '',
  useImageDirectly = false
}) => {
  const isDarkBg = variant === 'dark' || (variant === 'auto' && !isScrolled);
  const logoSrc = customLogoImg || growthLogoImg;

  // If useImageDirectly is true or customLogoImg provided, show the clean image badge
  if (useImageDirectly) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`h-10 sm:h-12 px-2.5 py-1 rounded-xl flex items-center justify-center overflow-hidden transition-all ${
          isDarkBg 
            ? 'bg-white/95 border border-white/20 shadow-sm' 
            : 'bg-white border border-slate-200/80 shadow-sm hover:shadow-md'
        }`}>
          <img
            src={logoSrc}
            alt="SilarAI"
            className="h-8 sm:h-10 max-w-[240px] sm:max-w-[280px] object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Precision Geometric Sharp-Edged AI Shopping Bag 'S' Emblem */}
      <div className="relative shrink-0 flex items-center justify-center group/emblem cursor-pointer">
        {/* Luminous Ambient Peach/Orange Aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4500]/30 via-[#FCB666]/40 to-[#584053]/25 rounded-2xl blur-md group-hover/emblem:blur-lg group-hover/emblem:from-[#FF4500]/50 group-hover/emblem:to-[#FCB666]/70 transition-all duration-300 transform scale-95 group-hover/emblem:scale-105" />

        {/* Vector Sharp-Edged Modern AI Commerce 'S' Bag Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-9 h-9 sm:w-10 sm:h-10 relative z-10 transition-transform duration-300 group-hover/emblem:scale-105 filter drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Bag Body Base Gradient */}
            <linearGradient id="bagShellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkBg ? '#3F2539' : '#FFFFFF'} />
              <stop offset="50%" stopColor={isDarkBg ? '#271624' : '#FDF8F4'} />
              <stop offset="100%" stopColor={isDarkBg ? '#180B17' : '#F4EAE1'} />
            </linearGradient>

            {/* Sharp Upper 'S' Facet: Golden Peach to Fiery Coral */}
            <linearGradient id="sSharpUpperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCB666" />
              <stop offset="55%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FF4500" />
            </linearGradient>

            {/* Sharp Lower 'S' Facet: Solar Orange to Luminous Peach */}
            <linearGradient id="sSharpLowerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4500" />
              <stop offset="60%" stopColor="#FF8500" />
              <stop offset="100%" stopColor="#FCB666" />
            </linearGradient>

            {/* 3D Plum Shadow Facet */}
            <linearGradient id="sPlumShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#584053" />
              <stop offset="100%" stopColor="#382234" />
            </linearGradient>

            {/* Bag Handle Chamfered Gradient */}
            <linearGradient id="sHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#584053" />
              <stop offset="50%" stopColor="#FCB666" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>

            {/* Outline Border Gradient */}
            <linearGradient id="sBagBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCB666" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#584053" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FF5500" stopOpacity="0.85" />
            </linearGradient>

            {/* Spark Glow Diffusion */}
            <filter id="aiSparkBloom" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#FCB666" floodOpacity="0.95" />
            </filter>
          </defs>

          {/* Bag Handle: Sharp Chamfered 45-degree Architectural Arch */}
          <path
            d="M 36 29 L 36 21 L 44 13 L 56 13 L 64 21 L 64 29"
            stroke="url(#sHandleGrad)"
            strokeWidth="4"
            strokeLinejoin="miter"
            strokeLinecap="square"
            fill="none"
          />

          {/* Precision Faceted Shopping Bag Silhouette */}
          <path
            d="M 21 29 L 79 29 L 85 84 L 79 94 L 21 94 L 15 84 Z"
            fill="url(#bagShellGradient)"
            stroke="url(#sBagBorderGrad)"
            strokeWidth="2.2"
            strokeLinejoin="miter"
          />

          {/* Angular Geometric Top Rim Facet */}
          <path
            d="M 21 29 L 33 40 L 67 40 L 79 29"
            stroke={isDarkBg ? 'rgba(252, 182, 102, 0.35)' : 'rgba(88, 64, 83, 0.18)'}
            strokeWidth="1.6"
            strokeLinejoin="miter"
            fill="none"
          />

          {/* === SHARP-EDGED MODERN GEOMETRIC 'S' MONOGRAM === */}

          {/* 3D Depth Underlay / Shadow Wedge in Plum */}
          <polygon
            points="38,54 62,54 52,64 28,64"
            fill="url(#sPlumShadowGrad)"
            opacity={isDarkBg ? '0.9' : '0.4'}
          />

          {/* Upper Sharp Blade of the 'S' (Crisp 45-degree Chamfered Polygon) */}
          <polygon
            points="73,38 35,38 27,48 57,48 67,58 39,58 45,64 75,64 81,54 53,54 43,44 73,44"
            fill="url(#sSharpUpperGrad)"
            stroke={isDarkBg ? '#1D0E1B' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeLinejoin="miter"
          />

          {/* Lower Sharp Growth Blade of the 'S' (Crisp Angular Diagonal Rise) */}
          <polygon
            points="27,78 65,78 73,68 43,68 33,58 61,58 55,52 25,52 19,62 47,62 57,72 27,72"
            fill="url(#sSharpLowerGrad)"
            stroke={isDarkBg ? '#1D0E1B' : '#FFFFFF'}
            strokeWidth="0.8"
            strokeLinejoin="miter"
          />

          {/* Dynamic Central Diamond Intersection Shard */}
          <polygon
            points="50,53 56,58 50,63 44,58"
            fill="#FCB666"
            filter="url(#aiSparkBloom)"
          />

          {/* 4-Point Sharp AI Intelligence Diamond Spark at Apex */}
          <polygon
            points="78,12 80,18 86,20 80,22 78,28 76,22 70,20 76,18"
            fill="#FCB666"
            filter="url(#aiSparkBloom)"
          />

          {/* Angular Tech Micro Accent */}
          <polygon
            points="23,34 26,37 23,40 20,37"
            fill="#FF7A00"
          />
        </svg>
      </div>

      {/* SilarAI Wordmark as a Single Unified Word */}
      <div className="flex items-center select-none">
        <span
          className={`text-2xl sm:text-[26px] font-black tracking-tight font-sans transition-colors duration-200 ${
            isDarkBg ? 'text-white' : 'text-[#0B1938]'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          SilarAI
        </span>
      </div>
    </div>
  );
};





