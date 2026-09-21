import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  onClose: () => void
  labelledBy: string
  children: ReactNode
}

export function Modal({ onClose, labelledBy, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/50 px-4 backdrop-blur-sm dark:bg-black/60">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[22px] border border-brand-border bg-brand-surface p-5 sm:p-7 shadow-[0_1px_2px_rgba(33,29,63,0.05),0_10px_28px_rgba(33,29,63,0.06)] dark:border-brand-border-dark dark:bg-brand-surface-card-dark dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_28px_rgba(0,0,0,0.4)]"
      >
        {children}
      </div>
    </div>
  )
}
