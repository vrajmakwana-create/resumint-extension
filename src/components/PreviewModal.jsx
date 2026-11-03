import { useState } from 'react'

export default function PreviewModal({ isOpen, onClose, pdfUrl, title = 'Resume Preview' }) {
  const [isLoading, setIsLoading] = useState(true)

  if (!isOpen) return null

  const handleDownload = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.target = '_blank'
    a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm transition-all animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full h-[95vh] bg-[#323639] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Controls */}
        <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-2">
          {pdfUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="h-7 px-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer shadow-md backdrop-blur-sm"
              title="Download PDF"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Download</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-sm"
            title="Close Preview (Esc)"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Content */}
        {pdfUrl ? (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#323639] text-white text-xs">
                <span className="material-symbols-outlined text-[20px] animate-spin mr-2">
                  progress_activity
                </span>
                <span>Loading PDF Viewer...</span>
              </div>
            )}
            <iframe
              src={`${pdfUrl}#view=FitH`}
              title={title}
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white space-y-2">
            <span className="material-symbols-outlined text-[32px] text-amber-400">
              warning
            </span>
            <p className="font-bold text-sm">No PDF Document URL Available</p>
            <p className="text-xs text-white/70 max-w-xs">
              The tailored resume analysis has been generated, but the cloud PDF file link is not available.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

