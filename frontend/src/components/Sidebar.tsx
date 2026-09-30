import { NavLink } from 'react-router-dom'
import {
  Squares2X2Icon,
  MapIcon,
  ChartBarIcon,
  CloudIcon,
  FireIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

const monitorItems = [
  { path: '/', label: 'Overview', icon: Squares2X2Icon },
  { path: '/map', label: 'AQI Map', icon: MapIcon },
  { path: '/forecast', label: '72h Forecast', icon: ChartBarIcon },
  { path: '/atmosphere', label: 'Atmosphere', icon: CloudIcon },
  { path: '/stubble', label: 'Fire & Plume', icon: FireIcon },
  { path: '/explainability', label: 'Intelligence', icon: CpuChipIcon },
  { path: '/alerts', label: 'Early Warning', icon: ExclamationTriangleIcon }
]

const analysisItems = [
  { path: '/simulator', label: 'Policy Sandbox', icon: AdjustmentsHorizontalIcon },
  { path: '/validation', label: 'Model Validation', icon: BeakerIcon },
  { path: '/terms', label: 'Terms of Service', icon: DocumentTextIcon },
  { path: '/privacy', label: 'Privacy Policy', icon: ShieldCheckIcon }
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-surface flex flex-col shrink-0 h-screen sticky top-0 z-20 border-r border-borderSubtle">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-textMain rounded-lg flex items-center justify-center text-surface font-semibold">
          A
        </div>
        <div>
          <h1 className="text-[14px] font-medium tracking-tight text-textMain leading-none">AeroCast-NCR</h1>
          <p className="text-[11px] text-textMuted mt-1">Air Pollution Intelligence</p>
        </div>
      </div>

      <div className="overflow-y-auto px-4 mt-2">
        {/* Monitor */}
        <div className="pb-6">
          <div className="px-2 pb-3 text-[10px] font-medium text-textMuted uppercase tracking-widest">
            Monitor
          </div>
          <nav className="space-y-1">
            {monitorItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors ${
                      isActive
                        ? 'border border-textMain bg-[#f4f4f5] text-textMain font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'border border-transparent text-textMuted hover:text-textMain'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Analysis */}
        <div className="pb-6">
          <div className="px-2 pb-3 text-[10px] font-medium text-textMuted uppercase tracking-widest">
            Analysis
          </div>
          <nav className="space-y-1">
            {analysisItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors ${
                      isActive
                        ? 'border border-textMain bg-[#f4f4f5] text-textMain font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'border border-transparent text-textMuted hover:text-textMain'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
