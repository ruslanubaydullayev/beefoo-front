declare module 'h3' {
  interface H3EventContext {
    jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
  }
}

export {}
