import { useState, useEffect } from 'react'
import {
  BellIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import {
  fetchExtremeRisk,
  ExtremeRiskData,
  FALLBACK_EXTREME_RISK,
  AlertsHistoryData
} from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  alerts: AlertsHistoryData | null
  loading: boolean
}

type PersonaKey = 'athletes' | 'asthmatic' | 'children' | 'commuters'

export default function AlertsPage({ alerts, loading }: Props) {
  const [extremeRisk, setExtremeRisk] = useState<ExtremeRiskData>(FALLBACK_EXTREME_RISK)
  const [selectedPersona, setSelectedPersona] = useState<PersonaKey>('asthmatic')

  useEffect(() => {
    fetchExtremeRisk().then(setExtremeRisk).catch(() => setExtremeRisk(FALLBACK_EXTREME_RISK))
  }, [])

  const personas = {
    athletes: {
      title: "Outdoor Athletes & Runners",
      icon: "🏃",
      badgeColor: "#f59e0b",
      riskLevel: "High Respiratory Stress",
      inhalationMultiplier: "3.5x Normal Dosage",
      advice: "Postpone intense outdoor runs and interval training. Exercise indoors in spaces with HEPA filtration.",
      optimalWindow: "2:00 PM – 4:00 PM (Boundary layer dilution peak; avoid early mornings)"
    },
    asthmatic: {
      title: "Asthmatic & Cardiac Patients",
      icon: "🫁",
      badgeColor: "#dc2626",
      riskLevel: "Severe Vulnerability",
      inhalationMultiplier: "Elevated Bronchospasm Trigger",
      advice: "Keep rescue inhalers accessible at all times. Avoid stepping outdoors during morning ground temperature inversions.",
      optimalWindow: "Remain indoors; run air purifiers on high fan speed"
    },
    children: {
      title: "Children & Elderly Citizens",
      icon: "👶",
      badgeColor: "#dc2626",
      riskLevel: "Critical Sensitivity",
      inhalationMultiplier: "Developing Alveoli Exposure",
      advice: "Suspend all outdoor sports activities and physical education in primary and middle schools.",
      optimalWindow: "Midday sun window only (1:00 PM – 3:30 PM) with certified N95 masks"
    },
    commuters: {
      title: "Daily Highway Commuters",
      icon: "🚲",
      badgeColor: "#0284c7",
      riskLevel: "Moderate to Heavy Exhaust Exposure",
      inhalationMultiplier: "High Direct Particulate Trapping",
      advice: "Keep car ventilation on recirculate mode. Use metro corridors over open expressways during peak rush hours.",
      optimalWindow: "Travel between 12:30 PM and 3:30 PM if schedule permits"
    }
  }

  const currentPersona = personas[selectedPersona]

  const alertItems = alerts?.forecast_alerts ?? [
    {
      horizon: "+24h",
      timestamp: "2026-09-25 22:00",
      aqi: 335,
      category: "Very Poor",
      color: "#f97316",
      alert_level: "STAGE-III GRAP",
      pm25: 165,
      explanation: "Predicted AQI > 300 due to stagnant surface winds and shallow planetary boundary layer."
    },
    {
      horizon: "+48h",
      timestamp: "2026-09-26 22:00",
      aqi: 360,
      category: "Very Poor",
      color: "#f97316",
      alert_level: "STAGE-III GRAP",
      pm25: 198,
      explanation: "Continued high smoke trapping in NCR with persistent nocturnal thermal inversion."
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderSubtle pb-6">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-textMuted uppercase tracking-wider mb-1">
            <BellIcon className="w-4 h-4 text-[#0ea5e9]" />
            <span>Statutory Warning Matrix</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-textMain">
            CPCB Early Warning Network & Extreme Risk Triggers
          </h1>
          <p className="text-[13px] text-textMuted mt-1">
            Real-time GRAP Stage protocols, probability of emergency smog episodes, and personalized health advisories.
          </p>
        </div>
      </div>

      {/* Extreme Risk Alert Banner */}
      <div className="bg-surface border-2 border-[#dc2626] rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fee2e2] flex items-center justify-center text-[#dc2626] shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest px-2 py-0.5 rounded bg-[#dc2626] text-white uppercase">
                  {extremeRisk.extreme_risk_level}
                </span>
                <span className="text-[12px] text-textMuted font-mono">
                  24–48h Forecast Spike Window
                </span>
              </div>
              <h2 className="text-lg font-semibold text-textMain mt-1">
                {extremeRisk.probability_severe_plus_24h}% Probability of Entering Severe+ / Emergency Threshold
              </h2>
              <p className="text-[13px] text-textMuted mt-0.5">
                {extremeRisk.recommended_grap_stage}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] uppercase font-bold text-textMuted">Risk Probability</span>
            <span className="text-3xl font-extrabold text-[#dc2626]">{extremeRisk.probability_severe_plus_24h}%</span>
          </div>
        </div>

        {/* Triggers & Protocols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-borderSubtle text-[12px]">
          <div className="space-y-1.5">
            <span className="font-semibold text-textMain block">Active Environmental Triggers:</span>
            <ul className="space-y-1 text-textMuted">
              {extremeRisk.triggers.map((trig, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>
                  <span>{trig}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <span className="font-semibold text-textMain block">Mandatory Emergency Protocols:</span>
            <ul className="space-y-1 text-textMuted">
              {extremeRisk.mandatory_protocols.slice(0, 3).map((prot, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
                  <span>{prot}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Vulnerable Population Health Personas */}
      <div className="bg-surface border border-borderSubtle rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderSubtle pb-4">
          <div>
            <h2 className="text-[15px] font-medium text-textMain flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-[#0ea5e9]" />
              Personalized Health Vulnerability Advisories
            </h2>
            <p className="text-[12px] text-textMuted">
              Tailored physiological guidance and clean air windows based on biological risk profiles.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(personas) as PersonaKey[]).map(key => (
              <button
                key={key}
                onClick={() => setSelectedPersona(key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                  selectedPersona === key
                    ? 'bg-textMain text-surface shadow-sm'
                    : 'bg-[#fafafa] border border-borderSubtle text-textMuted hover:text-textMain'
                }`}
              >
                <span>{personas[key].icon}</span>
                <span>{personas[key].title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Persona Detail Box */}
        <div className="p-5 rounded-2xl border border-borderSubtle bg-[#fafafa] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentPersona.icon}</span>
              <div>
                <h3 className="text-base font-semibold text-textMain">{currentPersona.title}</h3>
                <span className="text-[11px] font-medium text-textMuted">{currentPersona.inhalationMultiplier}</span>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
              style={{ backgroundColor: `${currentPersona.badgeColor}20`, color: currentPersona.badgeColor }}
            >
              {currentPersona.riskLevel}
            </span>
          </div>

          <p className="text-[13px] text-textMain leading-relaxed">
            {currentPersona.advice}
          </p>

          <div className="p-3 bg-surface border border-borderSubtle rounded-xl text-[12px] flex items-center gap-2.5">
            <ClockIcon className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span className="text-textMain font-medium">Optimal Clean Air Window:</span>
            <span className="text-textMuted">{currentPersona.optimalWindow}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Forecast Warning Timeline */}
      <div className="bg-surface border border-borderSubtle rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-[15px] font-medium text-textMain">Upcoming 72-Hour CPCB Warning Timeline</h3>
        <div className="space-y-3">
          {alertItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-borderSubtle hover:bg-[#fafafa] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-textMain text-[13px]">{item.horizon}</span>
                <span className="text-textMuted">{item.timestamp}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={getBadgeStyle(item.color)}>
                  AQI {item.aqi} · {item.category}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#f4f4f5] font-mono text-textMuted font-medium">
                  {item.alert_level}
                </span>
              </div>
              <div className="text-textMuted text-[12px] sm:text-right max-w-md">
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
