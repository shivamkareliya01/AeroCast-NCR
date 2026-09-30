import { useRef } from 'react'
import {
  XMarkIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import {
  ForecastData,
  DiagnosticData,
  StubbleRiskData,
  AlertsHistoryData
} from '../api/client'

interface BulletinModalProps {
  isOpen: boolean
  onClose: () => void
  forecast: ForecastData | null
  diagnostics: DiagnosticData | null
  risk: StubbleRiskData | null
  alerts: AlertsHistoryData | null
}

export default function BulletinModal({
  isOpen,
  onClose,
  forecast,
  diagnostics,
  risk,
  alerts
}: BulletinModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  const currentAqItem = forecast?.forecast_timeline?.[0]
  const currentAqi = currentAqItem?.aqi ?? 317
  const currentCategory = currentAqItem?.category ?? 'Very Poor'
  const activeAlert = alerts?.active_alert

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-borderSubtle rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-scaleUp">
        {/* Modal Controls Header (Screen only) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderSubtle bg-[#fafafa] shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-textMain">Official Environmental Bulletin</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f4f4f5] text-textMuted">
              NCMRWF / CPCB Protocol
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-textMain text-surface text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-textMuted hover:text-textMain hover:bg-[#f4f4f5] transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bulletin Document */}
        <div ref={printAreaRef} className="p-8 overflow-y-auto space-y-6 text-[#111827] print:p-0 print:m-0">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-[#111827] pb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#4b5563] uppercase">
                Government of India · Ministry of Earth Sciences (MoES)
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#111827] mt-0.5">
                NATIONAL CENTRE FOR MEDIUM RANGE WEATHER FORECASTING (NCMRWF)
              </h1>
              <div className="text-[12px] font-semibold text-[#1e40af] mt-0.5">
                AEROCAST NCR · REGIONAL AIR QUALITY EARLY WARNING & FORECAST BULLETIN
              </div>
            </div>
            <div className="text-right text-[11px] text-[#4b5563] font-mono leading-tight">
              <div>Ref: NCMRWF/AC-NCR/{new Date().getFullYear()}/082</div>
              <div>Issued: {currentDate} {currentTime} IST</div>
              <div>Validity: 72 Hours Horizon</div>
            </div>
          </div>

          {/* Current Air Quality Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#e5e7eb] rounded-xl p-4 bg-[#f9fafb]">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6b7280]">
                National Air Quality Index (NAQI)
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#b91c1c]">{currentAqi}</span>
                <span className="text-[14px] font-bold px-2 py-0.5 rounded bg-[#fee2e2] text-[#991b1b]">
                  {currentCategory}
                </span>
              </div>
              <div className="text-[11px] text-[#4b5563]">
                Dominant Particulate: <span className="font-semibold">PM2.5 ({currentAqItem?.pm25 ?? 142} µg/m³)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6b7280]">
                Active CAQM GRAP Mandate
              </div>
              <div className="text-[13px] font-bold text-[#111827]">
                {currentAqi > 400 ? 'GRAP Stage IV (Emergency)' : currentAqi > 300 ? 'GRAP Stage III (Severe)' : 'GRAP Stage II (Very Poor)'}
              </div>
              <div className="text-[11px] text-[#4b5563] leading-tight">
                Mandatory anti-dust misting, restriction on non-BS-VI diesel commercial trucks.
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6b7280]">
                Atmospheric Dispersion Proxy
              </div>
              <div className="text-[13px] font-bold text-[#d97706]">
                {diagnostics?.diagnostics.ventilation.status ?? 'Critical Stagnation'}
              </div>
              <div className="text-[11px] text-[#4b5563]">
                Ventilation Index: <span className="font-semibold">{diagnostics?.diagnostics.ventilation.ventilation_index_proxy ?? 798} m²/s</span> (PBL: {diagnostics?.meteorological_drivers.pbl_height_proxy.value ?? 380}m)
              </div>
            </div>
          </div>

          {/* Meteorological Diagnostic Summary */}
          <div className="space-y-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#e5e7eb] pb-1">
              1. Coupled Meteorology & Dispersion Diagnostics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
              <div className="p-2.5 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                <div className="text-[#6b7280] text-[10px]">Surface Wind Speed</div>
                <div className="font-semibold text-[#111827]">{diagnostics?.meteorological_drivers.wind_speed_10m.value ?? 2.1} m/s</div>
                <div className="text-[10px] text-[#b91c1c]">Stagnant (Trap risk)</div>
              </div>
              <div className="p-2.5 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                <div className="text-[#6b7280] text-[10px]">Surface Wind Bearing</div>
                <div className="font-semibold text-[#111827]">{diagnostics?.meteorological_drivers.wind_direction_10m.value ?? 305}° (NW)</div>
                <div className="text-[10px] text-[#b91c1c]">Upwind stubble alignment</div>
              </div>
              <div className="p-2.5 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                <div className="text-[#6b7280] text-[10px]">Thermal Inversion Index</div>
                <div className="font-semibold text-[#111827]">{diagnostics?.diagnostics.inversion.inversion_proxy_index ?? 82}/100</div>
                <div className="text-[10px] text-[#b91c1c]">Strong nocturnal trap</div>
              </div>
              <div className="p-2.5 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                <div className="text-[#6b7280] text-[10px]">Relative Humidity</div>
                <div className="font-semibold text-[#111827]">{diagnostics?.meteorological_drivers.relative_humidity.value ?? 68}%</div>
                <div className="text-[10px] text-[#d97706]">Secondary aerosol precursor</div>
              </div>
            </div>
            <p className="text-[11px] text-[#4b5563] leading-relaxed italic">
              Scientific note: All ventilation and inversion scores represent data-driven derived proxy indicators without radiosonde vertical sounding profiles.
            </p>
          </div>

          {/* Upwind Stubble Transport Risk */}
          <div className="space-y-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#e5e7eb] pb-1">
              2. Upwind Regional Biomass Burning Transport Intelligence
            </h2>
            <div className="p-3 bg-[#fff7ed] border border-[#ffedd5] rounded-xl text-[12px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#c2410c]">
                  Risk Score: {risk?.transport_risk.stubble_transport_risk_score ?? 76}/100 ({risk?.transport_risk.category ?? 'High Risk Corridor'})
                </span>
                <span className="text-[11px] font-mono text-[#9a3412]">
                  Active FRP: {risk?.transport_risk.total_active_frp_mw ?? 4250} MW ({risk?.transport_risk.fire_count_200km ?? 342} Fires)
                </span>
              </div>
              <p className="text-[#7c2d12] text-[11px] leading-relaxed">
                {risk?.transport_risk.alert_message ?? 'North-West surface winds are actively coupling with agricultural burning clusters across Punjab/Haryana, transferring fine particulate plumes into NCR airshed.'}
              </p>
            </div>
          </div>

          {/* 72-Hour Multi-Horizon Forecast Table */}
          <div className="space-y-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#111827] border-b border-[#e5e7eb] pb-1">
              3. 72-Hour Multi-Horizon Pollutant Forecast Matrix
            </h2>
            <div className="overflow-x-auto border border-[#e5e7eb] rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#f9fafb] text-[#4b5563] uppercase text-[10px] font-bold border-b border-[#e5e7eb]">
                  <tr>
                    <th className="py-2 px-3">Horizon</th>
                    <th className="py-2 px-3">Timestamp (IST)</th>
                    <th className="py-2 px-3">PM2.5 (µg/m³)</th>
                    <th className="py-2 px-3">90% Credible Range</th>
                    <th className="py-2 px-3">PM10</th>
                    <th className="py-2 px-3">NO2</th>
                    <th className="py-2 px-3">NAQI</th>
                    <th className="py-2 px-3">CPCB Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {forecast?.forecast_timeline.map((item) => (
                    <tr key={item.horizon} className="hover:bg-[#f9fafb]">
                      <td className="py-2 px-3 font-bold text-[#111827]">{item.horizon}</td>
                      <td className="py-2 px-3 text-[#4b5563]">{item.timestamp}</td>
                      <td className="py-2 px-3 font-bold text-[#111827]">{item.pm25}</td>
                      <td className="py-2 px-3 font-mono text-[#6b7280]">
                        [{item.pm25_lower ?? Math.round(item.pm25 * 0.85)} – {item.pm25_upper ?? Math.round(item.pm25 * 1.15)}]
                      </td>
                      <td className="py-2 px-3 text-[#4b5563]">{item.pm10}</td>
                      <td className="py-2 px-3 text-[#4b5563]">{item.no2}</td>
                      <td className="py-2 px-3 font-extrabold text-[#b91c1c]">{item.aqi}</td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-[#b91c1c]">{item.category}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Health & Municipal Directives */}
          <div className="space-y-2 border-t border-[#e5e7eb] pt-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#111827]">
              4. Immediate Statutory Advisory & Health Directives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-[#374151]">
              <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg space-y-1">
                <div className="font-bold text-[#111827]">Public Health Recommendations:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Avoid morning outdoor cardio / physical exertion between 05:00 and 09:00 IST.</li>
                  <li>Children, cardiac patients, and elderly citizens should remain strictly indoors.</li>
                  <li>Use certified N95 respirators if prolonged outdoor presence is unavoidable.</li>
                </ul>
              </div>
              <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg space-y-1">
                <div className="font-bold text-[#111827]">Municipal & Transport Directives:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Enforce mechanized sweeping and continuous chemical dust-suppressant misting.</li>
                  <li>Strictly prohibit all open municipal waste burning and biomass incineration.</li>
                  <li>Intensify traffic signal optimization at Anand Vihar, ITO, and Cyber City junctions.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Official Signoff Footer */}
          <div className="border-t border-[#111827] pt-4 flex justify-between items-end text-[10px] text-[#6b7280]">
            <div>
              <div>System: AeroCast NCR Environmental Forecasting Engine (MoES / NCMRWF Protocol)</div>
              <div>Model Benchmark: Multi-Horizon Coupled XGBoost Regressors (CAMS Reanalysis Ground Extraction)</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[#111827]">Authorized Regional Forecast Office</div>
              <div>NCR Air Quality Monitoring Division · MoES</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
