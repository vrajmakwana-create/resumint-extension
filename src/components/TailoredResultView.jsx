import { useState } from 'react'

function asArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(Boolean)
  if (typeof val === 'object') {
    return Object.values(val)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .filter(Boolean)
  }
  if (typeof val === 'string') {
    return val
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function sanitizeFilename(str) {
  return (str || 'document')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50)
}

export default function TailoredResultView({
  result,
  onOpenPreview,
  onNewAnalysis,
  showToast,
}) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!result) return null

  const company = result.company_name || 'Target Company'
  const title = result.job_title || 'Position'
  const score = Number(result.match_score) || 0
  const resumeUrl = result.resume_url || result.tailored_resume?.resume_url

  const tailored = result.tailored_resume || {}
  const summary = tailored.tailored_summary || result.tailored_summary || ''
  const skillsAn = result.skills_analysis || {}
  const matchingSkills = asArray(skillsAn.matching_skills || result.matching_skills)
  const missingSkills = asArray(skillsAn.missing_skills || result.missing_skills)

  // Download Handler
  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    showToast('Starting PDF download...')

    const filename = `${sanitizeFilename(company)}_${sanitizeFilename(title)}_Tailored_Resume.pdf`

    try {
      if (resumeUrl) {
        try {
          const res = await fetch(resumeUrl)
          if (!res.ok) throw new Error('Fetch failed')
          const blob = await res.blob()
          const blobUrl = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = filename
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(blobUrl)
          showToast('Tailored Resume downloaded!')
          setIsDownloading(false)
          return
        } catch {
          // Fallback direct link
          const a = document.createElement('a')
          a.href = resumeUrl
          a.target = '_blank'
          a.download = filename
          document.body.appendChild(a)
          a.click()
          a.remove()
          showToast('Opened download link in browser!')
          setIsDownloading(false)
          return
        }
      } else {
        showToast('Resume PDF URL not available yet.')
      }
    } catch (err) {
      console.error('Download error:', err)
      showToast('Download failed.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Share Link Handler
  const handleShare = async () => {
    const shareUrl = resumeUrl || `https://resumint-ai.netlify.app/#analysis-results?id=${result.id || ''}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      showToast('Resume link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      showToast('Could not copy link to clipboard.')
    }
  }

  // Copy Summary Handler
  const handleCopySummary = async () => {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setCopiedSummary(true)
      showToast('Tailored summary copied!')
      setTimeout(() => setCopiedSummary(false), 2500)
    } catch {
      showToast('Could not copy text.')
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Top Match Score & Seniority Card */}
      <div className="p-4 bg-white rounded-2xl border border-[#DCE5F0] shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-[#14243B] leading-tight">{title}</h3>
            <p className="text-xs text-[#2563EB] font-semibold">@ {company}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${score >= 80
                ? 'bg-[#DCFCE7] text-[#15803D]'
                : score >= 65
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'bg-[#FEF2F2] text-[#DC2626]'
              }`}
          >
            <span>{score}% Match</span>
          </span>
        </div>

        {/* Seniority Benchmarks */}
        {(result.seniority_level_jd || result.seniority_level_candidate) && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9] text-[11px]">
            <div className="p-2 bg-[#F8FAFC] rounded-lg">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Target Seniority</span>
              <span className="font-semibold text-[#14243B] truncate block">
                {result.seniority_level_jd || 'N/A'}
              </span>
            </div>
            <div className="p-2 bg-[#F8FAFC] rounded-lg">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Your Profile</span>
              <span className="font-semibold text-[#14243B] truncate block">
                {result.seniority_level_candidate || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3 PRIMARY ACTION BUTTONS (Preview, Download, Share Link) */}
      <div className="grid grid-cols-3 gap-2">
        {/* 1. Preview */}
        <button
          type="button"
          onClick={() => onOpenPreview(resumeUrl, `${company} Tailored Resume`)}
          className="h-10 px-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          title="Preview Tailored Resume PDF"
        >
          <span className="material-symbols-outlined text-[17px]">visibility</span>
          <span>Preview</span>
        </button>

        {/* 2. Download */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-10 px-2 rounded-xl border border-[#DCE5F0] bg-white hover:bg-[#F8FAFC] text-[#14243B] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          title="Download Tailored Resume PDF"
        >
          <span className={`material-symbols-outlined text-[17px] ${isDownloading ? 'animate-spin' : ''}`}>
            {isDownloading ? 'progress_activity' : 'download'}
          </span>
          <span>Download</span>
        </button>

        {/* 3. Share Link */}
        <button
          type="button"
          onClick={handleShare}
          className={`h-10 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer ${copiedLink
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'border-[#DCE5F0] bg-white hover:bg-[#F8FAFC] text-[#14243B]'
            }`}
          title="Copy Shareable Link"
        >
          <span className="material-symbols-outlined text-[17px]">
            {copiedLink ? 'check' : 'share'}
          </span>
          <span>{copiedLink ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Tailored Professional Summary */}
      {summary && (
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE5F0] space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#14243B] flex items-center gap-1">
              <span className="material-symbols-outlined text-[#2563EB] text-[15px]">auto_awesome</span>
              <span>Tailored Summary</span>
            </span>
            <button
              type="button"
              onClick={handleCopySummary}
              className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">
                {copiedSummary ? 'check' : 'content_copy'}
              </span>
              <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-2.5 rounded-lg border border-[#F1F5F9]">
            {summary}
          </p>
        </div>
      )}

      {/* Skills Analysis */}
      <div className="space-y-2">
        {/* Matching Skills */}
        {matchingSkills.length > 0 && (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span>Matching Skills ({matchingSkills.length})</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {matchingSkills.slice(0, 8).map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 text-[11px] font-medium rounded-md shadow-2xs"
                >
                  {sk}
                </span>
              ))}
              {matchingSkills.length > 8 && (
                <span className="px-1.5 py-0.5 text-[10px] text-emerald-700 font-semibold self-center">
                  +{matchingSkills.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-rose-800">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">warning</span>
                <span>Missing Skill Gaps ({missingSkills.length})</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {missingSkills.slice(0, 6).map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white border border-rose-200 text-rose-700 text-[11px] font-medium rounded-md shadow-2xs"
                >
                  {sk}
                </span>
              ))}
              {missingSkills.length > 6 && (
                <span className="px-1.5 py-0.5 text-[10px] text-rose-700 font-semibold self-center">
                  +{missingSkills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reset / New Analysis Action */}
      <button
        type="button"
        onClick={onNewAnalysis}
        className="w-full h-9 rounded-xl border border-[#DCE5F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#14243B] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
        <span>Tailor Another Job Description</span>
      </button>
    </div>
  )
}

