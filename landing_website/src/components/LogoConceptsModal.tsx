import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Palette, ArrowRight, RefreshCw, Check } from 'lucide-react';

import sharpEmblemImg from '../assets/images/s_sharp_modern_emblem_1787576880426.jpg';
import origamiBagImg from '../assets/images/s_origami_growth_bag_1787576706278.jpg';
import bagEmblemImg from '../assets/images/s_shopping_bag_emblem_1787576286102.jpg';
import modernEmblemImg from '../assets/images/silar_modern_ai_emblem_1787162503739.jpg';
import sEmblemHexFacet from '../assets/images/s_emblem_hex_facet_1787204256289.jpg';
import sEmblemMobiusHelix from '../assets/images/s_emblem_mobius_helix_1787204269551.jpg';
import sEmblemCyberMatrix from '../assets/images/s_emblem_cyber_matrix_1787204282553.jpg';
import growthLogoImg from '../assets/images/silar_ai_growth_logo_1787161422563.jpg';
import officialLogoImg from '../assets/images/silarai_official_logo_1785580316828.jpg';
import infinityLogoImg from '../assets/images/infinity_logo_1787156789897.jpg';

interface LogoConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLogoId?: number;
  onSelectLogo?: (logoId: number, logoImg: string) => void;
}

export const LOGO_DESIGNS = [
  {
    id: 1,
    name: 'Primary: Sharp-Edged Geometric S + Chamfered Bag',
    style: 'Modern Sharp-Faceted S Monogram',
    image: sharpEmblemImg,
    description: 'Precision angular 45-degree chamfered "S" monogram with sharp faceted polygon wings in luminous warm peach (#FCB666) & fiery solar orange (#FF4500) over deep velvet plum shadow bevels.',
    palette: ['Luminous Peach (#FCB666)', 'Solar Orange (#FF4500)', 'Deep Plum (#584053)', 'Midnight Base (#180B17)'],
    recommendedFor: 'Next-gen enterprise AI commerce, high-performance retail intelligence, and modern SaaS brand marks.'
  },
  {
    id: 2,
    name: 'Concept 2: Origami Growth Bag + Dual-Ribbon S',
    style: 'Precision Folded S Ribbon Commerce Emblem',
    image: origamiBagImg,
    description: 'Precision folded 3D aerodynamic "S" monogram integrated with a modern shopping bag silhouette. Dual ribbon flow in glowing golden peach (#FCB666) & deep plum (#584053) with an apex AI spark.',
    palette: ['Radiant Peach (#FCB666)', 'Deep Plum (#584053)', 'Sunrise Coral (#F97B4F)', 'Solar Gold (#FF7A00)'],
    recommendedFor: 'Modern AI SaaS, high-conversion eCommerce storefronts, and conversational AI store agents.'
  },
  {
    id: 3,
    name: 'Concept 3: AI Shopping Bag Classic S',
    style: 'Luxury AI eCommerce Bag + Glowing S Ribbon',
    image: bagEmblemImg,
    description: 'Modern geometric luxury shopping bag silhouette with arching handle and an interlocking 3D glowing "S" neural ribbon in radiant peach (#FCB666) & deep plum (#584053) with an AI intelligence spark at the apex.',
    palette: ['Luminous Peach (#FCB666)', 'Deep Velvet Plum (#584053)', 'Solar Orange (#FF4500)', 'Midnight Slate (#0B1938)'],
    recommendedFor: 'Autonomous AI store agents, high-conversion shopping assistants, and next-gen retail commerce platforms.'
  },
  {
    id: 3,
    name: 'Concept 3: Futuristic AI Tech Emblem + Wordmark',
    style: 'Futuristic AI Tech Emblem & Growth Mark',
    image: modernEmblemImg,
    description: 'Modern 3D geometric AI emblem badge with luminous peach-to-solar orange neural ribbon, 4-point AI intelligence spark, paired with SilarAI ascending growth wordmark.',
    palette: ['Luminous Peach (#FCB666)', 'Solar Orange (#FF4500)', 'Midnight Navy (#0B1938)', 'Deep Plum (#584053)'],
    recommendedFor: 'Next-gen conversational commerce, autonomous AI store agents, and enterprise SaaS.'
  },
  {
    id: 4,
    name: 'Geometric Style 1: Hexagonal Facet Crystal S',
    style: 'Isometric 3D Hex Polygon Prism',
    image: sEmblemHexFacet,
    description: 'Sharp isometric hexagonal shield housing a multifaceted geometric S with high-refraction peach-300 light planes and deep plum-700 shadow contours.',
    palette: ['Deep Plum (#584053)', 'Warm Apricot Peach (#FCB666)', 'Coral Glow (#F97B4F)', 'Dark Midnight (#221720)'],
    recommendedFor: 'Enterprise intelligence, cryptographic commerce security, and high-performance financial AI.'
  },
  {
    id: 4,
    name: 'Geometric Style 2: Mobius Helix AI Ribbon',
    style: 'Aerodynamic Parametric Dual-Loop',
    image: sEmblemMobiusHelix,
    description: 'Continuous mathematical Mobius ribbon twisting in perpetual motion, blending deep plum-700 tones into radiant peach-300 highlights with glossy studio illumination.',
    palette: ['Radiant Peach (#FCB666)', 'Deep Plum (#584053)', 'Amber Gold (#FBBF24)', 'Pure White (#FFFFFF)'],
    recommendedFor: 'Omnichannel automation, continuous learning models, and dynamic marketplace optimization.'
  },
  {
    id: 5,
    name: 'Geometric Style 3: Cyber Matrix Grid S',
    style: 'Interlocking Neural Circuit Nodes',
    image: sEmblemCyberMatrix,
    description: 'Futuristic architectural S formed by precision angular circuit traces and glowing peach-300 neural dot nodes set against a dark plum-700 tech glass badge.',
    palette: ['Dark Tech Plum (#584053)', 'Glowing Neural Peach (#FCB666)', 'Midnight Slate (#0F172A)', 'Electric Coral (#FB7185)'],
    recommendedFor: 'Developer APIs, AI workflow orchestrations, and headless commerce architectures.'
  },
  {
    id: 6,
    name: 'Official SilarAI Brand Identity (Growth Arrow)',
    style: 'Official Modern Growth Logotype',
    image: growthLogoImg,
    description: 'High-contrast midnight navy Silar wordmark paired with vibrant stylized AI and a dynamic ascending growth arrow swoosh in fiery orange-to-golden amber gradient.',
    palette: ['Midnight Navy (#0B1938)', 'Fiery Orange (#FF4500)', 'Solar Amber (#FF8500)', 'Golden Yellow (#FFBA00)'],
    recommendedFor: 'Primary official brand logo across header, footer, marketing collateral, and investor decks.'
  },
  {
    id: 7,
    name: 'Official 3D Infinity Loop Gradient Identity',
    style: 'Vivid Iridescent 3D Infinity Ribbon',
    image: infinityLogoImg,
    description: 'Dynamic 3D infinity ribbon loop seamlessly flowing from electric cyan and deep royal blue into ultraviolet purple, sunset orange, and golden radiant yellow.',
    palette: ['Electric Cyan (#00d2ff)', 'Royal Blue (#0051ff)', 'Sunset Magenta (#e100ff)', 'Solar Orange (#ff5e00)', 'Golden Yellow (#ffaa00)'],
    recommendedFor: 'Primary official brand mark across web header, mobile app, and AI commerce platform.'
  }
];

export const LogoConceptsModal: React.FC<LogoConceptsModalProps> = ({
  isOpen,
  onClose,
  selectedLogoId = 1,
  onSelectLogo
}) => {
  const [activeLogoId, setActiveLogoId] = useState<number>(selectedLogoId);

  if (!isOpen) return null;

  const handleApply = (concept: typeof LOGO_DESIGNS[0]) => {
    setActiveLogoId(concept.id);
    if (onSelectLogo) {
      onSelectLogo(concept.id, concept.image);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden relative my-8">
        
        {/* Header Bar */}
        <div className="bg-plum-950 text-white p-6 sm:p-8 relative overflow-hidden border-b border-plum-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs tracking-wider uppercase border border-peach-300/30">
                <Palette className="w-3.5 h-3.5 text-peach-300" />
                Brand Identity Design Options
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                SilarAI Logo Concepts (5 Palette-Matched Designs)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Explore 5 custom logo designs matched strictly to SilarAI's color palette (Deep Plum <span className="inline-block w-2.5 h-2.5 rounded-full bg-plum-950 border border-white/40 align-middle"/>, Coral <span className="inline-block w-2.5 h-2.5 rounded-full bg-coral-400 align-middle"/>, Peach <span className="inline-block w-2.5 h-2.5 rounded-full bg-peach-300 align-middle"/>, and Mint Teal <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 align-middle"/>). Choose your preferred concept to update the app.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-8 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {LOGO_DESIGNS.map((concept) => {
              const isSelected = activeLogoId === concept.id;
              return (
                <div
                  key={concept.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-lg scale-[1.01]'
                      : 'border-slate-200 hover:border-plum-300 hover:shadow-md'
                  }`}
                >
                  <div className="p-5 space-y-4">
                    {/* Top Concept Title & Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-plum-950 text-teal-300 text-xs font-black flex items-center justify-center">
                          {concept.id}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {concept.name}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-plum-50 text-plum-700 border border-plum-100">
                        {concept.style}
                      </span>
                    </div>

                    {/* Image Preview Box */}
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9] group">
                      <img
                        src={concept.image}
                        alt={concept.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Selected Active Logo
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {concept.description}
                    </p>

                    {/* Palette Chips */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Color Palette Harmony:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {concept.palette.map((color, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 font-medium italic">
                      {concept.recommendedFor}
                    </span>

                    <button
                      onClick={() => handleApply(concept)}
                      className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-plum-950 hover:bg-plum-900 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-peach-300" />
                          <span>Active Logo</span>
                        </>
                      ) : (
                        <>
                          <span>Select Design {concept.id}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-peach-300" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Selecting a concept dynamically updates the header & footer logo image instantly.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
