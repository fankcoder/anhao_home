import assert from 'node:assert/strict'
import { test } from 'node:test'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { documentInfo, fetchMarkdown, remarkHeadingIds, resolveMarkdownUrl, validArticlePath } from './markdown.js'

test('Chinese headings, inline formatting and duplicate anchors match the rendered document', () => {
  const markdown = '# 阅读 **笔记**\n\n## 简介\n\n### 同名 `代码`\n\n### 同名 `代码`\n\n| A | B |\n| --- | --- |\n| 1 | 2 |'
  const info = documentInfo(markdown)
  assert.equal(info.title, '阅读 笔记')
  assert.deepEqual(info.headings.map(heading => heading.id), ['简介', '同名-代码', '同名-代码-1'])
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkHeadingIds)
  const tree = processor.runSync(processor.parse(markdown))
  assert.deepEqual(tree.children.filter(node => node.type === 'heading').map(node => node.data.hProperties.id), info.headings.map(heading => heading.id))
  assert.equal(tree.children.at(-1).type, 'table')
})

test('repository document links stay in the reader with anchors and external source links stay external', () => {
  const file = 'deepseek-harness/architecture.zh.md'
  assert.equal(resolveMarkdownUrl('../001三段式提示词.md#简介', file), '/blog/?article=001#%E7%AE%80%E4%BB%8B')
  assert.equal(resolveMarkdownUrl('subsystems/README.zh.md', file), '/blog/?file=deepseek-harness%2Fsubsystems%2FREADME.zh.md')
  assert.equal(resolveMarkdownUrl('#section', file), '#section')
  assert.equal(resolveMarkdownUrl('https://github.com/deepseek-ai/deepseek-harness/blob/main/README.md', file), 'https://github.com/deepseek-ai/deepseek-harness/blob/main/README.md')
  assert.equal(resolveMarkdownUrl('https://raw.githubusercontent.com/fankcoder/ai_agent_learn_share/main/002结构化输出.md', file), '/blog/?article=002')
})

test('images resolve relative to their Markdown file and unsafe schemes are rejected', () => {
  assert.equal(resolveMarkdownUrl('../images/example image.png', 'deepseek-harness/architecture.zh.md', true), 'https://raw.githubusercontent.com/fankcoder/ai_agent_learn_share/main/images/example%20image.png')
  for (const href of ['javascript:alert(1)', 'data:text/html,bad', 'file:///etc/passwd']) assert.equal(resolveMarkdownUrl(href, 'README.md'), '')
})

test('article selection accepts nested Markdown paths and rejects traversal and malformed input', () => {
  assert.equal(validArticlePath('deepseek-harness/subsystems/README.zh.md'), true)
  for (const file of [undefined, '', '../secret.md', '/README.md', 'a/../README.md', 'a\\README.md', 'README.md?raw=1', 'README.md\n', 'index.html']) assert.equal(validArticlePath(file), false)
})

test('loading rejects HTTP errors and SPA fallback HTML instead of displaying a false article', async t => {
  const controller = new AbortController()
  t.mock.method(globalThis, 'fetch', async () => new Response('<!doctype html><html></html>', { status: 200 }))
  await assert.rejects(fetchMarkdown('/missing.md', controller.signal), /did not return Markdown/)
  globalThis.fetch.mock.mockImplementation(async () => new Response('', { status: 404 }))
  await assert.rejects(fetchMarkdown('/missing.md', controller.signal), /404/)
  globalThis.fetch.mock.mockImplementation(async () => new Response('# Article\n\nHello', { status: 200 }))
  assert.equal(await fetchMarkdown('/article.md', controller.signal), '# Article\n\nHello')
})
