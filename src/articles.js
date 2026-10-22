export const repository = 'fankcoder/ai_agent_learn_share'
export const repositoryBranch = 'main'

export const articles = [
  { date: '001', read: '5 min', title: '三段式提示词', excerpt: '从任务、约束到输出格式，建立更稳定、更容易复用的提示词结构。', category: 'PROMPTING', file: '001三段式提示词.md' },
  { date: '002', read: '6 min', title: '结构化输出', excerpt: '用 Pydantic、JSON Schema 和接口层校验，让模型结果可以被程序可靠消费。', category: 'BUILDING', file: '002结构化输出.md' },
  { date: '003', read: '11 min', title: '流式输出', excerpt: '从模型分片到前后端实时传输，拆解流式交互的工程实现。', category: 'ENGINEERING', file: '003流式输出.md' },
  { date: '004', read: '20 min', title: 'DeepSeek Harness 源码解读', excerpt: '从插件组合、Agent 循环、会话日志到工具流水线，理解一个 Agent Harness 的内部结构。', category: 'AGENT SYSTEMS', file: '004deepseekharness源码解读.md' },
  { date: '005', read: '22 min', title: 'Harness 沙箱：从 Codex CLI 到容器与 microVM', excerpt: '从一次工具调用看懂执行权限、审批与系统隔离，对比容器、gVisor、microVM 和 WASM 在 AI Agent 中的工程取舍。', category: 'AGENT SYSTEMS', file: '005Harness沙箱原理与实践.md' },
].sort((a, b) => Number(b.date) - Number(a.date))
  .map(article => ({ ...article, href: `/blog/?article=${article.date}` }))

export const encodePath = path => path.split('/').map(encodeURIComponent).join('/')
export const rawArticleUrl = file => `https://raw.githubusercontent.com/${repository}/${repositoryBranch}/${encodePath(file)}`
export const sourceArticleUrl = file => `https://github.com/${repository}/blob/${repositoryBranch}/${encodePath(file)}`

export function articleUrl(file, hash = '') {
  const article = articles.find(item => item.file === file)
  return `${article ? article.href : `/blog/?file=${encodeURIComponent(file)}`}${hash}`
}
