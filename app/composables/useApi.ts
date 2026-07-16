export function useApiBase() {
  const config = useRuntimeConfig()
  return config.public.apiBase as string
}

export function apiUrl(path: string) {
  const base = useApiBase().replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
