# anhao.net

fankcoder 的个人技术品牌网站，使用 React、Vite 和 Tailwind CSS 构建；`anhao.net` 是托管域名。

## 本地开发

```bash
npm install
npm run dev
```

生产构建：`npm run build`，静态产物位于 `dist/`。

## 内容入口

- 项目与文章数据：`src/main.jsx`
- 技术文章当前来自 `fankcoder/ai_agent_learn_share` 仓库
- 时间线：`src/main.jsx` 的 `milestones`
- 友链页面：`/friends/`，联系邮箱为 `fankcoder@gmail.com`；页面内容在 `src/main.jsx` 的 `FriendsPage`
- Hero 右侧为不可操控的项目 / 文章自动俄罗斯方块动画

## 部署

站点发布到服务器 `/www/anhao_home/dist`，`anhao.net` 的 Nginx 根路径指向该目录。已有项目路径保持不变：`/learn/`、`/debate/`、`/china-explorer-showcase/`。
