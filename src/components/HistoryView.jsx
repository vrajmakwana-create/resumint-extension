import { useState, useEffect } from 'react'
import { jobApi } from '../services/api'

export default function HistoryView({ onSelectScan, onOpenPreview, showToast }) {
  const [historyList, setHistoryList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const res = await jobApi.getHistory()
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (isMounted) setHistoryList(list)
      } catch (err) {
        console.warn('History fetch error:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchHistory()
    return () => {
      isMounted = false
    }
  }, [])

  const handleShare = async (item) => {
    const shareUrl = item.resume_url || `http://localhost:5173/#analysis-results?id=${item.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast('Resume link copied!')
    } catch {
      showToast('Could not copy link.')
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">
          Recent Tailored Scans
        </h3>
        <span className="text-[11px] font-semibold text-[#2563EB]">
          {historyList.length} total
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#64748B] flex flex-col items-center justify-center space-y-2">
          <span className="material-symbols-outlined text-[24px] animate-spin text-[#2563EB]">
            progress_activity
          </span>
          <span>Loading past scans...</span>
        </div>
      ) : historyList.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#64748B] space-y-2">
          <span className="material-symbols-outlined text-[30px] text-[#94A3B8]">
            history_toggle_off
          </span>
          <p className="font-medium text-[#14243B]">No tailored scans yet</p>
          <p className="text-[11px] text-[#94A3B8]">
            Paste a job description to tailor your first resume.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {historyList.map((item) => {
            const score = Number(item.match_score) || 0
            return (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-[#DCE5F0] hover:border-[#2563EB]/40 transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#14243B] truncate">
                      {item.job_title || 'Software Engineer'}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {item.company_name || 'Company'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      score >= 80
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : score >= 65
                        ? 'bg-[#EFF6FF] text-[#2563EB]'
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                    }`}
                  >
                    {score}%
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => onSelectScan(item)}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>View Breakdown</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {item.resume_url && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPreview(item.resume_url, `${item.company_name} Resume`)
                        }
                        className="p-1 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] cursor-pointer"
                        title="Preview PDF"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      className="p-1 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] cursor-pointer"
                      title="Share Link"
                    >
                      <span className="material-symbols-outlined text-[16px]">share</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

