import { useState } from 'react'
import { authApi, WEB_APP_URL } from '../services/api'
import ResumintLogo from './ResumintLogo'

export default function OnboardingGateView({ user, onStatusRefresh }) {
  const [isChecking, setIsChecking] = useState(false)

  const handleOpenOnboarding = () => {
    const url = `${WEB_APP_URL}/onboarding`
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url })
    } else {
      window.open(url, '_blank')
    }
  }

  const handleRefresh = async () => {
    setIsChecking(true)
    try {
      const refreshedUser = await authApi.getMe()
      onStatusRefresh(refreshedUser)
    } catch (err) {
      console.warn('Refresh error:', err)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="p-6 flex flex-col justify-center items-center text-center min-h-[500px] space-y-4">
      <ResumintLogo className="w-14 h-14 drop-shadow-md" />

      <div className="space-y-1.5 max-w-xs">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
          Setup Incomplete
        </span>
        <h2 className="text-base font-bold text-[#14243B] tracking-tight">
          Complete Resume Onboarding First
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Hello <strong>{user?.first_name || user?.email}</strong>! Before Resumint can tailor a resume to any job description, you need to complete your baseline resume details (work experience, skills, and summary).
        </p>
      </div>

      <div className="w-full max-w-xs p-3.5 bg-white rounded-xl border border-[#DCE5F0] text-left text-xs space-y-2 text-[#475569]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] text-[18px]">badge</span>
          <span>Personal &amp; Contact Info</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] text-[18px]">psychology</span>
          <span>Verified Skills &amp; Keywords</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] text-[18px]">work_history</span>
          <span>Work Experience &amp; Projects</span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2 pt-2">
        <button
          type="button"
          onClick={handleOpenOnboarding}
          className="w-full h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Complete Setup on Resumint Web</span>
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isChecking}
          className="w-full h-9 rounded-xl border border-[#DCE5F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#14243B] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[16px] ${isChecking ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span>{isChecking ? 'Checking status...' : "I've Completed It (Refresh)"}</span>
        </button>
      </div>
    </div>
  )
}
