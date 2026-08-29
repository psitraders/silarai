import React, { useState } from 'react';
import { X, Play, ChevronRight, ChevronLeft, Bot, ShoppingBag, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookDemo: () => void;
}

export const ProductTourModal: React.FC<ProductTourModalProps> = ({
  isOpen,
  onClose,
  onBookDemo,
}) => {
  const [tourStep, setTourStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: '1. AI Shopping Assistant Copilot',
      description: 'Engages shoppers with natural language conversational guidance, reads technical spec sheets, and resolves complex catalog questions instantly.',
      icon: <Bot className="w-6 h-6 text-blue-600" />,
      detail: 'Supports 30+ languages, WhatsApp threads, and custom intent recommendation triggers.',
    },
    {
      title: '2. AI Commerce & Marketing Platform',
      description: 'Build, manage, market, and grow your online business from one platform. Launch your ecommerce store, create AI-powered marketing campaigns, publish to Instagram, Facebook, and WhatsApp, and manage customers from a single dashboard.',
      icon: <ShoppingBag className="w-6 h-6 text-peach-300" />,
      detail: 'Commerce + AI Shopping + AI Marketing in one unified dashboard.',
    },
    {
      title: '3. Real-Time ERP & Business Integrations',
      description: 'Native 2-way connectors for SAP, Salesforce, Microsoft Dynamics, Shopify, WooCommerce, and HubSpot.',
      icon: <Layers className="w-6 h-6 text-sky-600" />,
      detail: 'Instant inventory synchronization and customer tier contract rule enforcement.',
    },
    {
      title: '4. AI Commerce Intelligence & Analytics',
      description: 'Gain real-time insights into buyer behavior, customer search intent gaps, revenue trends, and conversion performance.',
      icon: <Sparkles className="w-6 h-6 text-peach-300" />,
      detail: 'Automated revenue optimization recommendations and buyer segmentation analytics.',
    },
  ];

  const currentStep = tourSteps[tourStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-plum-950 text-white rounded-saas p-6 sm:p-8 max-w-2xl w-full border border-plum-800 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-plum-300 hover:text-white rounded-xl hover:bg-plum-900 transition-colors"
          aria-label="Close product tour modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-plum-700 flex items-center justify-center text-peach-300">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <span className="text-xs font-extrabold uppercase text-peach-300 tracking-wider">
            Interactive Product Tour ({tourStep + 1} / {tourSteps.length})
          </span>
        </div>

        {/* Step Content */}
        <div className="bg-plum-900/90 p-6 rounded-2xl border border-plum-800 mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-plum-950 flex items-center justify-center text-peach-300 border border-plum-800">
              {currentStep.icon}
            </div>
            <h3 className="text-xl font-extrabold text-white">{currentStep.title}</h3>
          </div>

          <p className="text-sm text-plum-100 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="bg-plum-950 p-3 rounded-xl border border-plum-800 text-xs text-peach-200 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-peach-300 shrink-0" />
            <span>{currentStep.detail}</span>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setTourStep(Math.max(0, tourStep - 1))}
            disabled={tourStep === 0}
            className="px-4 py-2 text-xs font-bold text-plum-200 hover:text-white bg-plum-900 hover:bg-plum-800 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {tourStep < tourSteps.length - 1 ? (
            <button
              onClick={() => setTourStep(tourStep + 1)}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-plum-700 hover:bg-plum-600 rounded-xl transition-colors flex items-center gap-1 shadow-md border border-plum-600"
            >
              Next Feature <ChevronRight className="w-4 h-4 text-peach-300" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onBookDemo();
              }}
              className="px-6 py-2.5 text-xs font-extrabold text-plum-950 bg-peach-300 hover:bg-peach-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
            >
              Book Full Live Demo <Sparkles className="w-4 h-4 text-plum-900" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
