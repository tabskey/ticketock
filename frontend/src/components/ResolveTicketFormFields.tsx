import { ErrorMessage } from './ErrorMessage'
import { INPUT_CLASSES, LABEL_CLASSES, ERROR_CLASSES, SUCCESS_CLASSES, PRIMARY_BUTTON_CLASSES } from '../lib/brandUi'
import type { useResolveTicketForm } from '../hooks/useResolveTicketForm'
import sparkleMascot from '../assets/item7_rosto_brilho.png'
import surprisedMascot from '../assets/item4_rosto_surpreso.png'

interface ResolveTicketFormFieldsProps {
  form: ReturnType<typeof useResolveTicketForm>
  idPrefix: string
}

export function ResolveTicketFormFields({ form, idPrefix }: ResolveTicketFormFieldsProps) {
  const { resolutionNote, setResolutionNote, handleSubmit, updateStatus } = form

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor={`${idPrefix}-resolution-note`} className={LABEL_CLASSES}>
          Como o chamado foi resolvido?
        </label>
        <textarea
          id={`${idPrefix}-resolution-note`}
          required
          autoFocus
          rows={5}
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          className={INPUT_CLASSES}
        />
      </div>

      {updateStatus.isSuccess ? (
        <div className={`flex items-center gap-3 ${SUCCESS_CLASSES}`}>
          <img src={sparkleMascot} alt="" className="h-9 w-9 flex-none object-contain" />
          <p className="font-bold">Chamado resolvido! Fechando…</p>
        </div>
      ) : (
        <>
          {updateStatus.isError && (
            <div className={`flex items-center gap-3 ${ERROR_CLASSES}`}>
              <img src={surprisedMascot} alt="" className="h-9 w-9 flex-none object-contain" />
              <ErrorMessage error={updateStatus.error} className="flex-1 text-sm text-status-danger-text dark:text-status-danger-text-dark" />
            </div>
          )}

          <button
            type="submit"
            disabled={updateStatus.isPending || resolutionNote.trim() === ''}
            className={`w-full ${PRIMARY_BUTTON_CLASSES}`}
          >
            {updateStatus.isPending ? 'Enviando…' : 'Marcar como resolvido'}
          </button>
        </>
      )}
    </form>
  )
}
