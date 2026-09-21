import { Link, useNavigate } from 'react-router-dom'
import { useTicketForm } from '../hooks/useTicketForm'
import { TicketFormFields } from '../components/TicketFormFields'
import { CARD_CLASSES } from '../lib/brandUi'

export function NewTicketPage() {
  const navigate = useNavigate()
  const form = useTicketForm({
    onSuccess: (ticket) => navigate(`/tickets/${ticket.id}`),
  })

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link to="/tickets" className="text-sm text-brand-text-secondary hover:text-brand-text-dark dark:text-brand-text-muted dark:hover:text-brand-text">
        ← Voltar aos tickets
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-brand-text-dark dark:text-brand-text">Abrir chamado</h1>
        <p className="mt-1 text-sm text-brand-text-secondary dark:text-brand-text-muted">
          Conta pra gente o que rolou — a gente resolve rapidinho. 🐾
        </p>
      </div>

      <div className={CARD_CLASSES}>
        <TicketFormFields form={form} idPrefix="page" />
      </div>
    </div>
  )
}
