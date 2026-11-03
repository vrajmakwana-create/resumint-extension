import { useState, useEffect } from 'react'
import Header from './components/Header'
import LoginView from './components/LoginView'
import OnboardingGateView from './components/OnboardingGateView'
import JobDescriptionForm from './components/JobDescriptionForm'
import TailoredResultView from './components/TailoredResultView'
import HistoryView from './components/HistoryView'
import PreviewModal from './components/PreviewModal'
import { authApi, getToken, clearSession } from './services/api'

export default function App() {
  const [authStatus, setAuthStatus] = useState('loading') // 'loading' | 'unauthenticated' | 'onboarding_required' | 'ready'
  const [currentUser, setCurrentUser] = useState(null)
  const [currentScreen, setCurrentScreen] = useState('form') // 'form' | 'result' | 'history'

  const [tailoredResult, setTailoredResult] = useState(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const [toastMessage, setToastMessage] = useState(null)
  const [globalError, setGlobalError] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur))
    }, 3000)
  }

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      setAuthStatus('loading')
      try {
        const token = await getToken()
        if (!token) {
          setAuthStatus('unauthenticated')
          return
        }

        const user = await authApi.getMe()
        if (!user) {
          setAuthStatus('unauthenticated')
          return
        }

        setCurrentUser(user)

        // Check if onboarding is completed
        if (user.onboarding_completed === false) {
          setAuthStatus('onboarding_required')
        } else {
          setAuthStatus('ready')
        }
      } catch (err) {
        console.warn('Initial session check error:', err)
        setAuthStatus('unauthenticated')
      }
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    if (user.onboarding_completed === false) {
      setAuthStatus('onboarding_required')
    } else {
      setAuthStatus('ready')
      setCurrentScreen('form')
    }
  }

  const handleLogout = async () => {
    await clearSession()
    setCurrentUser(null)
    setTailoredResult(null)
    setAuthStatus('unauthenticated')
    setCurrentScreen('form')
    showToast('Signed out successfully.')
  }

  const handleAnalysisSuccess = (result) => {
    setTailoredResult(result)
    setCurrentScreen('result')
  }

  const handleOpenPreview = (url, title = 'Tailored Resume') => {
    setPreviewPdfUrl(url)
    setPreviewTitle(title)
    setPreviewOpen(true)
  }

  return (
    <div className="w-[440px] min-h-[580px] bg-[#F5F8FC] text-[#14243B] flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Header */}
      <Header
        user={currentUser}
        currentScreen={currentScreen}
        onNavigateScreen={setCurrentScreen}
        onLogout={handleLogout}
      />

      {/* Global Error Banner */}
      {globalError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main View Switcher */}
      <main className="flex-1 overflow-y-auto">
        {authStatus === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[480px] space-y-3">
            <div className="w-10 h-10 rounded-full border-3 border-[#2563EB] border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-[#64748B]">Verifying Resumint session...</p>
          </div>
        )}

        {authStatus === 'unauthenticated' && (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        )}

        {authStatus === 'onboarding_required' && (
          <OnboardingGateView
            user={currentUser}
            onStatusRefresh={(user) => {
              setCurrentUser(user)
              if (user.onboarding_completed !== false) {
                setAuthStatus('ready')
                setCurrentScreen('form')
                showToast('Onboarding verified! You can now tailor resumes.')
              } else {
                showToast('Onboarding still incomplete on web.')
              }
            }}
          />
        )}

        {authStatus === 'ready' && (
          <>
            {currentScreen === 'form' && (
              <JobDescriptionForm
                onAnalysisSuccess={handleAnalysisSuccess}
                onError={(msg) => setGlobalError(msg)}
              />
            )}

            {currentScreen === 'result' && (
              <TailoredResultView
                result={tailoredResult}
                onOpenPreview={handleOpenPreview}
                onNewAnalysis={() => setCurrentScreen('form')}
                showToast={showToast}
              />
            )}

            {currentScreen === 'history' && (
              <HistoryView
                onSelectScan={(item) => {
                  setTailoredResult(item)
                  setCurrentScreen('result')
                }}
                onOpenPreview={handleOpenPreview}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-[#14243B] text-white text-xs font-semibold rounded-xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-[17px]">check_circle</span>
          <span className="flex-1 truncate">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white cursor-pointer ml-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Resume PDF Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfUrl={previewPdfUrl}
        title={previewTitle}
      />
    </div>
  )
}

