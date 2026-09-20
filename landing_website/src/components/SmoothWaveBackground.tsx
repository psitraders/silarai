import React from 'react';

/**
 * SmoothWaveBackground
 * 
 * Inspired by the reference design:
 * Features silky, sculpted 3D contour waves in ethereal porcelain, soft peach/apricot
 * ambient radial glow, and smooth organic ribbons that flow from top to bottom
 * across the entire landing experience.
 */
export const SmoothWaveBackground: React.FC<{ isHeroOnly?: boolean }> = ({ isHeroOnly = false }) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0"
    >
      {/* 1. Base luminous canvas: subtle pearlescent porcelain gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFD] via-[#F6F8FB] to-[#F3F6FA] opacity-95" />

      {/* 2. Primary Top Radiant Peach / Apricot Bloom (Directly behind Navbar & Hero Title) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] rounded-full blur-[90px] opacity-75 transform-gpu"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 18%, rgba(244, 140, 104, 0.26) 0%, rgba(254, 215, 196, 0.20) 40%, rgba(254, 237, 230, 0.05) 70%, transparent 100%)',
        }}
      />

      {/* 3. Secondary Soft Ambient Spheres (Subtle Lilac-Slate on Top Right & Soft Blush on Left) */}
      <div
        className="absolute top-24 right-[-5%] w-[600px] h-[550px] rounded-full blur-[100px] opacity-45 transform-gpu"
        style={{
          background: 'radial-gradient(circle, rgba(224, 231, 255, 0.55) 0%, rgba(241, 245, 249, 0.2) 60%, transparent 80%)',
        }}
      />
      <div
        className="absolute top-48 left-[-8%] w-[550px] h-[500px] rounded-full blur-[100px] opacity-40 transform-gpu"
        style={{
          background: 'radial-gradient(circle, rgba(254, 226, 215, 0.45) 0%, rgba(255, 241, 237, 0.15) 55%, transparent 75%)',
        }}
      />

      {/* 4. Silky 3D Sculpted Contour Waves (SVG Layer 1: Sweeping Hero Valleys & Ribbons) */}
      <div className="absolute top-0 inset-x-0 h-[880px] overflow-hidden opacity-90">
        <svg
          viewBox="0 0 1440 880"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Wave Gradient 1 - Soft Lilac-White Glass Ribbon */}
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#F8F9FD" stopOpacity="0.65" />
              <stop offset="75%" stopColor="#EEF2F9" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#E9EDF5" stopOpacity="0.25" />
            </linearGradient>

            {/* Wave Gradient 2 - Warm Apricot/Peach Contour Rim */}
            <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF1EB" stopOpacity="0.70" />
              <stop offset="50%" stopColor="#FDE8DE" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F8FAFD" stopOpacity="0.20" />
            </linearGradient>

            {/* Wave Gradient 3 - Deep Sculpted Backdrop Crest */}
            <linearGradient id="waveGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#F1F4F9" stopOpacity="0.70" />
              <stop offset="100%" stopColor="#E6ECF5" stopOpacity="0.30" />
            </linearGradient>

            {/* Stroke Highlighting Linear Gradients for 3D Edge Sheen */}
            <linearGradient id="strokeSheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#F48C68" stopOpacity="0.25" />
              <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.3" />
            </linearGradient>

            {/* Soft Ambient Wave Filter Shadow */}
            <filter id="waveShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="16" stdDeviation="22" floodColor="#94A3B8" floodOpacity="0.10" />
            </filter>
            <filter id="waveShadowDeep" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="24" stdDeviation="30" floodColor="#64748B" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Deep Sculpted Crest (Upper sweeping ridge from top right curving through middle) */}
          <path
            d="M-50,0 
               C280,120 520,30 840,110 
               C1120,180 1320,130 1500,40 
               L1500,0 Z"
            fill="url(#waveGrad1)"
            opacity="0.6"
          />

          {/* Primary Wave Ribbon: Elegant dipping valley where Hero text sits, swooping high on right & left */}
          <path
            d="M-100,160 
               C180,240 380,310 680,260 
               C980,210 1240,340 1520,290 
               L1520,720 
               C1220,680 940,820 620,760 
               C320,700 120,780 -100,740 Z"
            fill="url(#waveGrad3)"
            filter="url(#waveShadowDeep)"
            opacity="0.85"
          />
          {/* Wave Edge Highlight Stroke */}
          <path
            d="M-100,160 
               C180,240 380,310 680,260 
               C980,210 1240,340 1520,290"
            stroke="url(#strokeSheen)"
            strokeWidth="1.75"
            fill="none"
            opacity="0.75"
          />

          {/* Secondary Peach Aurora Wave: Graceful sweeping curve hugging the bottom of the hero */}
          <path
            d="M-80,480 
               C260,390 560,540 880,470 
               C1180,400 1360,510 1540,460 
               L1540,880 
               L-80,880 Z"
            fill="url(#waveGrad2)"
            filter="url(#waveShadow)"
            opacity="0.65"
          />
          {/* Secondary Wave Edge Highlight Stroke */}
          <path
            d="M-80,480 
               C260,390 560,540 880,470 
               C1180,400 1360,510 1540,460"
            stroke="#FFFFFF"
            strokeWidth="1.25"
            fill="none"
            opacity="0.9"
          />

          {/* Foreground Translucent Whispering Contour: Soft ripple framing the bottom */}
          <path
            d="M-50,680 
               C320,740 640,630 960,710 
               C1240,780 1420,700 1520,730 
               L1520,880 
               L-50,880 Z"
            fill="url(#waveGrad1)"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* 5. Delicate Micro SaaS Grid Matrix with soft radial fade (Adds high-tech texture without clutter) */}
      <div
        className="absolute top-0 inset-x-0 h-[800px] bg-[linear-gradient(to_right,#64748b0a_1px,transparent_1px),linear-gradient(to_bottom,#64748b0a_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,#000_30%,transparent_90%)] opacity-60 pointer-events-none"
      />

      {/* 6. Mid-Page and Full-Site Continuous Wave Flow (Active when rendering across the full landing experience) */}
      {!isHeroOnly && (
        <>
          {/* Mid-Page Ambient Soft Peach Warmth (Cradles Products and Industries) */}
          <div
            className="absolute top-[1600px] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full blur-[110px] opacity-35 transform-gpu pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(254, 215, 196, 0.28) 0%, rgba(224, 231, 255, 0.15) 50%, transparent 80%)',
            }}
          />

          {/* Lower Page Sinuous Contour Waves (Flowing behind Customer Metrics & Pricing) */}
          <div className="absolute top-[2800px] inset-x-0 h-[700px] overflow-hidden opacity-50 pointer-events-none">
            <svg
              viewBox="0 0 1440 700"
              fill="none"
              preserveAspectRatio="none"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M-50,180 
                   C320,90 680,240 1020,150 
                   C1280,80 1420,160 1520,120 
                   L1520,700 
                   L-50,700 Z"
                fill="url(#waveGrad1)"
              />
              <path
                d="M-50,180 C320,90 680,240 1020,150 C1280,80 1420,160 1520,120"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                opacity="0.7"
              />
            </svg>
          </div>

          {/* Bottom Pre-CTA Radiant Glow (Soft welcoming radiance framing FAQ & Final CTA) */}
          <div
            className="absolute bottom-36 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] rounded-full blur-[100px] opacity-40 transform-gpu pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(244, 140, 104, 0.22) 0%, rgba(254, 237, 230, 0.15) 45%, transparent 75%)',
            }}
          />
        </>
      )}
    </div>
  );
};
