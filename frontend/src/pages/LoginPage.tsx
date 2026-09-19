import { useState } from 'react'
import type { FormEvent, SVGProps } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { ErrorMessage } from '../components/ErrorMessage'
import { useTheme } from '../hooks/useTheme'

function iconProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }
}

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.32 20.32 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function ClockLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps({ strokeWidth: 2.4, ...props })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await login({ email, password })
      signIn({
        token: response.access_token,
        refreshToken: response.refresh_token,
        role: response.role,
        rememberMe,
      })
      const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-cream transition-colors dark:bg-brand-surface-dark">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="fixed right-6 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-surface shadow-sm dark:border-brand-border-dark dark:bg-brand-surface-card-dark"
      >
        {theme === 'dark' ? (
          <SunIcon className="h-5 w-5 text-brand-text" />
        ) : (
          <MoonIcon className="h-5 w-5 text-brand-text-dark" />
        )}
      </button>

      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-brand-purple p-14 text-brand-text dark:bg-brand-purple-dark md:flex">
        <div className="flex items-center gap-2.5 text-xl font-extrabold">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-brand-amber text-brand-ink">
            <ClockLogoIcon className="h-5 w-5" />
          </span>
          TicketTock
        </div>

        <p className="max-w-[280px] text-[15px] text-brand-text-soft">Pequenos problemas, grandes soluções.</p>

        <div className="relative flex flex-1 items-center justify-center">
          <span className="absolute left-[12%] top-[18%] h-4 w-4 rounded-full bg-brand-amber-soft" />
          <span className="absolute bottom-[22%] right-[10%] h-2.5 w-2.5 rounded-full bg-brand-amber-soft" />

          <div className="relative flex h-[230px] w-[230px] items-center justify-center rounded-[32px] bg-gradient-to-br from-brand-amber to-brand-amber-soft shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <div className="relative h-[130px] w-[130px] rounded-full border-[6px] border-brand-ink bg-[#FFF7E8]">
              <span className="absolute left-[62px] top-[24px] h-[42px] w-[5px] origin-bottom rotate-[25deg] rounded bg-brand-ink" />
              <span className="absolute left-[62px] top-[34px] h-[32px] w-[5px] origin-bottom rotate-[110deg] rounded bg-brand-ink" />
            </div>
          </div>

          <div className="absolute bottom-[8%] left-[6%] w-[60px] text-center">
            <div className="mx-auto -mb-2 h-[52px] w-[52px] rounded-[50%_50%_50%_0] bg-[#4CA36B]" />
            <div className="mx-auto h-9 w-11 rounded-b-[10px] bg-[#6B4A2E]" />
          </div>

          <div className="absolute bottom-[6%] right-[8%] h-[30px] w-[34px] rounded-b-lg bg-brand-text" />

          <div className="absolute bottom-[26%] right-[2%] max-w-[150px] rounded-[14px_14px_14px_2px] bg-brand-text px-3.5 py-2.5 text-[12.5px] font-bold text-brand-text-dark shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
            Seu chamado chega mais longe aqui! 💛
          </div>
        </div>

        <div />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <h1 className="mb-1.5 text-[30px] font-extrabold text-brand-text-dark dark:text-brand-text">Bem-vindo(a)!</h1>
          <p className="mb-8 text-[15px] font-medium text-brand-text-secondary dark:text-brand-text-muted">
            Faça login para acessar o TicketTock.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-bold text-brand-text-secondary dark:text-brand-text-muted">
                Usuário ou e-mail
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-brand-border bg-brand-surface-alt px-3.5 transition-colors focus-within:border-brand-amber dark:border-brand-border-dark dark:bg-brand-surface-input-dark">
                <UserIcon className="h-[18px] w-[18px] flex-none text-brand-text-secondary dark:text-brand-text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tabatha.macedo@email.com"
                  className="w-full bg-transparent py-3 text-[14.5px] text-brand-text-dark outline-none dark:text-brand-text"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-bold text-brand-text-secondary dark:text-brand-text-muted">
                Senha
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-brand-border bg-brand-surface-alt px-3.5 transition-colors focus-within:border-brand-amber dark:border-brand-border-dark dark:bg-brand-surface-input-dark">
                <LockIcon className="h-[18px] w-[18px] flex-none text-brand-text-secondary dark:text-brand-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-3 text-[14.5px] text-brand-text-dark outline-none dark:text-brand-text"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="flex-none text-brand-text-secondary hover:text-brand-text-dark dark:text-brand-text-muted dark:hover:text-brand-text"
                >
                  {showPassword ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-[13px] text-brand-text-secondary dark:text-brand-text-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-brand-border text-brand-amber focus:ring-brand-amber dark:border-brand-border-dark"
              />
              Lembrar de mim
            </label>

            {error ? <ErrorMessage error={error} /> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-br from-brand-amber to-brand-amber-soft py-3.5 text-[15px] font-bold text-brand-ink shadow-[0_10px_24px_rgba(245,166,35,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
