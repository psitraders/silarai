import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Percent, 
  Sparkles, 
  ArrowUpRight, 
  BarChart3, 
  LineChart as LineChartIcon, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  ChevronRight
} from 'lucide-react';

interface RoiCalculatorProps {
  onBookDemo?: (customPlanText?: string) => void;
}

// Preset store profiles
const PRESETS = [
  {
    name: 'Emerging Brand',
    traffic: 15000,
    aov: 65,
    conversionRate: 1.8,
    uplift: 20,
    aovBoost: 8,
  },
  {
    name: 'Growing Store',
    traffic: 50000,
    aov: 85,
    conversionRate: 2.2,
    uplift: 25,
    aovBoost: 12,
  },
  {
    name: 'Scale-Up Merchant',
    traffic: 150000,
    aov: 120,
    conversionRate: 2.6,
    uplift: 30,
    aovBoost: 15,
  },
  {
    name: 'Enterprise Brand',
    traffic: 500000,
    aov: 160,
    conversionRate: 3.2,
    uplift: 35,
    aovBoost: 18,
  },
];

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onBookDemo }) => {
  // Input States
  const [traffic, setTraffic] = useState<number>(50000);
  const [aov, setAov] = useState<number>(85);
  const [conversionRate, setConversionRate] = useState<number>(2.2);
  const [uplift, setUplift] = useState<number>(25); // % improvement in conversion
  const [aovBoost, setAovBoost] = useState<number>(10); // % boost in AOV from AI recommendations

  // View States
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [timeframeMonths, setTimeframeMonths] = useState<number>(6);
  const [activePreset, setActivePreset] = useState<string>('Growing Store');

  // Apply Preset
  const applyPreset = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.name);
    setTraffic(preset.traffic);
    setAov(preset.aov);
    setConversionRate(preset.conversionRate);
    setUplift(preset.uplift);
    setAovBoost(preset.aovBoost);
  };

  // Calculations
  const metrics = useMemo(() => {
    // Current Baseline
    const currentMonthlyOrders = Math.round(traffic * (conversionRate / 100));
    const currentMonthlyRevenue = currentMonthlyOrders * aov;

    // Projected with SilarAI
    const newConversionRate = conversionRate * (1 + uplift / 100);
    const newAov = aov * (1 + aovBoost / 100);
    const projectedMonthlyOrders = Math.round(traffic * (newConversionRate / 100));
    const projectedMonthlyRevenue = projectedMonthlyOrders * newAov;

    // Lift
    const monthlyLift = Math.max(0, projectedMonthlyRevenue - currentMonthlyRevenue);
    const annualLift = monthlyLift * 12;
    const additionalOrders = projectedMonthlyOrders - currentMonthlyOrders;

    // Estimated Plan Cost based on traffic
    let estimatedCost = 50; // Growth plan
    if (traffic > 100000) estimatedCost = 199;
    if (traffic > 300000) estimatedCost = 499;

    const netMonthlyGain = monthlyLift - estimatedCost;
    const roiMultiplier = estimatedCost > 0 ? (monthlyLift / estimatedCost).toFixed(1) : '0';

    return {
      currentMonthlyOrders,
      currentMonthlyRevenue,
      newConversionRate,
      newAov,
      projectedMonthlyOrders,
      projectedMonthlyRevenue,
      monthlyLift,
      annualLift,
      additionalOrders,
      estimatedCost,
      netMonthlyGain,
      roiMultiplier,
    };
  }, [traffic, aov, conversionRate, uplift, aovBoost]);

  // Generate chart data series over time
  const chartData = useMemo(() => {
    const data = [];
    let cumulativeBaseline = 0;
    let cumulativeProjected = 0;
    let cumulativeLift = 0;

    for (let month = 1; month <= timeframeMonths; month++) {
      // Small ramp up factor for SilarAI implementation over first 2 months
      const rampFactor = month === 1 ? 0.75 : month === 2 ? 0.9 : 1.0;
      const monthLift = Math.round(metrics.monthlyLift * rampFactor);
      const monthBaseline = Math.round(metrics.currentMonthlyRevenue);
      const monthProjected = monthBaseline + monthLift;

      cumulativeBaseline += monthBaseline;
      cumulativeProjected += monthProjected;
      cumulativeLift += monthLift;

      data.push({
        month: `Month ${month}`,
        shortMonth: `M${month}`,
        baseline: monthBaseline,
        lift: monthLift,
        projected: monthProjected,
        cumulativeLift,
        cumulativeProjected,
      });
    }
    return data;
  }, [timeframeMonths, metrics]);

  // Currency Formatter Helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Number Formatter Helper
  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          id="roi-chart-tooltip" 
          className="bg-plum-950 text-white p-3.5 rounded-xl border border-plum-700 shadow-xl text-xs space-y-2 max-w-xs"
        >
          <div className="font-black text-peach-300 border-b border-plum-800 pb-1 flex justify-between items-center">
            <span>{label} Projection</span>
            <span className="text-[10px] bg-plum-800 text-plum-200 px-2 py-0.5 rounded font-mono">
              +{uplift}% Conv. Lift
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                Baseline Revenue:
              </span>
              <span className="font-bold text-white">{formatCurrency(data.baseline)}</span>
            </div>
            <div className="flex justify-between items-center text-peach-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-peach-300 inline-block"></span>
                Monthly Revenue Lift:
              </span>
              <span className="font-black text-emerald-400">+{formatCurrency(data.lift)}</span>
            </div>
            <div className="flex justify-between items-center text-white pt-1 border-t border-plum-800 font-extrabold">
              <span>Total Projected:</span>
              <span className="text-peach-300">{formatCurrency(data.projected)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="roi-calculator-container" className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden my-8">
      {/* Header Banner */}
      <div id="roi-calculator-header" className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial-glow opacity-30 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-800/80 border border-plum-700 text-peach-300 text-xs font-black uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5 text-peach-300" />
              Interactive SilarAI Revenue Calculator
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Estimate Your Potential Monthly Revenue Lift
            </h3>
            <p className="text-xs sm:text-sm text-plum-200 max-w-2xl font-medium leading-relaxed">
              Adjust your monthly traffic, current conversion rate, and average order value to see how SilarAI's agentic shopping engine accelerates top-line growth.
            </p>
          </div>

          {/* Quick ROI Badge */}
          <div className="shrink-0 bg-plum-900/90 border border-plum-700/80 p-4 rounded-2xl text-center md:text-right flex md:flex-col justify-between items-center md:items-end gap-3 shadow-inner">
            <div>
              <div className="text-[10px] font-black uppercase text-plum-300 tracking-wider">
                Estimated ROI Multiplier
              </div>
              <div className="text-2xl sm:text-3xl font-black text-peach-300 flex items-center gap-1 justify-center md:justify-end">
                <span>{metrics.roiMultiplier}x</span>
                <Sparkles className="w-5 h-5 text-peach-300" />
              </div>
            </div>
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{formatCurrency(metrics.monthlyLift)} / mo</span>
            </div>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-6 pt-4 border-t border-plum-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-plum-300 mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-peach-300" />
            Quick Store Profiles:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              id={`preset-btn-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                activePreset === preset.name
                  ? 'bg-peach-300 text-plum-950 shadow-sm font-extrabold'
                  : 'bg-plum-900/80 hover:bg-plum-800 text-plum-200 border border-plum-800'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Left Controls & Right Visual Chart */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Inputs (5 cols) */}
        <div id="roi-controls-column" className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-plum-700" />
              Your Store Inputs
            </h4>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Live Recalculation
            </span>
          </div>

          <div className="space-y-5">
            {/* Input 1: Monthly Traffic */}
            <div id="control-monthly-traffic" className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="traffic-range-input" className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  Monthly Store Visitors
                </label>
                <div className="font-black text-plum-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-mono">
                  {formatNumber(traffic)}
                </div>
              </div>
              <input
                id="traffic-range-input"
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={traffic}
                onChange={(e) => {
                  setActivePreset('');
                  setTraffic(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-plum-950"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>5k / mo</span>
                <span>250k / mo</span>
                <span>500k+ / mo</span>
              </div>
            </div>

            {/* Input 2: Average Order Value (AOV) */}
            <div id="control-average-order-value" className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="aov-range-input" className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  Average Order Value (AOV)
                </label>
                <div className="font-black text-plum-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-mono">
                  ${aov}
                </div>
              </div>
              <input
                id="aov-range-input"
                type="range"
                min="10"
                max="500"
                step="5"
                value={aov}
                onChange={(e) => {
                  setActivePreset('');
                  setAov(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-plum-950"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>$10</span>
                <span>$250</span>
                <span>$500</span>
              </div>
            </div>

            {/* Input 3: Current Conversion Rate */}
            <div id="control-conversion-rate" className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="cr-range-input" className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                  Current Conversion Rate
                </label>
                <div className="font-black text-plum-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-mono">
                  {conversionRate}%
                </div>
              </div>
              <input
                id="cr-range-input"
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={conversionRate}
                onChange={(e) => {
                  setActivePreset('');
                  setConversionRate(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-plum-950"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0.5%</span>
                <span>3.0%</span>
                <span>6.0%</span>
              </div>
            </div>

            {/* Input 4: Expected AI Conversion Uplift */}
            <div id="control-ai-uplift" className="space-y-2 bg-peach-50/70 p-3.5 rounded-2xl border border-peach-200">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="uplift-range-input" className="font-extrabold text-plum-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-coral-500" />
                  SilarAI Conversion Uplift (%)
                </label>
                <div className="font-black text-plum-950 bg-peach-300 px-2.5 py-1 rounded-lg border border-peach-400 shadow-2xs font-mono">
                  +{uplift}%
                </div>
              </div>
              <input
                id="uplift-range-input"
                type="range"
                min="10"
                max="50"
                step="5"
                value={uplift}
                onChange={(e) => setUplift(Number(e.target.value))}
                className="w-full h-2 bg-peach-200 rounded-lg appearance-none cursor-pointer accent-plum-950"
              />
              <div className="flex justify-between text-[10px] text-plum-900 font-bold">
                <span>10% (Conservative)</span>
                <span>25% (Benchmark)</span>
                <span>50% (High Growth)</span>
              </div>
            </div>

            {/* Input 5: AI Cross-sell AOV Boost */}
            <div id="control-aov-boost" className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="aovboost-range-input" className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-slate-500" />
                  AI Recommendation AOV Boost (%)
                </label>
                <div className="font-black text-plum-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-mono">
                  +{aovBoost}%
                </div>
              </div>
              <input
                id="aovboost-range-input"
                type="range"
                min="0"
                max="25"
                step="1"
                value={aovBoost}
                onChange={(e) => setAovBoost(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-plum-950"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0% (Standard)</span>
                <span>10% (Cross-selling)</span>
                <span>25% (Bundling)</span>
              </div>
            </div>
          </div>

          {/* Core Calculated Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div id="metric-card-current-revenue" className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Current Monthly
              </div>
              <div className="text-lg font-black text-slate-900">
                {formatCurrency(metrics.currentMonthlyRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {formatNumber(metrics.currentMonthlyOrders)} orders/mo
              </div>
            </div>

            <div id="metric-card-lift-revenue" className="p-3.5 bg-plum-950 text-white rounded-2xl border border-plum-800 space-y-1 shadow-md">
              <div className="text-[10px] font-black uppercase tracking-wider text-peach-300">
                Potential Monthly Lift
              </div>
              <div className="text-xl font-black text-emerald-400">
                +{formatCurrency(metrics.monthlyLift)}
              </div>
              <div className="text-[11px] text-plum-200 font-medium">
                +{formatNumber(metrics.additionalOrders)} extra orders/mo
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual D3 & Recharts Chart Component (7 cols) */}
        <div id="roi-chart-column" className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* Chart Controls & Header */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-plum-700" />
                Revenue Lift Visual Projection
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Interactive graph powered by Recharts &amp; D3 mathematical model
              </p>
            </div>

            {/* Controls: Timeframe & Chart Type Toggle */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Timeframe Selector */}
              <div id="chart-timeframe-selector" className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    id={`timeframe-btn-${m}m`}
                    onClick={() => setTimeframeMonths(m)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      timeframeMonths === m
                        ? 'bg-plum-950 text-white font-extrabold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>

              {/* Chart Type Selector */}
              <div id="chart-type-selector" className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
                <button
                  id="chart-type-area"
                  onClick={() => setChartType('area')}
                  title="Area Chart"
                  className={`p-1.5 rounded-lg transition-all ${
                    chartType === 'area'
                      ? 'bg-plum-950 text-peach-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  id="chart-type-bar"
                  onClick={() => setChartType('bar')}
                  title="Bar Chart"
                  className={`p-1.5 rounded-lg transition-all ${
                    chartType === 'bar'
                      ? 'bg-plum-950 text-peach-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  id="chart-type-line"
                  onClick={() => setChartType('line')}
                  title="Line Chart"
                  className={`p-1.5 rounded-lg transition-all ${
                    chartType === 'line'
                      ? 'bg-plum-950 text-peach-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LineChartIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Visual Recharts Render Box */}
          <div id="roi-recharts-wrapper" className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs min-h-[320px] flex flex-col justify-center relative">
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorLift" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FCB666" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FCB666" stopOpacity={0.15} />
                      </linearGradient>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#584053" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#584053" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey={timeframeMonths > 6 ? "shortMonth" : "month"} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      tickFormatter={(val) => `$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 'bold' }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="baseline" 
                      name="Current Baseline Revenue" 
                      stroke="#64748b" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorBaseline)" 
                      stackId="1"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lift" 
                      name="SilarAI Monthly Revenue Lift" 
                      stroke="#FCB666" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLift)" 
                      stackId="1"
                    />
                  </AreaChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey={timeframeMonths > 6 ? "shortMonth" : "month"} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      tickFormatter={(val) => `$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                    <Bar dataKey="baseline" name="Current Baseline Revenue" fill="#94a3b8" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="lift" name="SilarAI Monthly Revenue Lift" fill="#584053" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey={timeframeMonths > 6 ? "shortMonth" : "month"} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      tickFormatter={(val) => `$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="baseline" name="Current Baseline Revenue" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="projected" name="Projected Total Revenue" stroke="#584053" strokeWidth={3} dot={{ r: 5, fill: '#FCB666' }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Summary Stats Banner */}
          <div id="roi-summary-banner" className="bg-gradient-to-r from-plum-900 to-plum-950 text-white p-5 rounded-2xl border border-plum-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-[10px] font-black uppercase text-peach-300 tracking-wider">
                {timeframeMonths}-Month Projected Cumulative Lift
              </div>
              <div className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                <span>+{formatCurrency(metrics.monthlyLift * timeframeMonths)}</span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  +{((metrics.monthlyLift / metrics.currentMonthlyRevenue) * 100).toFixed(0)}% Total Growth
                </span>
              </div>
              <p className="text-[11px] text-plum-200">
                Estimated Annual Impact: <strong className="text-white font-bold">{formatCurrency(metrics.annualLift)}</strong> additional revenue
              </p>
            </div>

            <button
              id="roi-book-demo-btn"
              onClick={() => {
                const summary = `ROI Projection: Traffic ${formatNumber(traffic)}/mo, Lift +${formatCurrency(metrics.monthlyLift)}/mo (+${metrics.annualLift}/yr)`;
                if (onBookDemo) {
                  onBookDemo(summary);
                }
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-2 group"
            >
              <span>Get Demo with These Projections</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
