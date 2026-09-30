import { MapPinIcon, BellIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onRefresh: () => void
  loading: boolean
  onOpenWrfModal: () => void
  onOpenBulletinModal: () => void
}

export default function Header({ onRefresh, loading, onOpenWrfModal, onOpenBulletinModal }: HeaderProps) {
  return (
    <header className="h-20 bg-page flex items-center justify-end px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Export Bulletin Button */}
        <button
          onClick={onOpenBulletinModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-borderSubtle bg-surface text-[12px] font-medium text-textMain hover:bg-[#f4f4f5] transition-colors shadow-sm"
          title="Export Official NCMRWF/CPCB Environmental Bulletin"
        >
          <DocumentArrowDownIcon className="w-4 h-4 text-[#0ea5e9]" strokeWidth={1.5} />
          <span>Export Bulletin (PDF)</span>
        </button>

        {/* Location Dropdown */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-borderSubtle bg-surface text-[12px] font-medium text-textMain hover:bg-[#f4f4f5] transition-colors">
          <MapPinIcon className="w-4 h-4 text-textMuted" strokeWidth={1.5} />
          <span>Delhi NCR</span>
          <span className="text-[10px] text-textMuted ml-1">▾</span>
        </button>

        {/* LIVE Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#166534]">
          <svg className="w-4 h-4 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="tracking-wide">LIVE</span>
        </div>

        {/* Notification Bell */}
        <button className="relative text-textMuted hover:text-textMain transition-colors">
          <BellIcon className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-[#ef4444] border border-page"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-borderSubtle">
          <div className="w-8 h-8 bg-[#f4f4f5] text-textMuted rounded-full flex items-center justify-center font-medium text-[12px]">
            A
          </div>
          <div className="text-[11px] leading-tight text-right">
            <div className="font-medium text-textMain">Analytics</div>
            <div className="text-textMuted">Dashboard</div>
          </div>
        </div>

        {/* Hidden but functional refresh triggers */}
        <div className="hidden">
          <button onClick={onRefresh} disabled={loading}>Refresh</button>
          <button onClick={onOpenWrfModal}>WRF</button>
        </div>
      </div>
    </header>
  )
}
