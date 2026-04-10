/**
 * Converts public/ORGs.png to build/icon.ico
 * Uses png-to-ico package (pure JS, no native deps)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

mkdirSync(join(root, 'build'), { recursive: true })

try {
  const pngToIco = (await import('png-to-ico')).default
  const buf = await pngToIco([join(root, 'public', 'ORGs.png')])
  writeFileSync(join(root, 'build', 'icon.ico'), buf)
  console.log('✓ build/icon.ico created')
} catch (e) {
  // Fallback: just copy the favicon.ico
  const src = join(root, 'public', 'favicon.ico')
  const dest = join(root, 'build', 'icon.ico')
  writeFileSync(dest, readFileSync(src))
  console.log('✓ build/icon.ico copied from favicon.ico (fallback)')
}
