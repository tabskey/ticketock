import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  id?: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  className?: string
  ariaLabel?: string
  variant?: 'default' | 'brand'
}

const BASE_TRIGGER_CLASSES = 'inline-flex items-center justify-between gap-2 text-left'

const CHEVRON_CLASSES: Record<'default' | 'brand', string> = {
  default: 'h-3.5 w-3.5 flex-none text-slate-400',
  brand: 'h-3.5 w-3.5 flex-none text-brand-text-secondary dark:text-brand-text-muted',
}

const LIST_CLASSES: Record<'default' | 'brand', string> = {
  default: 'absolute z-10 mt-1 max-h-60 min-w-full overflow-auto rounded-md border border-slate-300 bg-white py-1 text-sm shadow-lg',
  brand:
    'absolute z-10 mt-1 max-h-60 min-w-full overflow-auto rounded-xl border border-brand-border bg-brand-surface py-1 text-sm shadow-lg dark:border-brand-border-dark dark:bg-brand-surface-card-dark',
}

function optionClasses(variant: 'default' | 'brand', isHighlighted: boolean, isSelected: boolean): string {
  if (variant === 'brand') {
    return `cursor-pointer whitespace-nowrap px-3 py-1.5 ${isHighlighted ? 'bg-brand-surface-alt dark:bg-brand-surface-input-dark' : ''} ${
      isSelected ? 'font-medium text-brand-text-dark dark:text-brand-text' : 'text-brand-text-secondary dark:text-brand-text-muted'
    }`
  }
  return `cursor-pointer whitespace-nowrap px-3 py-1.5 ${isHighlighted ? 'bg-slate-100' : ''} ${
    isSelected ? 'font-medium text-slate-900' : 'text-slate-700'
  }`
}

function ChevronDownIcon({ variant }: { variant: 'default' | 'brand' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={CHEVRON_CLASSES[variant]}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// Native <select> renders its dropdown list using the browser/OS's own chrome,
// which cannot be styled with CSS/Tailwind. This is a from-scratch replacement
// (button + listbox) so the whole control can be themed, with roughly the
// same keyboard/click behavior as a native select.
export function Select<T extends string>({
  id,
  value,
  options,
  onChange,
  className,
  ariaLabel,
  variant = 'default',
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function openDropdown(): void {
    const currentIndex = options.findIndex((option) => option.value === value)
    setHighlightedIndex(Math.max(currentIndex, 0))
    setIsOpen(true)
  }

  function commitSelection(index: number): void {
    const option = options[index]
    if (option) onChange(option.value)
    setIsOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) openDropdown()
        else setHighlightedIndex((index) => Math.min(index + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) openDropdown()
        else setHighlightedIndex((index) => Math.max(index - 1, 0))
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (isOpen) commitSelection(highlightedIndex)
        else openDropdown()
        break
      case 'Escape':
        if (isOpen) {
          event.stopPropagation()
          setIsOpen(false)
        }
        break
    }
  }

  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`${BASE_TRIGGER_CLASSES} ${className ?? ''}`}
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
      >
        <span>{selectedLabel}</span>
        <ChevronDownIcon variant={variant} />
      </button>

      {isOpen && (
        <ul role="listbox" className={LIST_CLASSES[variant]}>
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => commitSelection(index)}
              className={optionClasses(variant, index === highlightedIndex, option.value === value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
