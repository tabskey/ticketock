import { X } from 'lucide-react'
import { Modal } from './Modal'
import { ResolveTicketFormFields } from './ResolveTicketFormFields'
import { useResolveTicketForm } from '../hooks/useResolveTicketForm'

interface ResolveTicketModalProps {
  ticketId: number
  onClose: () => void
}

export function ResolveTicketModal({ ticketId, onClose }: ResolveTicketModalProps) {
  const form = useResolveTicketForm({ ticketId, onSuccess: onClose })

  return (
    <Modal onClose={onClose} labelledBy="resolve-ticket-modal-title">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 id="resolve-ticket-modal-title" className="text-[19px] font-extrabold text-brand-text-dark dark:text-brand-text">
            Resolver chamado
          </h2>
          <p className="mt-1 text-[13px] text-brand-text-secondary dark:text-brand-text-muted">
            Conta pra gente como resolveu, assim fica registrado no histórico. ✨
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-brand-text-secondary transition hover:bg-brand-surface-alt hover:text-brand-text-dark dark:text-brand-text-muted dark:hover:bg-brand-surface-input-dark dark:hover:text-brand-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ResolveTicketFormFields form={form} idPrefix="resolve-modal" />
    </Modal>
  )
}
