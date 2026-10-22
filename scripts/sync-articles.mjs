import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { repository, repositoryBranch } from '../src/articles.js'

const apiBase = `https://api.github.com/repos/${repository}`
const output = new URL('../public/articles/', import.meta.url)

async function request(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`GitHub returned ${response.status}: ${url}`)
  return response.json()
}

const tree = await request(`${apiBase}/git/trees/${repositoryBranch}?recursive=1`)
if (tree.truncated) throw new Error('GitHub returned an incomplete repository tree')
const files = tree.tree.filter(entry => entry.type === 'blob' && entry.path.endsWith('.md'))
// Fetch immutable blobs so every published article belongs to the same revision.
const contents = []
for (const entry of files) {
  const blob = await request(`${apiBase}/git/blobs/${entry.sha}`)
  if (blob.encoding !== 'base64') throw new Error(`Unsupported encoding: ${entry.path}`)
  contents.push({ path: entry.path, content: Buffer.from(blob.content, 'base64') })
}
for (const { path, content } of contents) {
  const destination = new URL(path.split('/').map(encodeURIComponent).join('/'), output)
  if (!destination.href.startsWith(output.href)) throw new Error(`Invalid path: ${path}`)
  await mkdir(fileURLToPath(new URL('.', destination)), { recursive: true })
  await writeFile(destination, content)
}
await writeFile(new URL('manifest.json', output), JSON.stringify({
  repository, revision: tree.sha, syncedAt: new Date().toISOString(), files: files.map(entry => entry.path),
}, null, 2) + '\n')
console.log(`Synced ${files.length} Markdown files from ${repository}@${tree.sha.slice(0, 7)}`)
