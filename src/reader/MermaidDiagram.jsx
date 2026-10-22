import React, { useEffect, useId, useState } from 'react'

let mermaidPromise
function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true,
        theme: 'base', fontFamily: 'system-ui, sans-serif',
        themeVariables: { primaryColor: '#eef5d8', primaryTextColor: '#252a21', primaryBorderColor: '#a7b48b', lineColor: '#7b8570', secondaryColor: '#e4f0f1', tertiaryColor: '#f4f5f2' },
        flowchart: { htmlLabels: false, useMaxWidth: true },
      })
      return mermaid
    }).catch(error => { mermaidPromise = null; throw error })
  }
  return mermaidPromise
}

export default function MermaidDiagram({ code }) {
  const id = `diagram-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [result, setResult] = useState({ svg: '', error: false })
  useEffect(() => {
    let active = true
    setResult({ svg: '', error: false })
    getMermaid().then(mermaid => mermaid.render(id, code)).then(({ svg }) => {
      const document = new DOMParser().parseFromString(svg, 'image/svg+xml')
      const diagram = document.documentElement
      diagram.setAttribute('width', Math.max(600, diagram.viewBox.baseVal.width))
      diagram.style.maxWidth = 'none'
      if (active) setResult({ svg: diagram.outerHTML, error: false })
    }).catch(() => { if (active) setResult({ svg: '', error: true }) })
    return () => { active = false }
  }, [code, id])

  if (result.error) return <details className="reader-diagram-fallback"><summary>图表暂时无法显示，查看源码</summary><pre><code>{code}</code></pre></details>
  if (!result.svg) return <p role="status" className="reader-muted">正在绘制图表…</p>
  return <div className="reader-diagram" role="img" aria-label="文章流程图" dangerouslySetInnerHTML={{ __html: result.svg }} />
}
