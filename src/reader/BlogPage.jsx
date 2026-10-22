import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, Copy, ExternalLink, List, RefreshCw } from 'lucide-react'
import { articles, encodePath, rawArticleUrl, sourceArticleUrl } from '../articles.js'
import { documentInfo, fetchMarkdown, remarkHeadingIds, resolveMarkdownUrl, validArticlePath } from './markdown.js'
import MermaidDiagram from './MermaidDiagram'
import './reader.css'

function useArticle(file) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ markdown: '', loading: true, error: false })
  useEffect(() => {
    if (!file) return
    const controller = new AbortController()
    let remoteReady = false
    setState({ markdown: '', loading: true, error: false })
    const local = fetchMarkdown(`/articles/${encodePath(file)}`, controller.signal).then(markdown => {
      if (!controller.signal.aborted && !remoteReady) setState({ markdown, loading: false, error: false })
    })
    const remote = fetchMarkdown(rawArticleUrl(file), controller.signal).then(markdown => {
      remoteReady = true
      if (!controller.signal.aborted) setState({ markdown, loading: false, error: false })
    })
    Promise.allSettled([local, remote]).then(results => {
      if (!controller.signal.aborted && results.every(result => result.status === 'rejected')) {
        setState({ markdown: '', loading: false, error: true })
      }
    })
    return () => controller.abort()
  }, [file, attempt])
  return { ...state, retry: () => setAttempt(value => value + 1) }
}

function CodeBlock({ node, children, ...props }) {
  const preRef = useRef(null)
  const timerRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  useEffect(() => () => clearTimeout(timerRef.current), [])
  const code = React.Children.toArray(children).find(React.isValidElement)
  const language = code?.props.className?.match(/language-([^\s]+)/)?.[1] || 'text'
  if (language === 'mermaid') return <MermaidDiagram code={String(code.props.children).trim()} />
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preRef.current.textContent)
      setCopied(true)
      setCopyFailed(false)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1800)
    } catch { setCopyFailed(true) }
  }
  return <div className="reader-code">
    <div className="reader-code-bar"><span>{language}</span><button type="button" onClick={copy} title={copied ? '已复制' : '复制代码'} aria-label={copied ? '已复制' : '复制代码'}>{copied ? <Check size={15}/> : <Copy size={15}/>}</button></div>
    {copyFailed && <p className="reader-copy-error" role="status">复制失败，请选中代码后复制。</p>}
    <pre {...props} ref={preRef}>{children}</pre>
  </div>
}

function ArticleBody({ markdown, file }) {
  const components = useMemo(() => ({
    pre: CodeBlock,
    a: ({ node, href, children, ...props }) => {
      const url = resolveMarkdownUrl(href, file)
      const external = /^https?:/.test(url)
      return <a {...props} href={url || undefined} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>
    },
    img: ({ node, src, alt, ...props }) => <img {...props} src={resolveMarkdownUrl(src, file, true) || undefined} alt={alt || ''} loading="lazy" />,
    table: ({ node, ...props }) => <div className="reader-table"><table {...props}/></div>,
  }), [file])
  return <div className="markdown-body"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm, remarkHeadingIds]} rehypePlugins={[[rehypeHighlight, { detect: false }]]} components={components}>{markdown}</ReactMarkdown></div>
}

function Contents({ headings, active, onNavigate }) {
  return <nav aria-label="文章目录"><ol>{headings.map(heading => <li key={heading.id} className={heading.depth === 3 ? 'reader-toc-sub' : undefined}><a href={`#${heading.id}`} aria-current={active === heading.id ? 'location' : undefined} onClick={onNavigate}>{heading.text}</a></li>)}</ol></nav>
}

function ReaderHeader() {
  return <header className="reader-topbar"><div><a href="/" className="reader-brand">@fankcoder</a><nav aria-label="博客导航"><a href="/blog/">文章</a><a href="/friends/">友链</a><a href="https://github.com/fankcoder/ai_agent_learn_share" target="_blank" rel="noreferrer" title="在 GitHub 查看文章仓库" aria-label="在 GitHub 查看文章仓库"><ExternalLink size={16}/></a></nav></div></header>
}

function ArticleIndex() {
  useEffect(() => { document.title = '文章 · fankcoder' }, [])
  return <><ReaderHeader/><main className="reader-index"><a className="reader-back" href="/"><ArrowLeft size={15}/> 返回首页</a><header><p className="reader-kicker">WRITING / 技术笔记</p><h1>文章</h1><p>关于 Agent、LLM 应用开发，以及把想法做成产品的实践。</p></header><div className="reader-index-list">{articles.map(article => <a href={article.href} key={article.date}><span className="reader-index-number">{article.date}</span><div><span className="reader-kicker">{article.category}</span><h2>{article.title}</h2><p>{article.excerpt}</p></div><ArrowUpRight size={19}/></a>)}</div><footer className="reader-footer">© {new Date().getFullYear()} fankcoder</footer></main></>
}

function ArticleReader({ file, article }) {
  const { markdown, loading, error, retry } = useArticle(file)
  const info = useMemo(() => documentInfo(markdown), [markdown])
  const [active, setActive] = useState('')
  const [progress, setProgress] = useState(0)
  const title = info.title || article?.title || file.split('/').pop().replace(/\.md$/, '')
  const index = articles.findIndex(item => item.file === file)

  useEffect(() => { document.title = `${title} · fankcoder` }, [title])
  useEffect(() => {
    if (!markdown) return
    const headings = [...document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')]
    let frame
    const update = () => {
      frame = undefined
      const range = document.documentElement.scrollHeight - window.innerHeight
      setProgress(range > 0 ? Math.min(100, Math.max(0, window.scrollY / range * 100)) : 100)
      let current = ''
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 150) current = heading.id
        else break
      }
      setActive(current)
    }
    const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(document.body)
    if (window.location.hash) {
      try { document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView() } catch { /* Ignore malformed anchors. */ }
    }
    return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [markdown])

  return <><ReaderHeader/><div className="reader-progress" style={{ width: `${progress}%` }} aria-hidden="true"/>
    <main className="reader-layout">
      <article className="reader-article">
        <a className="reader-back" href="/blog/"><ArrowLeft size={15}/> 全部文章</a>
        <header className="reader-article-header"><p className="reader-kicker">{article?.category || 'TECH NOTES'}{article && ` / ${article.date}`}</p><h1 id={info.titleId || undefined}>{title}</h1><div className="reader-meta"><span>fankcoder</span>{markdown && <span>约 {Math.max(1, Math.ceil(markdown.replace(/```[\s\S]*?```/g, '').length / 500))} 分钟</span>}<a href={sourceArticleUrl(file)} target="_blank" rel="noopener noreferrer">GitHub 原文 <ArrowUpRight size={13}/></a></div></header>
        {loading && <div className="reader-loading" role="status"><span/>正在加载文章…</div>}
        {error && <div className="reader-error" role="alert"><h2>文章暂时无法加载</h2><p>请稍后重试，也可以前往 GitHub 阅读原文。</p><div><button type="button" onClick={retry}><RefreshCw size={15}/> 重试</button><a href={sourceArticleUrl(file)} target="_blank" rel="noopener noreferrer">查看原文 <ArrowUpRight size={15}/></a></div></div>}
        {!!markdown && <>
          {!!info.headings.length && <details className="reader-mobile-toc"><summary><List size={16}/> 文章目录</summary><Contents headings={info.headings} active={active}/></details>}
          <ArticleBody markdown={markdown} file={file}/>
          <nav className="reader-pagination" aria-label="文章翻页">{index > 0 ? <a href={articles[index - 1].href}><span><ArrowLeft size={13}/> 上一篇</span><strong>{articles[index - 1].title}</strong></a> : <a href="/blog/"><span><ArrowLeft size={13}/> 返回</span><strong>全部文章</strong></a>}{index >= 0 && index < articles.length - 1 && <a href={articles[index + 1].href}><span>下一篇 <ArrowRight size={13}/></span><strong>{articles[index + 1].title}</strong></a>}</nav>
        </>}
        <footer className="reader-footer"><span>© {new Date().getFullYear()} fankcoder</span><a href="mailto:fankcoder@gmail.com">联系我 <ArrowUpRight size={13}/></a></footer>
      </article>
      <aside className="reader-sidebar"><div className="reader-sidebar-inner">{!!info.headings.length && <><p className="reader-kicker">本文目录</p><Contents headings={info.headings} active={active}/></>}<a className="reader-to-top" href="#" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><ArrowUp size={14}/> 回到顶部</a></div></aside>
    </main></>
}

export default function BlogPage() {
  const params = new URLSearchParams(window.location.search)
  const article = articles.find(item => item.date === params.get('article'))
  const file = params.has('article') ? article?.file : params.get('file')
  if (!params.has('article') && !params.has('file')) return <ArticleIndex/>
  if (!validArticlePath(file)) return <><ReaderHeader/><main className="reader-index"><h1>未找到这篇文章</h1><a className="reader-back" href="/blog/"><ArrowLeft size={15}/> 返回文章列表</a></main></>
  return <ArticleReader file={file} article={article || articles.find(item => item.file === file)}/>
}
