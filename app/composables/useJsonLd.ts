export function useJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  const event = useRequestEvent()
  if (event) {
    event.context.jsonLd = data
  }
}
