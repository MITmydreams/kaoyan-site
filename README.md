# 考研备考小家（Starlight）

**栈：** Astro Starlight（对齐 `GapOS/Research/site` 信息架构）  
**定位：** 计划书 + 知识点 + 错题本 + 经验库 + 教辅架。Markdown 是真相源。

## 本地预览

```bash
cd site
npm install    # 首次（需联网）；起飞前务必跑完
npm run dev
```

浏览器打开 `http://localhost:4321`。  
改 `src/content/docs/**/*.md(x)` 会热更新。

构建检查：`npm run build`。

## 离线 / 飞机上写

本站是本地静态站，**不依赖外网也能边写边预览**（字体已改用本机中文字体，KaTeX 在 `node_modules` 里）。

起飞前检查一次：

```bash
cd site
test -d node_modules || npm install
npm run build   # 可选：确认能编过
```

飞机上：

```bash
cd site
npm run dev
```

然后打开 `http://localhost:4321`，用 Cursor 改 Markdown 即可。  
草稿也可先写在 `Desktop/kaoyan/ExamFor2027/`，落地后再拷进 `src/content/docs/`。

注意：没装过依赖时不要指望机上 `npm install`（没网）；端口钉死在 4321。

## 目录说明

| 路径 | 用途 |
|------|------|
| `src/content/docs/start/` | 站点地图、怎么记一笔 |
| `src/content/docs/plan/` | 总览、里程碑、本周、打卡 `log/YYYY-MM/` |
| `src/content/docs/knowledge/<科目>/` | 科目地图 + `chapters/` 一章一页 |
| `src/content/docs/wrongs/<科目>/` | 错题；标签说明在 `wrongs/tags.md` |
| `src/content/docs/lessons/` | 方法 / 心态 / 模考 / 踩坑 |
| `src/content/docs/shelf/` | 教辅总览 + `books/` 一书一页 |
| `src/content/docs/gre/` | GRE：Verbal / Quant / Writing |
| `src/lib/gre-db.ts` | GRE 本机 IndexedDB（日后可换远程） |
| `src/components/gre/` | GRE 交互组件 |

侧栏分组在 `astro.config.mjs`；`autogenerate` 包在 `{ label, items: [{ autogenerate }] }` 里（Starlight ≥0.39）。

## 各模块往哪填

1. **先改占位身份**：`plan/overview.md`（年份、学硕/专硕、科目）  
2. **每周**：改 `plan/week/current.md`（或复制 `template.md`）  
3. **学新内容**：`knowledge/<科目>/chapters/0N-xxx.md`  
4. **错题**：`wrongs/<科目>/W-….md`，链回知识点  
5. **心得**：`lessons/<分类>/`  
6. **教辅**：先改 `shelf/overview.md` 表，再改 `shelf/books/`

材料 PDF 等仍可放在本机 `Desktop/kaoyan/ExamFor2027/`；本站只存笔记与链接，不强制搬 PDF。

## 部署预留

`astro.config.mjs` 已设 `site`。若 GitHub Pages 挂在项目页，再补 `base: '/仓库名'`。

## 与本仓库的关系

- **备考主线：** 上一级 `ExamFor2027/`（草稿/PDF）+ 本站 `site/`
- **暂不关心：** `../else/`（实习、毕设、刷题等旧目录）
