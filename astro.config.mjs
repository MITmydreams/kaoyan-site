// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkPrefixBase } from './src/lib/remark-prefix-base.mjs';

const BASE = '/kaoyan-site';

// https://astro.build/config
export default defineConfig({
	site: 'https://mitmydreams.github.io',
	base: BASE,
	server: {
		port: 4321,
		strictPort: true,
	},
	markdown: {
		remarkPlugins: [remarkMath, remarkPrefixBase(BASE)],
		rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: 'ignore' }]],
	},
	vite: {
		optimizeDeps: {
			include: ['marked', 'katex'],
		},
		ssr: {
			noExternal: ['katex'],
		},
	},
	integrations: [
		starlight({
			title: '考研备考小家',
			description: '计划书 · 知识点 · 错题本 · 经验库 · 教辅架',
			defaultLocale: 'root',
			customCss: [
				'katex/dist/katex.min.css',
				'./src/styles/theme.css',
				'./src/styles/gre.css',
			],
			components: {
				ThemeProvider: './src/components/ThemeProvider.astro',
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/MITmydreams/kaoyan-site',
				},
			],
			sidebar: [
				{
					label: '开始',
					items: [
						{ label: '首页', slug: '' },
						{ label: '站点地图 / 怎么用', slug: 'start/sitemap' },
						{ label: '怎么记一笔', slug: 'start/how-to-write' },
					],
				},
				{
					label: '计划书 Plan',
					collapsed: false,
					items: [
						{ label: '总览', slug: 'plan/overview' },
						{ label: '里程碑', slug: 'plan/milestones' },
						{ label: '本周计划', slug: 'plan/week/current' },
						{ label: '周计划模板', slug: 'plan/week/template' },
						{
							label: '每日打卡',
							collapsed: true,
							items: [
								{
									autogenerate: { directory: 'plan/log' },
								},
							],
						},
					],
				},
				{
					label: '知识点 Knowledge',
					collapsed: false,
					items: [
						{ label: '模块导读', slug: 'knowledge/overview' },
						{
							label: '政治（占位）',
							collapsed: true,
							items: [
								{ label: '科目地图', slug: 'knowledge/politics/overview' },
								{
									label: '章节',
									items: [
										{
											autogenerate: {
												directory: 'knowledge/politics/chapters',
											},
										},
									],
								},
							],
						},
						{
							label: '英语（占位）',
							collapsed: true,
							items: [
								{ label: '科目地图', slug: 'knowledge/english/overview' },
								{
									label: '章节',
									items: [
										{
											autogenerate: {
												directory: 'knowledge/english/chapters',
											},
										},
									],
								},
							],
						},
						{
							label: '数学（占位）',
							collapsed: true,
							items: [
								{ label: '科目地图', slug: 'knowledge/math/overview' },
								{
									label: '章节',
									items: [
										{
											autogenerate: {
												directory: 'knowledge/math/chapters',
											},
										},
									],
								},
							],
						},
						{
							label: '专业课（占位）',
							collapsed: true,
							items: [
								{ label: '科目地图', slug: 'knowledge/major/overview' },
								{
									label: '章节',
									items: [
										{
											autogenerate: {
												directory: 'knowledge/major/chapters',
											},
										},
									],
								},
							],
						},
					],
				},
				{
					label: '错题本 Wrongs',
					collapsed: true,
					items: [
						{ label: '导读', slug: 'wrongs/overview' },
						{ label: '错因标签说明', slug: 'wrongs/tags' },
						{
							label: '政治',
							collapsed: true,
							items: [
								{ autogenerate: { directory: 'wrongs/politics' } },
							],
						},
						{
							label: '英语',
							collapsed: true,
							items: [
								{ autogenerate: { directory: 'wrongs/english' } },
							],
						},
						{
							label: '数学',
							collapsed: true,
							items: [{ autogenerate: { directory: 'wrongs/math' } }],
						},
						{
							label: '专业课',
							collapsed: true,
							items: [{ autogenerate: { directory: 'wrongs/major' } }],
						},
					],
				},
				{
					label: '经验库 Lessons',
					collapsed: true,
					items: [
						{ label: '导读', slug: 'lessons/overview' },
						{
							label: '复习方法',
							collapsed: true,
							items: [
								{ autogenerate: { directory: 'lessons/methods' } },
							],
						},
						{
							label: '心态与作息',
							collapsed: true,
							items: [
								{ autogenerate: { directory: 'lessons/mindset' } },
							],
						},
						{
							label: '模考复盘',
							collapsed: true,
							items: [
								{ autogenerate: { directory: 'lessons/mock-exam' } },
							],
						},
						{
							label: '资源踩坑',
							collapsed: true,
							items: [
								{ autogenerate: { directory: 'lessons/resources' } },
							],
						},
					],
				},
				{
					label: '教辅架 Shelf',
					collapsed: true,
					items: [
						{ label: '总览表', slug: 'shelf/overview' },
						{
							label: '一书一页',
							items: [{ autogenerate: { directory: 'shelf/books' } }],
						},
					],
				},
				{
					label: 'GRE',
					collapsed: false,
					items: [
						{ label: '模块导读', slug: 'gre/overview' },
						{
							label: 'Verbal',
							collapsed: false,
							items: [
								{ label: '添加词汇', slug: 'gre/verbal/vocab' },
								{ label: '词汇总览', slug: 'gre/verbal/vocab-overview' },
								{ label: '题目 / 难句', slug: 'gre/verbal/questions' },
							],
						},
						{
							label: 'Quantitative',
							collapsed: true,
							items: [
								{ label: '导读', slug: 'gre/quant/overview' },
								{ label: '错题', slug: 'gre/quant/wrongs' },
								{ label: '知识点', slug: 'gre/quant/notes' },
							],
						},
						{
							label: 'Writing',
							collapsed: true,
							items: [
								{ label: '模板积累', slug: 'gre/writing/templates' },
								{ label: '完整范文', slug: 'gre/writing/essays' },
							],
						},
					],
				},
			],
		}),
	],
});
