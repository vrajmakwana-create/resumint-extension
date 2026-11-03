import { WEB_APP_URL } from '../services/api'
import ResumintLogo from './ResumintLogo'

export default function Header({ user, currentScreen, onNavigateScreen, onLogout }) {
  const handleOpenWeb = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: `${WEB_APP_URL}/dashboard` })
    } else {
      window.open(`${WEB_APP_URL}/dashboard`, '_blank')
    }
  }

  return (
    <header className="h-14 px-4 bg-[#102544] border-b border-[#1E3A5F] flex items-center justify-between text-white select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <ResumintLogo className="w-7 h-7 rounded-lg shadow-sm" />
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[16px] tracking-tight text-white">Resumint</span>
          <span className="bg-[#2563EB]/30 text-[#93C5FD] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#2563EB]/40">
            CHROME
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        {user && (
          <>
            {currentScreen !== 'form' && (
              <button
                type="button"
                onClick={() => onNavigateScreen('form')}
                className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="New JD Analysis"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateScreen(currentScreen === 'history' ? 'form' : 'history')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                currentScreen === 'history'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/10'
              }`}
              title="Tailoring History"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={handleOpenWeb}
          className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Open Resumint Web Dashboard"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
        </button>

        {user && (
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 text-[#94A3B8] hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        )}
      </div>
    </header>
  )
}
