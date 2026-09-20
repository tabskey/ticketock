import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import { TicketFormFields } from './TicketFormFields'
import { useTicketForm } from '../hooks/useTicketForm'

interface NewTicketModalProps {
  onClose: () => void
}

export function NewTicketModal({ onClose }: NewTicketModalProps) {
  const navigate = useNavigate()
  const form = useTicketForm({
    onSuccess: (ticket) => {
      onClose()
      navigate(`/tickets/${ticket.id}`)
    },
  })

  return (
    <Modal onClose={onClose} labelledBy="new-ticket-modal-title">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="new-ticket-modal-title" className="text-[19px] font-extrabold text-brand-text-dark dark:text-brand-text">
          Abrir chamado
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-brand-text-secondary transition hover:bg-brand-surface-alt hover:text-brand-text-dark dark:text-brand-text-muted dark:hover:bg-brand-surface-input-dark dark:hover:text-brand-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <TicketFormFields form={form} idPrefix="modal" autoFocusTitle />
    </Modal>
  )
}
