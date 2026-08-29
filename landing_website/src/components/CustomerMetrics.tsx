import React from 'react';
import { KPI_METRICS } from '../data/content';
import { TrendingUp, Users, Zap, Award } from 'lucide-react';

export const CustomerMetrics: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-plum-950 text-white relative overflow-hidden">
      {/* Background Subtle Accent Pattern */}
      <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest bg-peach-300 text-plum-950 px-3.5 py-1.5 rounded-full border border-peach-400">
            Proven Industry Outcomes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            Impact That Speaks For Itself
          </h2>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {KPI_METRICS.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-plum-900/90 backdrop-blur-md rounded-saas p-6 border border-plum-800 hover:border-peach-300/50 transition-all text-center flex flex-col justify-between shadow-xl"
            >
              <div>
                <span className="inline-block text-xs font-extrabold text-peach-300 uppercase tracking-wider bg-plum-800 px-2.5 py-1 rounded-md mb-3 border border-plum-700">
                  {kpi.growth}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-peach-300 tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-base font-bold text-white mt-2">
                  {kpi.label}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-plum-800 text-xs text-plum-200">
                {kpi.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
