import { build } from 'esbuild'
import { mkdirSync } from 'fs'

mkdirSync('dist-electron', { recursive: true })

await build({
  entryPoints: ['electron/main.ts', 'electron/preload.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outdir: 'dist-electron',
  outExtension: { '.js': '.cjs' },
  external: ['electron', 'electron-updater'],
  sourcemap: true,
})

console.log('Electron main process built.')
