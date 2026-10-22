# anhao.net

fankcoder 的个人技术品牌网站，使用 React、Vite 和 Tailwind CSS 构建；`anhao.net` 是托管域名。

## 本地开发

```bash
npm install
npm run dev
```

生产构建：`npm run build`，静态产物位于 `dist/`。

## 内容入口

- 项目数据：`src/main.jsx`；文章目录：`src/articles.js`
- 技术文章当前来自 `fankcoder/ai_agent_learn_share` 仓库
- 文章列表：`/blog/`；阅读页面示例：`/blog/?article=001`
- Markdown 阅读器：`src/reader/`，支持目录、代码高亮与复制、表格、Mermaid 和仓库内文档跳转
- 阅读时优先展示 `public/articles/` 中的发布副本，同时尝试加载 GitHub 最新原文；GitHub 不通时仍可正常阅读
- 更新文章副本：`npm run sync:articles`，同步仓库中全部 Markdown 后再构建部署；新增首页文章入口需更新 `src/articles.js`
- 时间线：`src/main.jsx` 的 `milestones`
- 友链页面：`/friends/`，联系邮箱为 `fankcoder@gmail.com`；页面内容在 `src/main.jsx` 的 `FriendsPage`
- Hero 右侧为不可操控的项目 / 文章自动俄罗斯方块动画

## 部署

站点发布到服务器 `/www/anhao_home/dist`，`anhao.net` 的 Nginx 根路径指向该目录。已有项目路径保持不变：`/learn/`、`/debate/`、`/china-explorer-showcase/`。
