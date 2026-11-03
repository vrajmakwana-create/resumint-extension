import { useState } from 'react'
import { jobApi } from '../services/api'

export default function JobDescriptionForm({ onAnalysisSuccess, onError }) {
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractNotice, setExtractNotice] = useState(null)

  // Auto-detect JD from current active browser tab
  const handleAutoExtract = async () => {
    setIsExtracting(true)
    setExtractNotice(null)

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab || !tab.id) {
          throw new Error('No active tab found.')
        }

        chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JD' }, (response) => {
          setIsExtracting(false)
          if (chrome.runtime.lastError || !response) {
            setExtractNotice('Could not auto-extract from this page. Please paste the JD manually.')
            return
          }

          if (response.company_name) setCompanyName(response.company_name)
          if (response.job_title) setJobTitle(response.job_title)
          if (response.job_description) setJobDescription(response.job_description)

          if (response.job_description) {
            setExtractNotice(`Auto-extracted job details from ${tab.url ? new URL(tab.url).hostname : 'page'}!`)
          } else {
            setExtractNotice('Page detected, but could not locate full JD text. Please paste text below.')
          }
        })
      } catch (err) {
        setIsExtracting(false)
        setExtractNotice('Could not extract details. Please paste manually.')
      }
    } else {
      setIsExtracting(false)
      setExtractNotice('Auto-extract available when running as an unpacked Chrome Extension.')
    }
  }

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setJobDescription(text)
      }
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobTitle.trim() || !companyName.trim() || !jobDescription.trim()) {
      onError('Please provide Company Name, Job Title, and Job Description text.')
      return
    }

    setIsLoading(true)
    setLoadingStep(1)

    // Animated loading step progression
    const timer1 = setTimeout(() => setLoadingStep(2), 2500)
    const timer2 = setTimeout(() => setLoadingStep(3), 5500)
    const timer3 = setTimeout(() => setLoadingStep(4), 9000)

    try {
      const result = await jobApi.analyzeJobDescription({
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
      })

      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)

      onAnalysisSuccess(result)
    } catch (err) {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      console.error('Analysis error:', err)
      onError(err.message || 'Job description analysis failed. Please check inputs.')
    } finally {
      setIsLoading(false)
      setLoadingStep(0)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Auto-Extract Banner */}
      <div className="p-3 bg-white rounded-xl border border-[#DCE5F0] shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px] shrink-0">
            travel_explore
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#14243B] truncate">Viewing a Job Posting?</p>
            <p className="text-[11px] text-[#64748B] truncate">Auto-extract title &amp; description</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoExtract}
          disabled={isExtracting || isLoading}
          className="h-8 px-3 rounded-lg bg-[#EFF6FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white border border-[#2563EB]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[15px] ${isExtracting ? 'animate-spin' : ''}`}>
            {isExtracting ? 'progress_activity' : 'auto_awesome'}
          </span>
          <span>{isExtracting ? 'Extracting...' : 'Grab JD'}</span>
        </button>
      </div>

      {extractNotice && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 text-[#1E40AF] rounded-lg text-xs flex items-center justify-between">
          <span className="text-[11px] leading-tight">{extractNotice}</span>
          <button
            type="button"
            onClick={() => setExtractNotice(null)}
            className="text-blue-600 hover:text-blue-800 text-xs ml-2 cursor-pointer font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#14243B] mb-1">
              Target Company *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stripe, Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#DCE5F0] rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#14243B] mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Backend Dev"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isLoading}
              className="w-full h-9 px-2.5 text-xs bg-white border border-[#DCE5F0] rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-[#14243B]">
              Job Description Content *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#94A3B8]">
                {jobDescription.length} characters
              </span>
              <button
                type="button"
                onClick={handlePasteClipboard}
                disabled={isLoading}
                className="text-[10px] font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">content_paste</span>
                <span>Paste</span>
              </button>
            </div>
          </div>

          <textarea
            required
            rows={7}
            placeholder="Paste the full job description requirements, responsibilities, and qualifications..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
            className="w-full p-2.5 text-xs bg-white border border-[#DCE5F0] rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all resize-none disabled:bg-gray-50 font-sans leading-relaxed"
          />
        </div>

        {/* Loading Step Tracker */}
        {isLoading && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
              <span className="material-symbols-outlined text-[17px] animate-spin">
                progress_activity
              </span>
              <span>
                {loadingStep === 1 && 'Extracting key competencies & requirements...'}
                {loadingStep === 2 && 'Comparing against your verified experience...'}
                {loadingStep === 3 && 'Generating ATS-tailored professional summary...'}
                {loadingStep >= 4 && 'Rendering tailored resume PDF document...'}
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] pl-6">
              This usually takes 8–12 seconds. Please keep this popup open.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !jobDescription.trim()}
          className="w-full h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
              <span>Tailoring Resume with AI...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span>Generate Tailored Resume</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

