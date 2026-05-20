# 交易复盘工具 MVP

一个本地可运行的交易复盘网页应用，用于记录加密货币、币股、链上股票等波段交易，并通过统计与图表帮助发现交易行为问题。

## 功能

- 仪表盘：交易次数、胜率、总盈亏、平均 R、最大盈利/亏损、左侧/右侧表现、纪律统计、错误标签统计
- 交易记录：新增、编辑、删除、搜索、按风格/结果/纪律筛选
- 交易表单：自动计算实际盈亏、盈亏百分比、R 倍数、风险回报比、交易结果
- 复盘分析：左侧交易、右侧交易、纪律、错误标签自动分析
- 数据管理：导入/导出 CSV、下载/恢复 JSON 备份、二次确认清空全部数据
- 默认内置 5 条示例交易，首次打开即可看到图表效果

## 安装依赖

```bash
npm install
```

## 本地运行

```bash
npm run dev
```

运行后在浏览器打开终端提示的地址，通常是：

```text
http://localhost:5173
```

## 打包

```bash
npm run build
```

打包结果会生成在 `dist` 目录。

如需本地预览打包后的版本：

```bash
npm run preview
```

## 部署到 GitHub Pages

项目已内置 GitHub Actions 自动部署配置：

```text
.github/workflows/deploy.yml
```

推送到 GitHub 的 `main` 分支后，GitHub Actions 会自动执行：

1. 安装依赖
2. 构建项目
3. 上传 `dist`
4. 发布到 GitHub Pages

第一次使用时，需要在 GitHub 仓库中打开：

```text
Settings -> Pages -> Build and deployment -> Source
```

然后选择：

```text
GitHub Actions
```

如果仓库名是 `trade-review-mvp`，部署后的地址通常类似：

```text
https://你的用户名.github.io/trade-review-mvp/
```

## 数据保存在哪里

当前 MVP 没有后端和登录系统，所有交易数据保存在当前浏览器的 `localStorage` 中，键名为：

```text
trade-review-mvp:v1
```

这意味着：

- 换浏览器、换电脑后不会自动同步
- 清理浏览器网站数据可能会删除记录
- 建议定期使用“下载 JSON 备份”

## 后续如何扩展成带数据库的版本

可以按以下路线升级：

1. 保留当前 `Trade` 类型定义，作为前后端共享的数据结构基础
2. 新增后端服务，例如 Node.js + Express / NestJS
3. 使用 SQLite、PostgreSQL 或 Supabase 存储交易记录
4. 将 `src/utils/storage.ts` 抽象成 `TradeRepository`
5. 当前 localStorage 方法作为本地仓库，新增 API 仓库负责请求后端
6. 增加登录系统后，在交易数据里加入 `userId`
7. 未来可增加标签趋势、月度统计、策略维度、截图上传、交易截图 OCR 等能力

## 说明

这是一个 MVP，重点是长期可用、结构清晰、方便扩展。它不接入交易所 API，也不预测行情，只做交易记录、复盘、统计和行为问题识别。
