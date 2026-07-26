import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', 'public, max-age=604800, immutable')
  return readFileSync(join(process.cwd(), 'public/favicon-48.png'))
})
