import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft, ArrowUpRight, ChevronDown, ExternalLink, Globe2, Mail, Menu, MoveUpRight, X,
} from 'lucide-react'
import './styles.css'
import { articles } from './articles'

const BlogPage = lazy(() => import('./reader/BlogPage'))

const projects = [
  { number: '01', started: '2026-08-05', title: 'EchoLine', subtitle: '用对话，重新理解学习。', description: '本地 AI 英语学习播放器，支持精听、影子跟读、生词复习与学习进度管理。', tags: ['AI Voice', 'Education'], href: 'https://anhao.net/learn/', color: 'peach' },
  { number: '02', started: '2026-07-14', title: 'China Explorer', subtitle: '把中国装进一张地图。', description: '面向来华旅行者的徒步与城市生存指南，连接路线、地图和实用信息。', tags: ['Product', 'Next.js'], href: '/china-explorer-showcase/', color: 'mint' },
  { number: '03', started: '2026-08-19', title: 'Debate', subtitle: '让观点在碰撞中生长。', description: 'AI 驱动的结构化辩论实验，让不同观点在多轮对话中碰撞并形成判断。', tags: ['Agents', 'Research'], href: '/debate/', color: 'lavender' },
  { number: '04', started: '2026-04-10', title: 'Email Quote Automation', subtitle: '让询盘自动变成报价。', description: '自动读取询盘邮件、翻译内容、提取需求，并根据价格规则生成中英文报价回复。', tags: ['Python', 'Automation'], href: 'https://github.com/fankcoder/email-quote-automation', color: 'peach' },
  { number: '05', started: '2023-05-23', title: 'AI Chat App', subtitle: '把 AI 对话装进手机。', description: '已上架 App Store 的 iOS AI 聊天应用示例，探索上下文管理与实时对话体验。', tags: ['iOS', 'WebSocket'], href: 'https://github.com/fankcoder/ai_chat_app', color: 'mint' },
]

const milestones = [
  { year: '2023', title: '开始与 AI 共创', text: '从全栈工程出发，把好奇心投入到 Agent 与新型交互。' },
  { year: '2024', title: '做出可以被使用的产品', text: 'China Explorer、Debate、EchoLine —— 三个关于探索、思考和学习的实验。' },
  { year: '2025', title: '记录，分享，继续构建', text: '把实践沉淀成文章，也把每一次失败变成下一次迭代的起点。' },
]

const blockPieces = [
  { label: 'EchoLine', shape: [[1, 1, 1, 1]], color: '#c8f05b' },
  { label: 'Explorer', shape: [[1, 1], [1, 1]], color: '#8fd9cc' },
  { label: 'Debate', shape: [[0, 1, 0], [1, 1, 1]], color: '#d2b8f5' },
  { label: 'LLM I/O', shape: [[1, 0], [1, 1], [0, 1]], color: '#ffb28f' },
  { label: 'JSON', shape: [[1, 1, 0], [0, 1, 1]], color: '#f3d36d' },
  { label: 'Stream', shape: [[1, 0, 0], [1, 1, 1]], color: '#9bc7f5' },
]

function FallingBlocks() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const columns = 10
    const rows = 16
    const cell = 28
    const board = Array.from({ length: rows }, () => Array(columns).fill(null))
    let pieceIndex = 0
    let active = null
    let lastStep = 0
    let animationFrame

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = columns * cell * ratio
      canvas.height = rows * cell * ratio
      canvas.style.width = `${columns * cell}px`
      canvas.style.height = `${rows * cell}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const spawn = () => {
      const piece = blockPieces[pieceIndex % blockPieces.length]
      pieceIndex += 1
      active = { ...piece, x: Math.floor((columns - piece.shape[0].length) / 2), y: -1 }
    }

    const collides = (piece, offsetY = 0) => piece.shape.some((line, row) => line.some((filled, column) => {
      if (!filled) return false
      const x = piece.x + column
      const y = piece.y + row + offsetY
      return x < 0 || x >= columns || y >= rows || (y >= 0 && board[y][x])
    }))

    const merge = () => {
      active.shape.forEach((line, row) => line.forEach((filled, column) => {
        const y = active.y + row
        const x = active.x + column
        if (filled && y >= 0) board[y][x] = { color: active.color, id: active.label }
      }))
      for (let row = rows - 1; row >= 0; row -= 1) {
        if (board[row].every(Boolean)) {
          board.splice(row, 1)
          board.unshift(Array(columns).fill(null))
          row += 1
        }
      }
      spawn()
    }

    const drawBlock = (x, y, color, label = '') => {
      const left = x * cell + 2
      const top = y * cell + 2
      const size = cell - 4
      context.fillStyle = color
      context.beginPath()
      context.roundRect(left, top, size, size, 5)
      context.fill()
      context.fillStyle = 'rgba(13, 14, 13, .72)'
      context.fillRect(left + 3, top + 3, 3, 3)
      if (label) {
        context.fillStyle = '#11130f'
        context.font = '500 7px DM Mono, monospace'
        context.fillText(label.slice(0, 9), left + 4, top + 17)
      }
    }

    const draw = (time) => {
      context.clearRect(0, 0, columns * cell, rows * cell)
      context.fillStyle = '#10120f'
      context.fillRect(0, 0, columns * cell, rows * cell)
      context.strokeStyle = 'rgba(255,255,255,.065)'
      context.lineWidth = 1
      for (let x = 0; x <= columns; x += 1) { context.beginPath(); context.moveTo(x * cell, 0); context.lineTo(x * cell, rows * cell); context.stroke() }
      for (let y = 0; y <= rows; y += 1) { context.beginPath(); context.moveTo(0, y * cell); context.lineTo(columns * cell, y * cell); context.stroke() }
      board.forEach((line, y) => line.forEach((block, x) => block && drawBlock(x, y, block.color, block.id)))
      if (!active) spawn()
      if (time - lastStep > 440) {
        lastStep = time
        if (collides(active, 1)) merge()
        else active.y += 1
      }
      active.shape.forEach((line, row) => line.forEach((filled, column) => {
        if (filled && active.y + row >= 0) drawBlock(active.x + column, active.y + row, active.color, row === 0 && column === 0 ? active.label : '')
      }))
      animationFrame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animationFrame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', resize) }
  }, [])

  return <div className="tetris-wrap" aria-label="fankcoder 项目与文章自动落块动画"><div className="tetris-topline"><span>fankcoder.exe</span><span>auto / 001</span></div><canvas ref={canvasRef} /><div className="tetris-caption"><span>PROJECTS + BLOGS</span><span>NO INPUT REQUIRED</span></div></div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  return <div className="min-h-screen bg-[#f5f5f0] text-[#171717] selection:bg-[#d6f05b] selection:text-[#171717]">
    <header className="fixed top-0 z-50 w-full border-b border-black/10 bg-[#f5f5f0]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 lg:px-10">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.04em]">fankcoder<span className="text-[#8b8d83]">.</span></a>
        <nav className="hidden items-center gap-8 text-[13px] font-medium tracking-wide md:flex">
          <a href="#work" className="nav-link">作品</a><a href="#journal" className="nav-link">文章</a><a href="#about" className="nav-link">关于我</a>
        </nav>
        <a href="mailto:hello@anhao.net" className="hidden items-center gap-2 text-[13px] font-medium md:flex">Let's talk <ArrowUpRight size={15} strokeWidth={1.5}/></a>
        <button aria-label="打开菜单" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
      {menuOpen && <div className="border-t border-black/10 bg-[#f5f5f0] px-6 py-5 md:hidden"><div className="flex flex-col gap-5 text-sm"><a href="#work" onClick={() => setMenuOpen(false)}>作品</a><a href="#journal" onClick={() => setMenuOpen(false)}>文章</a><a href="#about" onClick={() => setMenuOpen(false)}>关于我</a><a href="mailto:hello@anhao.net">Let's talk ↗</a></div></div>}
    </header>

    <main id="top">
      <section className="mx-auto grid min-h-[680px] max-w-[1280px] items-end gap-12 px-6 pb-20 pt-36 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:pb-28">
        <div><div className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[#7a7d72]"><span className="status-dot"/> Available for thoughtful collaborations</div>
          <h1 className="max-w-[850px] font-display text-[clamp(4rem,10vw,9.5rem)] font-medium leading-[0.84] tracking-[-0.085em]">Ideas into<br/><em className="font-serif font-normal tracking-[-0.07em]">intelligence.</em></h1>
          <p className="mt-10 max-w-[450px] text-[16px] leading-relaxed text-[#5b5d55]">我是 fankcoder，一名 AI 全栈开发者。<br/>在代码、产品与真实世界之间，寻找更有意义的连接。</p>
          <a href="#work" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#171717] px-5 py-3 text-[13px] font-medium text-white transition hover:bg-[#3e4038]">看看我在做什么 <MoveUpRight size={15}/></a>
        </div>
        <div className="justify-self-end lg:block"><FallingBlocks /></div>
      </section>

      <div className="border-y border-black/10"><div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 text-[11px] uppercase tracking-[0.2em] text-[#7a7d72] lg:px-10"><span>Projects / 2023—25</span><span className="hidden sm:block">Scroll to explore <ChevronDown className="ml-2 inline" size={13}/></span><span>01 — 03</span></div></div>

      <section id="work" className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10 lg:py-32"><div className="mb-12 flex items-end justify-between"><div><p className="eyebrow">01 / Projects</p><h2 className="section-title">Things I’ve<br/><em>made.</em></h2></div><p className="hidden max-w-[230px] text-right text-sm leading-relaxed text-[#7a7d72] md:block">每个项目都是一个问题的<br/>暂时答案，也是一种新的提问。</p></div>
        <div className="divide-y divide-black/10 border-y border-black/10">{projects.map((project) => <article key={project.title} className="project-row group"><div className={`project-index ${project.color}`}>{project.number}</div><div className="flex-1 py-8 md:py-10"><div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-[#8b8d83]"><span>{project.year}</span><span className="h-px w-5 bg-black/20"/><span>{project.tags.join(' · ')}</span></div><h3 className="font-display text-3xl font-medium tracking-[-0.05em] md:text-5xl">{project.title}</h3><p className="mt-2 font-serif text-lg italic text-[#5b5d55]">{project.subtitle}</p><p className="mt-5 max-w-[470px] text-sm leading-relaxed text-[#7a7d72]">{project.description}</p></div><a href={project.href} target={project.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={`打开 ${project.title}`} className="project-arrow self-center"><ExternalLink size={21} strokeWidth={1.3}/></a></article>)}</div><div className="mt-7 flex justify-end"><a href="https://github.com/fankcoder" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em]">More projects <ArrowUpRight size={14}/></a></div>
      </section>

      <section id="about" className="bg-[#d6f05b]"><div className="mx-auto grid max-w-[1280px] gap-14 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-32"><div><p className="eyebrow">02 / The thread</p><div className="mt-12 flex items-center gap-4"><div className="avatar-mark">F</div><div><p className="font-display text-lg font-medium tracking-[-0.04em]">fankcoder</p><p className="text-xs text-black/55">AI Full-stack Developer · Shanghai</p></div></div></div><div><p className="font-display text-[clamp(2.2rem,4.5vw,4.7rem)] font-medium leading-[0.98] tracking-[-0.07em]">技术是我的工具，<br/><em className="font-serif font-normal">好奇心</em> 才是我的引擎。</p><p className="mt-10 max-w-[550px] text-[15px] leading-[1.8] text-black/65">我相信，最好的数字产品不会让人感觉自己正在使用技术。它们只是自然地出现在生活里，帮我们看见原本看不见的东西，完成原本做不到的事。</p><div className="mt-12 flex flex-wrap gap-2">{['Product thinking','Generative AI','Full-stack','Creative coding'].map(x => <span key={x} className="rounded-full border border-black/20 px-4 py-2 text-xs">{x}</span>)}</div></div></div></section>

      <section className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10 lg:py-32"><div className="mb-14"><p className="eyebrow">03 / The timeline</p><h2 className="section-title mt-5">A work<br/><em>in progress.</em></h2></div><div className="timeline">{milestones.map((item, i) => <div className="timeline-item" key={item.year}><div className="timeline-year">{item.year}</div><div className="timeline-dot"/><div className="pb-12"><h3 className="font-display text-2xl font-medium tracking-[-0.04em]">{item.title}</h3><p className="mt-3 max-w-[420px] text-sm leading-relaxed text-[#7a7d72]">{item.text}</p></div>{i < milestones.length - 1 && <div className="timeline-line"/>}</div>)}</div></section>

      <section id="journal" className="border-t border-black/10 bg-white/45"><div className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10 lg:py-32"><div className="mb-12 flex items-end justify-between"><div><p className="eyebrow">04 / Blog</p><h2 className="section-title mt-5">Writing<br/><em>about AI.</em></h2></div><a href="https://github.com/fankcoder/ai_agent_learn_share" target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-xs font-medium underline-offset-4 hover:underline sm:flex">查看全部文章 <ArrowUpRight size={14}/></a></div><div className="grid gap-0 divide-y divide-black/10 border-y border-black/10">{articles.slice(0, showAll ? articles.length : 2).map(article => <article className="article-row group" key={article.title}><div className="article-date">{article.date}<br/><span>{article.read} read</span></div><div className="flex-1"><p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8b8d83]">{article.category}</p><h3 className="max-w-[600px] font-display text-2xl font-medium leading-tight tracking-[-0.04em] md:text-3xl">{article.title}</h3><p className="mt-3 max-w-[560px] text-sm leading-relaxed text-[#7a7d72]">{article.excerpt}</p></div><a href={article.href} target="_blank" rel="noreferrer" className="article-link" aria-label="阅读文章"><ArrowUpRight size={20}/></a></article>)}</div><button onClick={() => setShowAll(!showAll)} className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em]">{showAll ? '收起文章' : '加载更多文章'} <ArrowUpRight size={14}/></button></div></section>

      <section className="mx-auto max-w-[1280px] px-6 py-24 lg:px-10 lg:py-32"><div className="rounded-[2px] bg-[#171717] px-7 py-14 text-white md:px-16 md:py-20"><p className="eyebrow text-[#aeb69e]">05 / Say hello</p><div className="mt-10 flex flex-col justify-between gap-10 md:flex-row md:items-end"><h2 className="max-w-[750px] font-display text-[clamp(3rem,7vw,7.2rem)] font-medium leading-[0.86] tracking-[-0.08em]">Have a good<br/><em className="font-serif font-normal">question?</em></h2><a href="mailto:hello@anhao.net" className="group flex shrink-0 items-center gap-3 rounded-full bg-[#d6f05b] px-6 py-4 text-sm font-medium text-black transition hover:bg-white">hello@anhao.net <ArrowUpRight size={17} className="transition group-hover:translate-x-1 group-hover:-translate-y-1"/></a></div></div></section>
    </main>
    <footer className="border-t border-black/10"><div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-6 py-8 text-xs text-[#7a7d72] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2025 Anhao. Built with curiosity.</span><div className="flex items-center gap-5"><a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="font-medium">GH</a><a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="font-medium">in</a><a href="mailto:hello@anhao.net" aria-label="Email"><Globe2 size={16}/></a></div></div></footer>
  </div>
}

const makeBar = (word, color) => ({ kind: 'bar', word, shape: [Array.from(word, () => 1)], color })
const barPieces = [
  makeBar('PYTHON', '#c8f05b'), makeBar('REACT', '#8fd9cc'), makeBar('FASTAPI', '#d2b8f5'),
  makeBar('JAVASCRIPT', '#f3d36d'), makeBar('TRANSFORMERS', '#ffb28f'), makeBar('HARNESS', '#9bc7f5'),
  makeBar('VIM', '#f0a6c7'), makeBar('RAG', '#c8f05b'), makeBar('MYSQL', '#8fd9cc'),
  makeBar('MONGODB', '#d2b8f5'), makeBar('REDIS', '#ffb28f'), makeBar('KUBERNETES', '#9bc7f5'),
  makeBar('LANGCHAIN', '#f3d36d'), makeBar('LANGGRAPH', '#c8f05b'), makeBar('NEXTJS', '#8fd9cc'),
  makeBar('DOCKER', '#d2b8f5'), makeBar('GRAPHQL', '#f0a6c7'),
]
const rectanglePiece = { kind: 'rectangle', word: 'AIMODELS', shape: [[1, 1, 1, 1], [1, 1, 1, 1]], color: '#ffb28f' }
const squarePiece = { kind: 'square', word: 'CODE', shape: [[1, 1], [1, 1]], color: '#d2b8f5' }
const verticalPiece = { kind: 'vertical', word: 'LLM', shape: [[1], [1], [1]], color: '#8fd9cc' }
const technicalPieces = [...barPieces, rectanglePiece, squarePiece, verticalPiece]

function FallingBlocksV2() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const columns = 12
    const rows = 18
    const cell = 32
    const board = Array.from({ length: rows }, () => Array(columns).fill(null))
    let pieceIndex = 0
    let active = null
    let clearing = null
    let clearStarted = 0
    let lastStep = 0
    let animationFrame

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = columns * cell * ratio
      canvas.height = rows * cell * ratio
      canvas.style.width = `${columns * cell}px`
      canvas.style.height = `${rows * cell}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const spawn = () => {
      const piece = technicalPieces[pieceIndex % technicalPieces.length]
      pieceIndex += 1
      active = { ...piece, letters: [...piece.word], x: Math.floor((columns - piece.shape[0].length) / 2), y: -piece.shape.length }
    }

    const collides = (piece, offsetY = 0) => piece.shape.some((line, row) => line.some((filled, column) => {
      if (!filled) return false
      const x = piece.x + column
      const y = piece.y + row + offsetY
      return x < 0 || x >= columns || y >= rows || (y >= 0 && board[y][x])
    }))

    const merge = () => {
      let letterIndex = 0
      active.shape.forEach((line, row) => line.forEach((filled, column) => {
        if (!filled) return
        const y = active.y + row
        const x = active.x + column
        const letter = active.letters[letterIndex] || active.word[active.word.length - 1]
        letterIndex += 1
        if (y >= 0 && y < rows) board[y][x] = { color: active.color, letter }
      }))
    }

    const pressureHigh = () => board.slice(rows - 3).some(line => line.some(Boolean))

    const findClearPath = () => {
      for (let row = rows - 1; row >= rows - 3; row -= 1) {
        const cells = board[row].map((block, column) => block ? { x: column, y: row } : null).filter(Boolean)
        if (cells.length >= columns - 1) return cells
      }
      let start = null
      for (let row = rows - 1; row >= 0 && !start; row -= 1) for (let column = 0; column < columns; column += 1) if (board[row][column]) { start = { x: column, y: row }; break }
      if (!start) return []
      const queue = [start]
      const visited = new Set([`${start.x}:${start.y}`])
      const path = []
      while (queue.length) {
        const point = queue.shift()
        path.push(point)
        ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const x = point.x + dx
          const y = point.y + dy
          const key = `${x}:${y}`
          if (x >= 0 && x < columns && y >= 0 && y < rows && board[y][x] && !visited.has(key)) { visited.add(key); queue.push({ x, y }) }
        })
      }
      return path.slice(0, Math.max(4, Math.min(path.length, 10)))
    }

    const beginClear = () => {
      const path = findClearPath()
      if (path.length) { clearing = path; clearStarted = performance.now(); active = null }
    }

    const applyClear = () => {
      const cells = new Set(clearing.map(point => `${point.x}:${point.y}`))
      for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) if (cells.has(`${column}:${row}`)) board[row][column] = null
      for (let column = 0; column < columns; column += 1) {
        const remaining = board.map(line => line[column]).filter(Boolean)
        for (let row = rows - 1; row >= 0; row -= 1) board[row][column] = remaining.pop() || null
      }
      clearing = null
      spawn()
    }

    const drawBlock = (x, y, block, isClearing = false) => {
      const left = x * cell + 2
      const top = y * cell + 2
      const size = cell - 4
      const pulse = isClearing && Math.floor((performance.now() - clearStarted) / 90) % 2 === 0
      context.globalAlpha = pulse ? .3 : 1
      context.fillStyle = block.color
      context.beginPath()
      context.roundRect(left, top, size, size, 6)
      context.fill()
      context.globalAlpha = 1
      context.fillStyle = '#11130f'
      context.font = '600 13px DM Mono, monospace'
      context.textAlign = 'center'
      context.fillText(block.letter, left + size / 2, top + 19)
      context.textAlign = 'start'
    }

    const draw = (time) => {
      context.clearRect(0, 0, columns * cell, rows * cell)
      context.fillStyle = '#10120f'
      context.fillRect(0, 0, columns * cell, rows * cell)
      context.strokeStyle = 'rgba(255,255,255,.065)'
      context.lineWidth = 1
      for (let x = 0; x <= columns; x += 1) { context.beginPath(); context.moveTo(x * cell, 0); context.lineTo(x * cell, rows * cell); context.stroke() }
      for (let y = 0; y <= rows; y += 1) { context.beginPath(); context.moveTo(0, y * cell); context.lineTo(columns * cell, y * cell); context.stroke() }
      board.forEach((line, y) => line.forEach((block, x) => block && drawBlock(x, y, block, clearing?.some(point => point.x === x && point.y === y))))
      if (clearing) {
        context.strokeStyle = '#ffffff'
        context.lineWidth = 2
        context.beginPath()
        clearing.forEach((point, index) => { if (index === 0) context.moveTo(point.x * cell + cell / 2, point.y * cell + cell / 2); else context.lineTo(point.x * cell + cell / 2, point.y * cell + cell / 2) })
        context.stroke()
        if (time - clearStarted > 520) applyClear()
      } else {
        if (!active) spawn()
        if (time - lastStep > 430) {
          lastStep = time
          if (collides(active, 1)) { merge(); if (pressureHigh()) beginClear(); else spawn() } else active.y += 1
        }
        if (active) {
          let letterIndex = 0
          active.shape.forEach((line, row) => line.forEach((filled, column) => { if (filled && active.y + row >= 0) { drawBlock(active.x + column, active.y + row, { color: active.color, letter: active.letters[letterIndex] || '' }); letterIndex += 1 } }))
        }
      }
      animationFrame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animationFrame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', resize) }
  }, [])

  return <div className="tetris-wrap tetris-large" aria-label="fankcoder 技术关键词自动落块动画"><div className="tetris-topline"><span>fankcoder.exe</span><span>auto / core words</span></div><canvas ref={canvasRef} /><div className="tetris-caption"><span>PYTHON · REACT · AGENTS</span><span>AUTO CLEAR</span></div></div>
}

function FallingBlocksV3() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const columns = 12
    const rows = 18
    const cell = 32
    const board = Array.from({ length: rows }, () => Array(columns).fill(null))
    let pieceIndex = 0
    let active = null
    let pendingRows = []
    let clearStarted = 0
    let resetting = false
    let resetStarted = 0
    let lastVertical = 0
    let lastHorizontal = 0
    let animationFrame
    let slotColumn = Math.random() < 0.5 ? 0 : columns - 1
    let barBag = []

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = columns * cell * ratio
      canvas.height = rows * cell * ratio
      canvas.style.width = `${columns * cell}px`
      canvas.style.height = `${rows * cell}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const spawn = () => {
      const cycle = pieceIndex % 7
      if (!barBag.length) barBag = [...barPieces].sort(() => Math.random() - 0.5)
      const piece = cycle < 3 ? barBag.pop() : cycle === 3 ? verticalPiece : cycle === 4 ? rectanglePiece : cycle === 5 ? squarePiece : barBag.pop() || barPieces[Math.floor(Math.random() * barPieces.length)]
      pieceIndex += 1
      const maxX = columns - piece.shape[0].length
      const targetX = piece.kind === 'bar' ? (slotColumn === 0 ? 1 : 0) : piece.kind === 'vertical' ? slotColumn : Math.floor(Math.random() * (maxX + 1))
      active = { ...piece, letters: [...piece.word], x: Math.floor(maxX / 2), targetX, y: -piece.shape.length }
    }

    const collides = (piece, offsetX = 0, offsetY = 0) => piece.shape.some((line, row) => line.some((filled, column) => {
      if (!filled) return false
      const x = piece.x + column + offsetX
      const y = piece.y + row + offsetY
      return x < 0 || x >= columns || y >= rows || (y >= 0 && board[y][x])
    }))

    const merge = () => {
      let letterIndex = 0
      active.shape.forEach((line, row) => line.forEach((filled, column) => {
        if (!filled) return
        const y = active.y + row
        const x = active.x + column
        const letter = active.letters[letterIndex] || ''
        letterIndex += 1
        if (y >= 0 && y < rows) board[y][x] = { color: active.color, letter }
      }))
    }

    const settleColumns = () => {
      for (let column = 0; column < columns; column += 1) {
        const blocks = board.map(line => line[column]).filter(Boolean)
        for (let row = rows - 1; row >= 0; row -= 1) board[row][column] = blocks.pop() || null
      }
    }

    const findFullRows = () => board.reduce((result, line, row) => line.every(Boolean) ? [...result, row] : result, [])

    const beginReset = () => {
      resetting = true
      resetStarted = performance.now()
      active = null
      pendingRows = []
    }

    const resetBoard = () => {
      board.forEach(line => line.fill(null))
      pieceIndex = 0
      barBag = []
      slotColumn = Math.random() < 0.5 ? 0 : columns - 1
      resetting = false
      lastVertical = performance.now()
      lastHorizontal = performance.now()
      spawn()
    }

    const startNextTurn = () => {
      settleColumns()
      const fullRows = findFullRows()
      if (fullRows.length) { pendingRows = fullRows; clearStarted = performance.now(); active = null }
      else spawn()
    }

    const clearRows = () => {
      pendingRows.sort((a, b) => b - a).forEach(row => { board.splice(row, 1); board.unshift(Array(columns).fill(null)) })
      pendingRows = []
      settleColumns()
      spawn()
    }

    const drawBlock = (x, y, block, flashing = false) => {
      const left = x * cell + 2
      const top = y * cell + 2
      const size = cell - 4
      const pulse = flashing && Math.floor((performance.now() - clearStarted) / 90) % 2 === 0
      context.globalAlpha = pulse ? .22 : 1
      context.fillStyle = block.color
      context.beginPath()
      context.roundRect(left, top, size, size, 6)
      context.fill()
      context.globalAlpha = 1
      context.fillStyle = '#11130f'
      context.font = '600 13px DM Mono, monospace'
      context.textAlign = 'center'
      context.fillText(block.letter, left + size / 2, top + 19)
      context.textAlign = 'start'
    }

    const draw = (time) => {
      context.clearRect(0, 0, columns * cell, rows * cell)
      context.fillStyle = '#10120f'
      context.fillRect(0, 0, columns * cell, rows * cell)
      context.strokeStyle = 'rgba(255,255,255,.065)'
      context.lineWidth = 1
      for (let x = 0; x <= columns; x += 1) { context.beginPath(); context.moveTo(x * cell, 0); context.lineTo(x * cell, rows * cell); context.stroke() }
      for (let y = 0; y <= rows; y += 1) { context.beginPath(); context.moveTo(0, y * cell); context.lineTo(columns * cell, y * cell); context.stroke() }
      board.forEach((line, y) => line.forEach((block, x) => block && drawBlock(x, y, block, pendingRows.includes(y) || resetting)))
      if (resetting) {
        const elapsed = time - resetStarted
        context.fillStyle = `rgba(200, 240, 91, ${Math.min(.28, elapsed / 1800)})`
        context.fillRect(0, 0, columns * cell, rows * cell)
        context.fillStyle = '#ffffff'
        context.font = '600 12px DM Mono, monospace'
        context.textAlign = 'center'
        context.fillText('STACK FULL · RESTARTING', columns * cell / 2, rows * cell / 2)
        context.textAlign = 'start'
        if (elapsed > 720) resetBoard()
      } else if (pendingRows.length) {
        if (time - clearStarted > 500) clearRows()
      } else {
        if (!active) spawn()
        if (time - lastHorizontal > 180) {
          lastHorizontal = time
          if (active.x < active.targetX && !collides(active, 1)) active.x += 1
          else if (active.x > active.targetX && !collides(active, -1)) active.x -= 1
        }
        if (time - lastVertical > 360) {
          lastVertical = time
          if (collides(active, 0, 1)) {
            const overTop = active.shape.some((line, row) => line.some(filled => filled && active.y + row < 0))
            if (overTop || board.every(line => line.every(Boolean))) beginReset()
            else { merge(); startNextTurn() }
          }
          else active.y += 1
        }
        if (active) {
          let letterIndex = 0
          active.shape.forEach((line, row) => line.forEach((filled, column) => { if (filled && active.y + row >= 0) { drawBlock(active.x + column, active.y + row, { color: active.color, letter: active.letters[letterIndex] || '' }); letterIndex += 1 } }))
        }
      }
      animationFrame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animationFrame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('resize', resize) }
  }, [])

  return <div className="tetris-wrap tetris-large" aria-label="fankcoder 技术关键词自动落块动画"><div className="tetris-topline"><span>fankcoder.exe</span><span>gravity / auto</span></div><canvas ref={canvasRef} /><div className="tetris-caption"><span>BAR · RECT · SQUARE · VERTICAL</span><span>FULL ROW CLEARS</span></div></div>
}

const contactEmail = 'fankcoder@gmail.com'
const friendMailHref = `mailto:${contactEmail}?subject=${encodeURIComponent('互换友链 · anhao.net')}&body=${encodeURIComponent('你好，fankcoder！\n\n我想与你互换友链，以下是我的站点信息：\n\n站点名称：\n站点地址：\n站点简介：\n\n期待你的回复！')}`

function ReferenceFooter() {
  return <footer className="reference-footer"><span>© 2025 fankcoder</span><div><a href="/friends/">友链</a><a href="https://github.com/fankcoder" target="_blank" rel="noreferrer">GitHub</a><a href={`mailto:${contactEmail}`}>Email</a><span>anhao.net</span></div></footer>
}

function FriendsPage() {
  return <main className="reference-shell friends-shell">
    <article className="reference-frame friends-frame">
      <nav className="friends-nav" aria-label="页面导航"><a href="/" className="friends-back"><ArrowLeft size={15} aria-hidden="true"/> 返回首页</a><a href="/">@fankcoder</a></nav>
      <header className="friends-header"><p className="mini-heading">Friends / 友情链接</p><h1>友链</h1><p>在独立的站点里，遇见同样热爱技术与分享的人。</p></header>
      <section className="friends-section" aria-labelledby="friends-heading"><h2 id="friends-heading">友链列表</h2><ul className="notes-list"><li><a href="https://do1999.com" target="_blank" rel="noopener noreferrer"><span className="project-list-copy"><strong>Let me Attente</strong><small>do1999.com</small></span><ArrowUpRight size={16} aria-hidden="true"/></a></li></ul></section>
      <section className="friends-section" aria-labelledby="site-heading">
        <h2 id="site-heading">我的站点</h2>
        <dl className="friends-site"><div><dt>名称</dt><dd>fankcoder</dd></div><div><dt>地址</dt><dd><a href="https://anhao.net/">https://anhao.net/ <ArrowUpRight size={13} aria-hidden="true"/></a></dd></div><div><dt>简介</dt><dd>AI 全栈开发者，记录 Agent、LLM 应用开发与产品实践。</dd></div></dl>
      </section>
      <section className="friends-section" aria-labelledby="exchange-heading">
        <h2 id="exchange-heading">交换友链</h2>
        <p>欢迎分享你的技术博客或个人站点，聊聊彼此正在做的事。</p>
        <p>互换友链请来信，附上站点名称、地址和简短介绍。</p>
        <a className="friends-email" href={friendMailHref}><Mail size={19} aria-hidden="true"/><span>{contactEmail}</span><ArrowUpRight size={17} aria-hidden="true"/></a>
      </section>
      <ReferenceFooter />
    </article>
  </main>
}

function ReferenceApp() {
  const [longBio, setLongBio] = useState(false)
  const visibleProjects = [...projects].sort((first, second) => second.started.localeCompare(first.started))

  return <main className="reference-shell">
    <article className="reference-frame">
      <div className="reference-layout">
        <div className="reference-copy">
          <h1 className="reference-title"><a href="https://github.com/fankcoder" target="_blank" rel="noreferrer"><span className="title-at">@</span>fankcoder</a></h1>
          <section className="bio-section" aria-label="个人简介">
            <div className="bio-toggle"><span>Bio</span><div className="bio-options"><button type="button" onClick={() => setLongBio(false)} aria-pressed={!longBio}>Default</button><button type="button" onClick={() => setLongBio(true)} aria-pressed={longBio}>Long</button></div></div>
            <div className="bio-content"><p>我是一名 AI 全栈开发者，专注于把模型能力做成真正有人使用的产品。我在产品、工程和人机协作的交叉处工作。</p>{longBio && <><p>我做过 EchoLine、China Explorer 和 Debate，也持续记录 Agent、LLM 应用开发与流式交互的工程实践。</p><p>anhao.net 是我的品牌托管域名；这里是 fankcoder 的项目、文章和持续构建中的想法。</p></>}</div>
          </section>

          <div className="writing-index">
            <section aria-labelledby="projects-heading"><h2 id="projects-heading">Projects</h2><ul className="notes-list">{visibleProjects.map(project => <li key={project.title}><a href={project.href} target={project.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><span className="project-list-copy"><strong>{project.title}</strong><small>{project.description}</small></span><time>{project.started}</time></a></li>)}</ul><a href="https://github.com/fankcoder" target="_blank" rel="noreferrer" className="more-link">More projects <ArrowUpRight size={13}/></a></section>
            <section aria-labelledby="blogs-heading"><h2 id="blogs-heading"><a href="/blog/">Blogs</a></h2><div className="blogs-list">{articles.map(article => <a className="blog-row" href={article.href} key={article.title}><span>{article.title}</span><time>{article.date}</time></a>)}</div></section>
            <section aria-labelledby="friends-home-heading"><h2 id="friends-home-heading"><a className="friends-home-link" href="/friends/">友链 <ArrowUpRight size={14} aria-hidden="true"/></a></h2><p className="friends-home-copy">欢迎互换友链，认识更多热爱技术与分享的朋友。</p></section>
          </div>

          <section className="mini-timeline" aria-label="Timeline"><div className="mini-heading"><span>Timeline</span><span>2023 — now</span></div><div className="mini-events">{milestones.map(item => <div key={item.year}><time>{item.year}</time><p>{item.title}</p></div>)}</div></section>
        </div>
        <aside className="reference-visual"><FallingBlocksV3 /></aside>
      </div>
      <ReferenceFooter />
    </article>
  </main>
}

const isFriendsPage = /^\/friends(?:\/|$)/.test(window.location.pathname)
const isBlogPage = /^\/blog(?:\/|$)/.test(window.location.pathname)
createRoot(document.getElementById('root')).render(isBlogPage
  ? <Suspense fallback={<main className="reference-shell" role="status">正在加载文章…</main>}><BlogPage /></Suspense>
  : isFriendsPage ? <FriendsPage /> : <ReferenceApp />)
