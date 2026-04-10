/**
 * Manually builds app.asar and patches it into win-unpacked
 * Bypasses electron-builder's code-signing tool download entirely
 */
import { createPackageWithOptions } from '@electron/asar'
import { mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const OUT_DIR = 'release-manual'
const RESOURCES_DIR = join(OUT_DIR, 'resources')

mkdirSync(RESOURCES_DIR, { recursive: true })

// Copy dist-electron into a staging folder
mkdirSync('staging/dist-electron', { recursive: true })
mkdirSync('staging/dist', { recursive: true })

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

console.log('Copying dist/ ...')
copyDir('dist', 'staging/dist')

console.log('Copying dist-electron/ ...')
// Only copy .cjs files
for (const f of readdirSync('dist-electron')) {
  if (f.endsWith('.cjs') || f.endsWith('.cjs.map')) {
    copyFileSync(join('dist-electron', f), join('staging/dist-electron', f))
  }
}

console.log('Packing app.asar ...')
await createPackageWithOptions('staging', join(RESOURCES_DIR, 'app.asar'), {
  unpack: '*.{node,dll}',
})

console.log(`✓ app.asar created at ${RESOURCES_DIR}/app.asar`)
console.log(`  Size: ${(statSync(join(RESOURCES_DIR, 'app.asar')).size / 1024 / 1024).toFixed(1)} MB`)
console.log('')
console.log('Now copy the Electron binary:')
console.log('  Copy everything from release/win-unpacked/ EXCEPT resources/app.asar')
console.log('  Then replace resources/app.asar with the new one from release-manual/resources/')
