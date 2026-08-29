import React, { useState } from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/content';
import { UploadCloud, Cpu, Rocket, Bot, TrendingUp, ChevronRight, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'UploadCloud':
        return <UploadCloud className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5" />;
      case 'Bot':
        return <Bot className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <UploadCloud className="w-5 h-5" />;
    }
  };

  const currentStepObj = HOW_IT_WORKS_STEPS.find((s) => s.stepNumber === activeStep) || HOW_IT_WORKS_STEPS[0];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400">
            Implementation Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How SilarAI Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            From raw product data to intelligent AI sales guidance in 5 simple steps.
          </p>
        </div>

        {/* Horizontal Timeline Bar */}
        <div className="relative mb-12">
          {/* Connecting Line behind steps */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step) => {
              const isSelected = activeStep === step.stepNumber;
              const isPassed = activeStep > step.stepNumber;

              return (
                <button
                  key={step.stepNumber}
                  onClick={() => setActiveStep(step.stepNumber)}
                  className={`p-4 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between gap-3 group relative ${
                    isSelected
                      ? 'bg-plum-700 text-white border-plum-700 shadow-lg shadow-plum-900/20 scale-105'
                      : isPassed
                      ? 'bg-peach-100 text-plum-950 border-peach-300 hover:border-peach-400 font-semibold'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? 'bg-peach-300 text-plum-950 font-black'
                          : isPassed
                          ? 'bg-plum-700 text-peach-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {getStepIcon(step.icon)}
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? 'text-peach-200' : 'text-slate-400'
                      }`}
                    >
                      Step 0{step.stepNumber}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold leading-tight ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Details Spotlight */}
        <div className="bg-plum-950 text-white rounded-saas p-6 sm:p-8 border border-plum-800 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-plum-700 text-peach-300 font-black text-xl flex items-center justify-center shrink-0 shadow-lg shadow-plum-950/50 border border-plum-600">
              {currentStepObj.stepNumber}
            </div>
            <div>
              <div className="text-xs font-extrabold text-peach-300 uppercase tracking-widest mb-1">
                Phase {currentStepObj.stepNumber} of 5
              </div>
              <h4 className="text-xl font-extrabold text-white mb-1">
                {currentStepObj.title}
              </h4>
              <p className="text-sm text-plum-200 leading-relaxed">
                {currentStepObj.detailText}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {currentStepObj.stepNumber < 5 && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-5 py-2.5 text-xs font-extrabold text-plum-950 bg-peach-300 hover:bg-peach-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4 text-plum-900" />
              </button>
            )}
            {currentStepObj.stepNumber === 5 && (
              <div className="text-xs font-extrabold text-plum-950 bg-peach-300 px-4 py-2 rounded-xl border border-peach-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-plum-900" /> Live Selling Ready
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
