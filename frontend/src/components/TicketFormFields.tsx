import { ErrorMessage } from './ErrorMessage'
import { Select } from './Select'
import { INPUT_CLASSES, LABEL_CLASSES, ERROR_CLASSES, SUCCESS_CLASSES, PRIMARY_BUTTON_CLASSES } from '../lib/brandUi'
import { CATEGORY_LABEL_PT, PRIORITY_LABEL_PT } from '../lib/ticketBadges'
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../types/ticket'
import type { TicketCategory, TicketPriority } from '../types/ticket'
import type { useTicketForm } from '../hooks/useTicketForm'
import happyMascot from '../assets/item6_rosto_feliz.png'
import surprisedMascot from '../assets/item4_rosto_surpreso.png'

interface TicketFormFieldsProps {
  form: ReturnType<typeof useTicketForm>
  idPrefix: string
  autoFocusTitle?: boolean
}

export function TicketFormFields({ form, idPrefix, autoFocusTitle }: TicketFormFieldsProps) {
  const { title, setTitle, description, setDescription, category, setCategory, priority, setPriority, handleSubmit, createTicket } = form

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor={`${idPrefix}-title`} className={LABEL_CLASSES}>
          Título
        </label>
        <input
          id={`${idPrefix}-title`}
          required
          autoFocus={autoFocusTitle}
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={INPUT_CLASSES}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-description`} className={LABEL_CLASSES}>
          Descrição
        </label>
        <textarea
          id={`${idPrefix}-description`}
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={INPUT_CLASSES}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}-category`} className={LABEL_CLASSES}>
            Categoria
          </label>
          <Select
            id={`${idPrefix}-category`}
            variant="brand"
            className={INPUT_CLASSES}
            value={category}
            options={TICKET_CATEGORIES.map((option) => ({ value: option, label: CATEGORY_LABEL_PT[option] }))}
            onChange={(value: TicketCategory) => setCategory(value)}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-priority`} className={LABEL_CLASSES}>
            Prioridade
          </label>
          <Select
            id={`${idPrefix}-priority`}
            variant="brand"
            className={INPUT_CLASSES}
            value={priority}
            options={TICKET_PRIORITIES.map((option) => ({ value: option, label: PRIORITY_LABEL_PT[option] }))}
            onChange={(value: TicketPriority) => setPriority(value)}
          />
        </div>
      </div>

      {createTicket.isSuccess ? (
        <div className={`flex items-center gap-3 ${SUCCESS_CLASSES}`}>
          <img src={happyMascot} alt="" className="h-9 w-9 flex-none object-contain" />
          <p className="font-bold">Chamado aberto! Redirecionando…</p>
        </div>
      ) : (
        <>
          {createTicket.isError && (
            <div className={`flex items-center gap-3 ${ERROR_CLASSES}`}>
              <img src={surprisedMascot} alt="" className="h-9 w-9 flex-none object-contain" />
              <ErrorMessage error={createTicket.error} className="flex-1 text-sm text-status-danger-text dark:text-status-danger-text-dark" />
            </div>
          )}

          <button type="submit" disabled={createTicket.isPending} className={`w-full ${PRIMARY_BUTTON_CLASSES}`}>
            {createTicket.isPending ? 'Enviando…' : 'Abrir chamado'}
          </button>
        </>
      )}
    </form>
  )
}
