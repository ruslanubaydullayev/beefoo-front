export function useApiBase() {
  return ''
}

/** @deprecated Backend removed — catalog is local. */
export function apiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized
}
