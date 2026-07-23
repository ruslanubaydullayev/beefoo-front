export function useCopy() {
  const toast = useToast()

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`Copied ${value}`)
    }
    catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return { copy }
}
