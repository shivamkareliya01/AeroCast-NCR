import { useState, useEffect } from 'react'
import {
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import {
  runPolicySimulation,
  SimulationParams,
  SimulationResult,
  FALLBACK_SIMULATION
} from '../api/client'

export default function PolicySimulatorPage() {
  const [params, setParams] = useState<SimulationParams>({
    stubble_reduction_pct: 40,
    traffic_curb_pct: 25,
    construction_ban_pct: 50,
    industrial_curb_pct: 20
  })

  const [result, setResult] = useState<SimulationResult>(FALLBACK_SIMULATION)
  const [loading, setLoading] = useState(false)
  const [activePreset, setActivePreset] = useState<string>('custom')

  const executeSimulation = async (newParams: SimulationParams) => {
    setLoading(true)
    try {
      const res = await runPolicySimulation(newParams)
      setResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    executeSimulation(params)
  }, [])

  const handleSliderChange = (field: keyof SimulationParams, val: number) => {
    const updated = { ...params, [field]: val }
    setParams(updated)
    setActivePreset('custom')
    executeSimulation(updated)
  }

  const applyPreset = (presetName: string) => {
    setActivePreset(presetName)
    let p: SimulationParams = { ...params }
    if (presetName === 'grap_3') {
      p = { stubble_reduction_pct: 20, traffic_curb_pct: 25, construction_ban_pct: 60, industrial_curb_pct: 30 }
    } else if (presetName === 'grap_4') {
      p = { stubble_reduction_pct: 50, traffic_curb_pct: 45, construction_ban_pct: 80, industrial_curb_pct: 40 }
    } else if (presetName === 'zero_burn') {
      p = { stubble_reduction_pct: 80, traffic_curb_pct: 10, construction_ban_pct: 15, industrial_curb_pct: 10 }
    } else if (presetName === 'reset') {
      p = { stubble_reduction_pct: 0, traffic_curb_pct: 0, construction_ban_pct: 0, industrial_curb_pct: 0 }
    }
    setParams(p)
    executeSimulation(p)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderSubtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-textMuted uppercase tracking-wider mb-1">
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-[#0ea5e9]" />
            <span>CAQM & CPCB Decision Support</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-textMain">
            GRAP Policy Intervention Simulator
          </h1>
          <p className="text-[13px] text-textMuted mt-1 max-w-2xl">
            Simulate administrative and regional emission curtailments to project real-time air quality recovery and GRAP stage de-escalation across Delhi NCR.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('grap_3')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              activePreset === 'grap_3'
                ? 'bg-textMain text-surface shadow-sm'
                : 'bg-surface border border-borderSubtle text-textMain hover:bg-[#f4f4f5]'
            }`}
          >
            GRAP Stage III
          </button>
          <button
            onClick={() => applyPreset('grap_4')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              activePreset === 'grap_4'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'bg-surface border border-borderSubtle text-textMain hover:bg-[#f4f4f5]'
            }`}
          >
            GRAP Stage IV Emergency
          </button>
          <button
            onClick={() => applyPreset('zero_burn')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              activePreset === 'zero_burn'
                ? 'bg-[#16a34a] text-white shadow-sm'
                : 'bg-surface border border-borderSubtle text-textMain hover:bg-[#f4f4f5]'
            }`}
          >
            Strict Zero-Burn
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-surface border border-borderSubtle text-textMuted hover:text-textMain hover:bg-[#f4f4f5]"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 inline mr-1" />
            Reset
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-borderSubtle rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-textMuted uppercase tracking-wider">
            Peak PM2.5 Reduction
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#16a34a]">
              -{result.summary.net_pm25_reduction}
            </span>
            <span className="text-[13px] text-textMuted">µg/m³</span>
          </div>
          <div className="text-[12px] text-textMuted">
            {result.summary.percent_pm25_reduction}% drop from baseline peak ({result.summary.baseline_peak_pm25} µg/m³)
          </div>
        </div>

        <div className="bg-surface border border-borderSubtle rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-textMuted uppercase tracking-wider">
            Daily PM2.5 Mass Avoided
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#0284c7]">
              {result.summary.estimated_pm_tons_avoided_daily}
            </span>
            <span className="text-[13px] text-textMuted">Metric Tons / Day</span>
          </div>
          <div className="text-[12px] text-textMuted">
            Avoided toxic aerosol burden across NCR
          </div>
        </div>

        <div className="bg-surface border border-borderSubtle rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-textMuted uppercase tracking-wider">
            GRAP De-escalation
          </div>
          <div className="text-lg font-medium text-textMain truncate">
            {result.summary.simulated_grap_stage}
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            {result.summary.de_escalation_achieved ? (
              <span className="text-[#16a34a] font-medium flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4" /> De-escalation Achieved
              </span>
            ) : (
              <span className="text-[#f59e0b] font-medium">Stage Remains Unchanged</span>
            )}
          </div>
        </div>

        <div className="bg-surface border border-borderSubtle rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-[11px] font-medium text-textMuted uppercase tracking-wider">
            Effective Emission Curb
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-textMain">
              {result.interventions_applied.composite_effective_reduction_pct}%
            </span>
          </div>
          <div className="text-[12px] text-textMuted">
            Coupled source-apportioned reduction
          </div>
        </div>
      </div>

      {/* Main Grid: Sliders on Left, Charts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Panel */}
        <div className="lg:col-span-5 bg-surface border border-borderSubtle rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
            <h2 className="text-[15px] font-medium text-textMain">
              Intervention Controls
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f4f5] text-textMuted font-mono">
              Coupled Physics
            </span>
          </div>

          {/* Slider 1: Stubble Burning */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-medium text-textMain flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                Upwind Stubble Fire Curb
              </span>
              <span className="font-semibold text-textMain font-mono">
                {params.stubble_reduction_pct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={params.stubble_reduction_pct}
              onChange={(e) => handleSliderChange('stubble_reduction_pct', Number(e.target.value))}
              className="w-full accent-textMain cursor-pointer h-1.5 bg-[#e4e4e7] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-textMuted">
              <span>Status Quo (0%)</span>
              <span>Regional Zero-Burn (80%)</span>
            </div>
            <p className="text-[11px] text-textMuted leading-relaxed">
              Targeted satellite enforcement in Punjab & Haryana clusters along 315° wind corridor.
            </p>
          </div>

          {/* Slider 2: Vehicular Traffic */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-medium text-textMain flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                Vehicular Emission Reduction
              </span>
              <span className="font-semibold text-textMain font-mono">
                {params.traffic_curb_pct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.traffic_curb_pct}
              onChange={(e) => handleSliderChange('traffic_curb_pct', Number(e.target.value))}
              className="w-full accent-textMain cursor-pointer h-1.5 bg-[#e4e4e7] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-textMuted">
              <span>0% (Unrestricted)</span>
              <span>50% (Odd-Even + Truck Bans)</span>
            </div>
            <p className="text-[11px] text-textMuted leading-relaxed">
              BS-IV diesel restrictions, municipal fleet electrification, and private vehicle rationing.
            </p>
          </div>

          {/* Slider 3: Construction & Dust */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-medium text-textMain flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                Construction & Dust Suppression
              </span>
              <span className="font-semibold text-textMain font-mono">
                {params.construction_ban_pct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={params.construction_ban_pct}
              onChange={(e) => handleSliderChange('construction_ban_pct', Number(e.target.value))}
              className="w-full accent-textMain cursor-pointer h-1.5 bg-[#e4e4e7] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-textMuted">
              <span>0% (Full Activity)</span>
              <span>60% (Complete Civil Moratorium)</span>
            </div>
            <p className="text-[11px] text-textMuted leading-relaxed">
              Anti-smog guns, mechanical road sweeping, and construction moratorium.
            </p>
          </div>

          {/* Slider 4: Industrial Curbs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="font-medium text-textMain flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                Industrial & Brick Kiln Curbs
              </span>
              <span className="font-semibold text-textMain font-mono">
                {params.industrial_curb_pct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={params.industrial_curb_pct}
              onChange={(e) => handleSliderChange('industrial_curb_pct', Number(e.target.value))}
              className="w-full accent-textMain cursor-pointer h-1.5 bg-[#e4e4e7] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-textMuted">
              <span>0% (Standard)</span>
              <span>40% (Non-PNG Industry Shutdown)</span>
            </div>
            <p className="text-[11px] text-textMuted leading-relaxed">
              Mandatory fuel transitions, brick kiln closures, and thermal plant load shifting.
            </p>
          </div>

          <div className="p-3.5 bg-[#fafafa] border border-borderSubtle rounded-xl text-[12px] text-textMuted flex items-start gap-2.5">
            <InformationCircleIcon className="w-4 h-4 text-textMuted shrink-0 mt-0.5" />
            <span>
              Atmospheric stagnation imposes a physical bound on dispersion. Even under maximum restrictions, background dust and nocturnal inversions require 6–18 hours to dilute.
            </span>
          </div>
        </div>

        {/* Right Panel: Charts and Trajectory */}
        <div className="lg:col-span-7 space-y-6">
          {/* Comparison Line Chart */}
          <div className="bg-surface border border-borderSubtle rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-medium text-textMain">
                  72-Hour PM2.5 Trajectory: Baseline vs. Simulated
                </h3>
                <p className="text-[12px] text-textMuted">
                  Real-time predicted atmospheric response across Delhi NCR
                </p>
              </div>
              <div className="flex items-center gap-4 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#dc2626] inline-block"></span>
                  <span className="text-textMuted">Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#16a34a] inline-block"></span>
                  <span className="text-textMain font-medium">With Policy</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.simulated_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} unit="µg" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-borderSubtle p-3 rounded-xl shadow-lg text-[12px] space-y-1">
                          <div className="font-semibold text-textMain">{d.horizon} ({d.timestamp})</div>
                          <div className="text-[#dc2626]">Baseline PM2.5: {d.baseline_pm25} µg/m³ (AQI: {d.baseline_aqi})</div>
                          <div className="text-[#16a34a] font-medium">Simulated PM2.5: {d.simulated_pm25} µg/m³ (AQI: {d.simulated_aqi})</div>
                          <div className="text-[#0284c7] font-medium">Avoided: -{d.pm25_avoided} µg/m³</div>
                        </div>
                      )
                    }}
                  />
                  <Line type="monotone" dataKey="baseline_pm25" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Baseline" />
                  <Line type="monotone" dataKey="simulated_pm25" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} name="Simulated Policy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Avoided PM2.5 Area Chart */}
          <div className="bg-surface border border-borderSubtle rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-[15px] font-medium text-textMain">
                Net Particulate Mass Avoided Over Time
              </h3>
              <p className="text-[12px] text-textMuted">
                Hourly particulate concentration reduction achieved by active curbs
              </p>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.simulated_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="avoidedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={{ stroke: '#e4e4e7' }} unit="µg" />
                  <Tooltip />
                  <Area type="monotone" dataKey="pm25_avoided" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#avoidedGrad)" name="PM2.5 Avoided (µg/m³)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
