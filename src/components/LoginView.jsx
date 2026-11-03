import { useState } from 'react'
import { authApi, WEB_APP_URL } from '../services/api'
import ResumintLogo from './ResumintLogo'

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    try {
      await authApi.login({ email, password })
      // Verify profile and onboarding status
      const user = await authApi.getMe()
      onLoginSuccess(user)
    } catch (err) {
      console.error('Login error:', err)
      setErrorMsg(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenSignup = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: `${WEB_APP_URL}/signup` })
    } else {
      window.open(`${WEB_APP_URL}/signup`, '_blank')
    }
  }

  return (
    <div className="p-6 flex flex-col justify-center min-h-[500px]">
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center mb-1">
          <ResumintLogo className="w-14 h-14 drop-shadow-md" />
        </div>
        <h2 className="text-lg font-bold text-[#14243B] tracking-tight">
          Sign In to Resumint
        </h2>
        <p className="text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed">
          Log in with your Resumint account to tailor your verified resume to any job posting.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] shrink-0 text-red-600">
            error
          </span>
          <span className="flex-1 leading-tight">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#14243B] mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-white border border-[#DCE5F0] rounded-xl outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#14243B] mb-1">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-white border border-[#DCE5F0] rounded-xl outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[#64748B]">
        <span>Don't have an account? </span>
        <button
          type="button"
          onClick={handleOpenSignup}
          className="text-[#2563EB] font-bold hover:underline cursor-pointer"
        >
          Sign Up on Web
        </button>
      </div>
    </div>
  )
}
