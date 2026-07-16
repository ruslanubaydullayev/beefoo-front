export type ToastTone = 'success' | 'error'

export type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

let nextId = 1

export function useToast() {
  const toasts = useState<ToastItem[]>('app-toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, tone: ToastTone = 'success', durationMs = 2400) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, message, tone }]

    if (import.meta.client) {
      window.setTimeout(() => dismiss(id), durationMs)
    }

    return id
  }

  function success(message: string) {
    return show(message, 'success')
  }

  function error(message: string) {
    return show(message, 'error')
  }

  return {
    toasts,
    show,
    success,
    error,
    dismiss,
  }
}
