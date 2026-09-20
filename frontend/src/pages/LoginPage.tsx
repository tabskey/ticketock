import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, Lock, Moon, Sparkle, Sun, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { ErrorMessage } from '../components/ErrorMessage'
import { useTheme } from '../hooks/useTheme'
import ticketMascot from '../assets/item1_gato_bilhete.png'
import welcomeMascot from '../assets/item2_gato_coracao.png'

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
    <div className="flex min-h-screen flex-col bg-brand-cream transition-colors dark:bg-brand-surface-dark md:flex-row">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="fixed right-6 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-surface shadow-sm dark:border-brand-border-dark dark:bg-brand-surface-card-dark"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5 text-brand-text" /> : <Moon className="h-5 w-5 text-brand-text-dark" />}
      </button>

      <div className="dune-container sky relative flex h-56 flex-col justify-between p-5 text-brand-text-dark dark:text-brand-text md:h-auto md:flex-1 md:p-14">
        <div className="stars" />

        <div className="dune dune-1 dune--peak-left" />
        <div className="dune dune-2 dune--peak-right" />
        <div className="dune dune-3 dune--peak-left" />
        <div className="dune dune-4 dune--peak-right" />

        <div className="sand-grain" />

        <div className="relative z-10 flex flex-1 items-center justify-center">

          {/* Estrela brilhante — só no dark, com glow e pulsar */}
          <Sparkle
            aria-hidden="true"
            className="absolute right-[9%] top-[9%] hidden h-6 w-6 animate-pulse fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] dark:block"
          />

          {/* Versão discreta pro light — só a cor da marca, sem glow */}
          <Sparkle
            aria-hidden="true"
            className="absolute right-[9%] top-[9%] block h-5 w-5 fill-brand-amber text-brand-amber opacity-70 dark:hidden"
          />

          <div className="absolute right-[11%] top-[12%] hidden max-w-[150px] rounded-[14px_2px_14px_14px] bg-brand-text px-3.5 py-2.5 text-[11.5px] font-bold text-brand-text-dark shadow-[0_8px_20px_rgba(0,0,0,0.2)] md:block">
            Um miado de distância da solução.🐾
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <p className="mb-1 text-center text-3xl font-medium font-fredoka text-brand-purple dark:text-brand-text md:text-7xl">
              <span className="font-bold text-brand-amber">T</span>icket<span className="font-bold text-brand-amber">T</span>ock
            </p>

            <p className="mb-3 hidden max-w-[280px] text-center text-[15px] text-brand-text-secondary dark:text-brand-text-soft md:block">
              Todo chamado merece uma patinha amiga.
            </p>

            <img
              src={ticketMascot}
              alt=""
              className="h-20 w-20 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.25)] md:h-[400px] md:w-[400px]"
            />
          </div>
        </div>

        <div />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8 md:py-10 md:shadow-[inset_60px_0_60px_-40px_rgba(122,66,31,0.35)] md:dark:shadow-[inset_60px_0_60px_-40px_rgba(0,0,0,0.6)]">
        <div className="w-full max-w-sm">
          <img src={welcomeMascot} alt="" className="mx-auto mb-3 h-24 w-24 object-contain" />

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
                <User className="h-[18px] w-[18px] flex-none text-brand-text-secondary dark:text-brand-text-muted" />
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
                <Lock className="h-[18px] w-[18px] flex-none text-brand-text-secondary dark:text-brand-text-muted" />
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
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
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
