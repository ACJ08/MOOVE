import { open, readdir } from 'node:fs/promises'
import path from 'node:path'

const mediaRoots = ['src/assets', 'src/imports']
const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov'])
const lfsPointerPrefix = 'version https://git-lfs.github.com/spec/v1'

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(entryPath) : [entryPath]
  }))
  return files.flat()
}

const mediaFiles = (await Promise.all(mediaRoots.map(walk)))
  .flat()
  .filter((file) => mediaExtensions.has(path.extname(file).toLowerCase()))

const unresolvedLfsFiles = []
for (const file of mediaFiles) {
  const handle = await open(file, 'r')
  const buffer = Buffer.alloc(lfsPointerPrefix.length)
  await handle.read(buffer, 0, buffer.length, 0)
  await handle.close()
  if (buffer.toString('utf8').startsWith(lfsPointerPrefix)) unresolvedLfsFiles.push(file)
}

if (unresolvedLfsFiles.length > 0) {
  console.error('\nGit LFS media files were not downloaded:\n')
  for (const file of unresolvedLfsFiles) console.error(`  - ${file}`)
  console.error('\nEnable Git LFS in Vercel Project Settings → Git, then redeploy. Locally, run `git lfs pull`.')
  process.exit(1)
}

console.log(`Verified ${mediaFiles.length} media assets; no unresolved Git LFS pointers found.`)
