# DeepSeek Harness 源码解读

DeepSeek Harness 是一个以插件组合为核心的 Agent 运行时。本篇是源码架构导读的首页，先建立整体心智模型，再按主题进入启动、Agent 循环、会话日志、工具执行和能力替换等参考文档。

## 推荐阅读顺序

1. [源码架构导读](deepseek-harness/source-architecture.zh.md)：从插件树、服务与事件，到 Agent 轮次和会话日志，串起运行时主流程。
2. [架构地图](deepseek-harness/architecture.zh.md)：按 Cordis、组合包、核心包、事件和扩展点快速定位代码归属。
3. [Agent 轮次与步骤生命周期](deepseek-harness/agent-lifecycle.zh.md)：用时序图核对输入领取、步骤执行、工具调用和轮次收束。
4. [工具执行流水线](deepseek-harness/tool-execution-pipeline.zh.md)：定位审批、策略、执行、结果物化和 UI 展示的拦截点。
5. [能力 Seams 与核心服务](deepseek-harness/capability-seams.zh.md)：查找 Service Definition、Provider 与 Consumer 的依赖方向。

## 参考索引

| 文档 | 适合解决的问题 |
| --- | --- |
| [事件生产方与消费方矩阵](deepseek-harness/event-producer-consumer.zh.md) | 一个事件由谁生产、哪些插件消费，以及事件属于哪种调度语义 |
| [防御性模式](deepseek-harness/defensive-patterns.zh.md) | 取消、异步状态、资源释放、回调异常和不可信输出的安全约束 |
| [插件配置目录](deepseek-harness/config-catalog.zh.md) | 插件配置字段、依赖服务和对应源码位置 |
| [子系统参考](deepseek-harness/subsystems/README.zh.md) | 各子系统的类型、服务和事件 API |

## 使用说明

- 目录中的中文文档来自 DeepSeek Harness 的公开文档，保留原有章节和源码定位。
- 文档中的源码链接指向 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 上游仓库；阅读源码时请以对应版本为准。
- 先看本页和架构导读，再进入单个子系统，能够减少在包目录之间反复跳转。
