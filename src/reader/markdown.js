import GithubSlugger from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { articleUrl, rawArticleUrl, repository, repositoryBranch, sourceArticleUrl } from '../articles.js'

function labelHeadings(tree) {
  const slugger = new GithubSlugger()
  const headings = []
  let title = ''
  let titleId = ''
  const first = tree.children[0]
  if (first?.type === 'heading' && first.depth === 1) {
    title = toString(first)
    titleId = slugger.slug(title)
    tree.children.shift()
  }
  visit(tree, 'heading', node => {
    const text = toString(node)
    const id = slugger.slug(text)
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }
    if (node.depth <= 3) headings.push({ id, text, depth: node.depth })
  })
  return { title, titleId, headings }
}

export function documentInfo(markdown) {
  return labelHeadings(unified().use(remarkParse).use(remarkGfm).parse(markdown))
}

export function remarkHeadingIds() {
  return tree => { labelHeadings(tree) }
}

export function validArticlePath(file) {
  return typeof file === 'string' && file.length <= 500 && file.endsWith('.md')
    && !file.includes('\\') && !/[\u0000-\u001f?#]/.test(file)
    && file.split('/').every(segment => segment && segment !== '.' && segment !== '..')
}

export function resolveMarkdownUrl(href, file, image = false) {
  if (!href) return ''
  if (href.startsWith('#')) return href
  let url
  try { url = new URL(href, sourceArticleUrl(file)) } catch { return '' }
  if (!['https:', 'http:', ...(image ? [] : ['mailto:'])].includes(url.protocol)) return ''
  const blobPrefix = `/${repository}/blob/${repositoryBranch}/`
  const rawPrefix = `/${repository}/${repositoryBranch}/`
  const prefix = url.hostname === 'github.com' ? blobPrefix
    : url.hostname === 'raw.githubusercontent.com' ? rawPrefix : null
  if (!prefix || !url.pathname.startsWith(prefix)) return url.href
  let path
  try { path = decodeURIComponent(url.pathname.slice(prefix.length)) } catch { return '' }
  if (image) return `${rawArticleUrl(path)}${url.search}${url.hash}`
  if (!validArticlePath(path)) return url.href
  return articleUrl(path, url.hash)
}

export async function fetchMarkdown(url, signal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]) })
  if (!response.ok) throw new Error(`Article request failed: ${response.status}`)
  const content = await response.text()
  if (!content.trim() || /^\s*(?:<!doctype html|<html[\s>])/i.test(content)) {
    throw new Error('The server did not return Markdown')
  }
  return content
}
