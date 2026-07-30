# 考研备考小家（Starlight）

**栈：** Astro Starlight  
**定位：** 计划书 + 知识点 + 错题本 + 经验库 + 教辅架。Markdown 是真相源。  
**线上：** https://mitmydreams.github.io/kaoyan-site/

## 本地预览

```bash
cd site
npm install
cp .env.example .env   # 填入 Supabase URL / anon key（GRE 云端需要）
npm run dev
```

浏览器打开 `http://localhost:4321/kaoyan-site/`（`base` 已设为 `/kaoyan-site`）。

构建检查：`npm run build`。

## GRE 云端（Supabase）

交互数据（词库 / 题目 / Quant / Writing）存在 **Supabase**，全站访客共享同一份；**写操作需口令**。

### 一次配置

1. 在 [supabase.com](https://supabase.com) 新建项目。
2. Dashboard → **SQL Editor** → 粘贴并运行 [`supabase/schema.sql`](supabase/schema.sql)。  
   已有项目若还没有词库 `senses` 列：再跑 [`supabase/migrate-senses.sql`](supabase/migrate-senses.sql)（启用「释义 + 例句」）。
3. （可选）在 SQL 里设口令，或打开站点 GRE 页用「首次设口令」：
   ```sql
   select gre_set_password('你的口令', null);
   ```
4. **Project Settings → API** 复制：
   - Project URL → `PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `PUBLIC_SUPABASE_ANON_KEY`
5. 本地写入 `site/.env`（已 gitignore）。
6. GitHub 仓库 **Settings → Secrets and variables → Actions** 添加同名两个 Secrets，然后 push / 手动跑 Deploy workflow。

anon key 可以公开（打进静态前端）；**写口令不要进 git**。

### 使用

- 各 GRE 页顶部有解锁条：谁都能看；改数据先解锁。
- 若你以前用过本机 IndexedDB：解锁后点「导入本机数据」。
- 「导出 JSON」仍可做备份；也可用「导入 JSON 文件」恢复。

## 离线 / 飞机上写

Markdown 笔记不依赖外网。GRE 云端读写需要网络；起飞前装好 `node_modules`：

```bash
cd site
test -d node_modules || npm install
npm run dev
```

端口钉死在 **4321**。

## 目录说明

| 路径 | 用途 |
|------|------|
| `src/content/docs/start/` | 站点地图、怎么记一笔 |
| `src/content/docs/plan/` | 总览、里程碑、本周、打卡 |
| `src/content/docs/knowledge/` | 科目知识点 |
| `src/content/docs/wrongs/` | 错题 |
| `src/content/docs/lessons/` | 方法 / 心态 / 模考 / 踩坑 |
| `src/content/docs/shelf/` | 教辅 |
| `src/content/docs/gre/` | GRE 页面 |
| `src/lib/gre-db.ts` | GRE ↔ Supabase API |
| `src/lib/gre-local-idb.ts` | 旧本机库只读导入 |
| `supabase/schema.sql` | 云端表 + 口令 RPC |
| `src/components/gre/` | GRE 交互组件 |

## 与本仓库的关系

- **备考主线：** 上一级 `ExamFor2027/` + 本站 `site/`
- **暂不关心：** `../else/`
