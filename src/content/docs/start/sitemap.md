---
title: 站点地图 / 怎么用本站
description: 半年后回来从这里找路。
---

## 本站五块

| 模块 | 干什么 | 入口 |
|------|--------|------|
| **计划书** | 目标、里程碑、本周、打卡 | [总览](/plan/overview/) |
| **知识点** | 一章一页解读 | [导读](/knowledge/overview/) |
| **错题本** | 错因 + 正确思路 + 链回知识点 | [导读](/wrongs/overview/) |
| **经验库** | 方法 / 心态 / 模考 / 踩坑 | [导读](/lessons/overview/) |
| **教辅架** | 书怎么用、映射到哪几章 | [总览](/shelf/overview/) |
| **GRE** | Verbal 词库/题目 · Quant · Writing | [导读](/gre/overview/) |

## 建议工作流

1. 周一：复制 [周计划模板](/plan/week/template/) → 填 [本周计划](/plan/week/current/)
2. 学新内容：在对应科目 `chapters/` 新建或填空
3. 做错题：在 `wrongs/<科目>/` 新建一页，链回知识点
4. 有心得：丢进经验库对应分类
5. 换教辅：先改 [教辅总览表](/shelf/overview/)，再开一书一页

## 本地预览

```bash
cd site
npm run dev
```

详见根目录 `README.md`。写法约定见 [怎么记一笔](/start/how-to-write/)。
