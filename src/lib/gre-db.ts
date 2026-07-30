/**
 * GRE 云端库（Supabase）。读公开；写需会话口令（sessionStorage）。
 * 组件继续调用本文件导出的 API。
 */

import { getSupabase, isSupabaseConfigured } from './supabase';
import { withBase } from './with-base';

export const LDOCE_BASE = 'https://www.ldoceonline.com/dictionary/';
export const WRITE_PASSWORD_KEY = 'kaoyan-gre-write-password';

export type GreSense = {
	gloss: string;
	example: string;
};

export type GreWord = {
	id: string;
	word: string;
	/** 兼容展示：首条释义 */
	gloss: string;
	senses: GreSense[];
	note?: string;
	createdAt: string;
	updatedAt: string;
	dayKey: string;
};

export type GrePassage = {
	id: string;
	title: string;
	body: string;
	kind: 'question' | 'sentence' | 'passage';
	createdAt: string;
	updatedAt?: string;
};

export type GreQuantItem = {
	id: string;
	kind: 'wrong' | 'note';
	topic: string;
	title: string;
	body: string;
	createdAt: string;
	updatedAt?: string;
};

export type GreWritingItem = {
	id: string;
	kind: 'template' | 'essay';
	title: string;
	body: string;
	createdAt: string;
	updatedAt?: string;
};

function uid(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function dayKeyFrom(iso: string): string {
	return iso.slice(0, 10);
}

export function normalizeWord(raw: string): string {
	return raw.trim().toLowerCase().replace(/[’‘']/g, "'");
}

export function ldoceUrl(word?: string): string {
	const w = (word || '').trim();
	if (!w) return LDOCE_BASE;
	return `${LDOCE_BASE}${encodeURIComponent(normalizeWord(w))}/`;
}

function iso(value: string | null | undefined): string {
	if (!value) return new Date().toISOString();
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? String(value) : d.toISOString();
}

function parseSenses(row: Record<string, unknown>): GreSense[] {
	const raw = row.senses;
	if (Array.isArray(raw) && raw.length) {
		return raw
			.map((item) => {
				const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
				return {
					gloss: String(o.gloss || '').trim(),
					example: String(o.example || '').trim(),
				};
			})
			.filter((s) => s.gloss);
	}
	const gloss = String(row.gloss || '').trim();
	if (gloss) return [{ gloss, example: String(row.example || '').trim() }];
	return [];
}

/** 写入前校验：至少一组，且每组释义+例句都非空 */
export function normalizeSenses(input: GreSense[]): GreSense[] {
	const senses = (input || [])
		.map((s) => ({
			gloss: String(s?.gloss || '').trim(),
			example: String(s?.example || '').trim(),
		}))
		.filter((s) => s.gloss || s.example);
	if (!senses.length) throw new Error('至少需要一组释义 + 例句');
	for (const s of senses) {
		if (!s.gloss) throw new Error('释义不能为空');
		if (!s.example) throw new Error('每条释义都必须配例句');
	}
	return senses;
}

function mapWord(row: Record<string, unknown>): GreWord {
	const senses = parseSenses(row);
	return {
		id: String(row.id),
		word: String(row.word),
		gloss: senses[0]?.gloss || String(row.gloss || ''),
		senses,
		note: row.note ? String(row.note) : undefined,
		createdAt: iso(row.created_at as string),
		updatedAt: iso(row.updated_at as string),
		dayKey: String(row.day_key || dayKeyFrom(iso(row.created_at as string))),
	};
}

function mapPassage(row: Record<string, unknown>): GrePassage {
	return {
		id: String(row.id),
		title: String(row.title),
		body: String(row.body),
		kind: row.kind as GrePassage['kind'],
		createdAt: iso(row.created_at as string),
		updatedAt: row.updated_at ? iso(row.updated_at as string) : undefined,
	};
}

function mapQuant(row: Record<string, unknown>): GreQuantItem {
	return {
		id: String(row.id),
		kind: row.kind as GreQuantItem['kind'],
		topic: String(row.topic || '未分类'),
		title: String(row.title),
		body: String(row.body),
		createdAt: iso(row.created_at as string),
		updatedAt: row.updated_at ? iso(row.updated_at as string) : undefined,
	};
}

function mapWriting(row: Record<string, unknown>): GreWritingItem {
	return {
		id: String(row.id),
		kind: row.kind as GreWritingItem['kind'],
		title: String(row.title),
		body: String(row.body),
		createdAt: iso(row.created_at as string),
		updatedAt: row.updated_at ? iso(row.updated_at as string) : undefined,
	};
}

function mapRpcRow<T>(data: unknown, fallback: T): T {
	if (!data || typeof data !== 'object') return fallback;
	const o = data as Record<string, unknown>;
	// RPC returns camelCase JSON already
	if ('createdAt' in o || 'dayKey' in o || 'kind' in o) {
		return {
			...o,
			createdAt: iso(String(o.createdAt)),
			updatedAt: o.updatedAt ? iso(String(o.updatedAt)) : undefined,
			note: o.note ? String(o.note) : undefined,
		} as T;
	}
	return fallback;
}

export function isWriteUnlocked(): boolean {
	if (typeof sessionStorage === 'undefined') return false;
	return Boolean(sessionStorage.getItem(WRITE_PASSWORD_KEY));
}

export function getWritePassword(): string {
	if (typeof sessionStorage === 'undefined') return '';
	return sessionStorage.getItem(WRITE_PASSWORD_KEY) || '';
}

export function unlockWrite(password: string): void {
	sessionStorage.setItem(WRITE_PASSWORD_KEY, password);
}

export function lockWrite(): void {
	sessionStorage.removeItem(WRITE_PASSWORD_KEY);
}

export const WRITE_UNLOCK_REDIRECT_MSG = '请先在「GRE · 模块导读」解锁编辑';

function greOverviewUnlockUrl(): string {
	return withBase('gre/overview/?needUnlock=1');
}

function requirePassword(): string {
	const pw = getWritePassword();
	if (!pw) {
		if (typeof location !== 'undefined') {
			const onOverview = /\/gre\/overview\/?$/.test(location.pathname.replace(/\/+$/, '/') || '')
				|| location.pathname.includes('/gre/overview');
			if (!onOverview) {
				location.assign(greOverviewUnlockUrl());
			}
		}
		throw new Error(WRITE_UNLOCK_REDIRECT_MSG);
	}
	return pw;
}

function translateRpcError(err: { message?: string; details?: string; hint?: string }): Error {
	const raw = `${err.message || ''} ${err.details || ''} ${err.hint || ''}`;
	if (raw.includes('WRITE_LOCKED')) {
		if (typeof location !== 'undefined' && !location.pathname.includes('/gre/overview')) {
			location.assign(greOverviewUnlockUrl());
		}
		return new Error(WRITE_UNLOCK_REDIRECT_MSG);
	}
	if (raw.includes('PASSWORD_NOT_SET')) return new Error('云端口令尚未设置：请在解锁条首次设口令，或在 SQL 中执行 gre_set_password');
	if (raw.includes('BAD_PASSWORD')) return new Error('口令错误');
	if (raw.includes('口令至少')) return new Error('口令至少 4 个字符');
	if (raw.includes('每条释义')) return new Error(err.message || '每条释义都必须配例句');
	if (raw.includes('至少需要一组')) return new Error('至少需要一组释义 + 例句');
	return new Error(err.message || '云端写入失败');
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
	const { data, error } = await getSupabase().rpc(fn, args);
	if (error) throw translateRpcError(error);
	return data as T;
}

export async function hasCloudPassword(): Promise<boolean> {
	if (!isSupabaseConfigured()) return false;
	const { data, error } = await getSupabase().rpc('gre_has_password');
	if (error) throw translateRpcError(error);
	return Boolean(data);
}

/** 首次设口令（云端尚无口令）或改口令（需已解锁且传旧口令）。 */
export async function setCloudPassword(newPassword: string, oldPassword?: string | null): Promise<void> {
	const { error } = await getSupabase().rpc('gre_set_password', {
		p_new: newPassword,
		p_old: oldPassword ?? null,
	});
	if (error) throw translateRpcError(error);
	unlockWrite(newPassword);
}

export async function listWords(): Promise<GreWord[]> {
	const { data, error } = await getSupabase().from('gre_words').select('*');
	if (error) throw new Error(error.message);
	return (data || []).map((r) => mapWord(r as Record<string, unknown>)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getWordByLemma(raw: string): Promise<GreWord | null> {
	const word = normalizeWord(raw);
	if (!word) return null;
	const { data, error } = await getSupabase().from('gre_words').select('*').eq('word', word).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? mapWord(data as Record<string, unknown>) : null;
}

export async function getWordById(id: string): Promise<GreWord | null> {
	const { data, error } = await getSupabase().from('gre_words').select('*').eq('id', id).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? mapWord(data as Record<string, unknown>) : null;
}

export async function upsertWord(input: {
	word: string;
	senses?: GreSense[];
	/** 单条快捷写法 */
	gloss?: string;
	example?: string;
	note?: string;
}): Promise<GreWord> {
	const word = normalizeWord(input.word);
	if (!word) throw new Error('单词不能为空');
	const senses = normalizeSenses(
		input.senses?.length
			? input.senses
			: [{ gloss: input.gloss || '', example: input.example || '' }],
	);

	const existing = await getWordByLemma(word);
	const now = new Date().toISOString();
	const row: GreWord = existing
		? {
				...existing,
				gloss: senses[0].gloss,
				senses,
				note: input.note?.trim() || existing.note,
				updatedAt: now,
			}
		: {
				id: uid(),
				word,
				gloss: senses[0].gloss,
				senses,
				note: input.note?.trim() || undefined,
				createdAt: now,
				updatedAt: now,
				dayKey: dayKeyFrom(now),
			};

	const data = await rpc<Record<string, unknown>>('gre_put_word', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapWord({
		...data,
		created_at: (data.createdAt as string) || row.createdAt,
		updated_at: (data.updatedAt as string) || row.updatedAt,
		day_key: (data.dayKey as string) || row.dayKey,
	});
}

export async function updateWordById(
	id: string,
	input: {
		word: string;
		senses?: GreSense[];
		gloss?: string;
		example?: string;
		note?: string;
	},
): Promise<GreWord> {
	const existing = await getWordById(id);
	if (!existing) throw new Error('词条不存在');
	const word = normalizeWord(input.word);
	if (!word) throw new Error('单词不能为空');
	const senses = normalizeSenses(
		input.senses?.length
			? input.senses
			: [{ gloss: input.gloss || '', example: input.example || '' }],
	);
	const clash = await getWordByLemma(word);
	if (clash && clash.id !== id) throw new Error(`「${word}」已存在于词库`);
	const now = new Date().toISOString();
	const row: GreWord = {
		...existing,
		word,
		gloss: senses[0].gloss,
		senses,
		note: input.note?.trim() || undefined,
		updatedAt: now,
	};
	const data = await rpc<Record<string, unknown>>('gre_put_word', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapWord({
		...data,
		created_at: (data.createdAt as string) || row.createdAt,
		updated_at: (data.updatedAt as string) || row.updatedAt,
		day_key: (data.dayKey as string) || row.dayKey,
	});
}

export async function deleteWord(id: string): Promise<void> {
	await rpc('gre_delete_word', { p_password: requirePassword(), p_id: id });
}

export async function listPassages(): Promise<GrePassage[]> {
	const { data, error } = await getSupabase().from('gre_passages').select('*');
	if (error) throw new Error(error.message);
	return (data || [])
		.map((r) => mapPassage(r as Record<string, unknown>))
		.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function getPassageById(id: string): Promise<GrePassage | null> {
	const { data, error } = await getSupabase().from('gre_passages').select('*').eq('id', id).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? mapPassage(data as Record<string, unknown>) : null;
}

export async function addPassage(input: {
	title: string;
	body: string;
	kind: GrePassage['kind'];
}): Promise<GrePassage> {
	const title = input.title.trim() || '未命名';
	const body = input.body.trim();
	if (!body) throw new Error('正文不能为空');
	const now = new Date().toISOString();
	const row: GrePassage = {
		id: uid(),
		title,
		body,
		kind: input.kind,
		createdAt: now,
		updatedAt: now,
	};
	const data = await rpc<Record<string, unknown>>('gre_put_passage', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapRpcRow(data, row);
}

export async function updatePassage(
	id: string,
	input: { title: string; body: string; kind: GrePassage['kind'] },
): Promise<GrePassage> {
	const existing = await getPassageById(id);
	if (!existing) throw new Error('条目不存在');
	const title = input.title.trim() || '未命名';
	const body = input.body.trim();
	if (!body) throw new Error('正文不能为空');
	const row: GrePassage = {
		...existing,
		title,
		body,
		kind: input.kind,
		updatedAt: new Date().toISOString(),
	};
	const data = await rpc<Record<string, unknown>>('gre_put_passage', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapRpcRow(data, row);
}

export async function deletePassage(id: string): Promise<void> {
	await rpc('gre_delete_passage', { p_password: requirePassword(), p_id: id });
}

export async function listQuant(kind?: GreQuantItem['kind']): Promise<GreQuantItem[]> {
	let q = getSupabase().from('gre_quant').select('*');
	if (kind) q = q.eq('kind', kind);
	const { data, error } = await q;
	if (error) throw new Error(error.message);
	return (data || [])
		.map((r) => mapQuant(r as Record<string, unknown>))
		.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function getQuantById(id: string): Promise<GreQuantItem | null> {
	const { data, error } = await getSupabase().from('gre_quant').select('*').eq('id', id).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? mapQuant(data as Record<string, unknown>) : null;
}

export async function addQuant(input: {
	kind: GreQuantItem['kind'];
	topic?: string;
	title: string;
	body: string;
}): Promise<GreQuantItem> {
	const title = input.title.trim();
	const body = input.body.trim();
	const topic = (input.topic || '').trim() || '未分类';
	if (!title) throw new Error('标题不能为空');
	if (!body) throw new Error('内容不能为空');
	const now = new Date().toISOString();
	const row: GreQuantItem = {
		id: uid(),
		kind: input.kind,
		topic,
		title,
		body,
		createdAt: now,
		updatedAt: now,
	};
	const data = await rpc<Record<string, unknown>>('gre_put_quant', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapRpcRow(data, row);
}

export async function updateQuant(
	id: string,
	input: { topic?: string; title: string; body: string },
): Promise<GreQuantItem> {
	const existing = await getQuantById(id);
	if (!existing) throw new Error('条目不存在');
	const title = input.title.trim();
	const body = input.body.trim();
	const topic = (input.topic ?? existing.topic ?? '').trim() || '未分类';
	if (!title) throw new Error('标题不能为空');
	if (!body) throw new Error('内容不能为空');
	const row: GreQuantItem = {
		...existing,
		topic,
		title,
		body,
		updatedAt: new Date().toISOString(),
	};
	const data = await rpc<Record<string, unknown>>('gre_put_quant', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapRpcRow(data, row);
}

export async function deleteQuant(id: string): Promise<void> {
	await rpc('gre_delete_quant', { p_password: requirePassword(), p_id: id });
}

export function groupQuantByTopic(
	items: GreQuantItem[],
): Array<{ topic: string; items: GreQuantItem[] }> {
	const map = new Map<string, GreQuantItem[]>();
	for (const item of items) {
		const topic = item.topic?.trim() || '未分类';
		const list = map.get(topic) || [];
		list.push(item);
		map.set(topic, list);
	}
	return [...map.entries()]
		.sort((a, b) => a[0].localeCompare(b[0], 'zh'))
		.map(([topic, list]) => ({
			topic,
			items: list.sort((a, b) =>
				(b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt),
			),
		}));
}

export async function listWriting(kind: GreWritingItem['kind']): Promise<GreWritingItem[]> {
	const { data, error } = await getSupabase().from('gre_writing').select('*').eq('kind', kind);
	if (error) throw new Error(error.message);
	return (data || [])
		.map((r) => mapWriting(r as Record<string, unknown>))
		.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function getWritingById(id: string): Promise<GreWritingItem | null> {
	const { data, error } = await getSupabase().from('gre_writing').select('*').eq('id', id).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? mapWriting(data as Record<string, unknown>) : null;
}

export async function addWriting(input: {
	kind: GreWritingItem['kind'];
	title: string;
	body: string;
}): Promise<GreWritingItem> {
	const title = input.title.trim();
	const body = input.body.trim();
	if (!title) throw new Error('标题不能为空');
	if (!body) throw new Error('内容不能为空');
	const now = new Date().toISOString();
	const row: GreWritingItem = {
		id: uid(),
		kind: input.kind,
		title,
		body,
		createdAt: now,
		updatedAt: now,
	};
	const data = await rpc<Record<string, unknown>>('gre_put_writing', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapRpcRow(data, row);
}

export async function updateWriting(
	id: string,
	input: { title: string; body: string },
): Promise<GreWritingItem> {
	const existing = await getWritingById(id);
	if (!existing) throw new Error('条目不存在');
	const title = input.title.trim();
	const body = input.body.trim();
	if (!title) throw new Error('标题不能为空');
	if (!body) throw new Error('内容不能为空');
	const row: GreWritingItem = {
		...existing,
		title,
		body,
		updatedAt: new Date().toISOString(),
	};
	const data = await rpc<Record<string, unknown>>('gre_put_writing', {
		p_password: requirePassword(),
		p_row: row,
	});
	return mapRpcRow(data, row);
}

export async function deleteWriting(id: string): Promise<void> {
	await rpc('gre_delete_writing', { p_password: requirePassword(), p_id: id });
}

export async function exportGreJson(): Promise<string> {
	const [words, passages, quant, writingWrongKind] = await Promise.all([
		listWords(),
		listPassages(),
		listQuant(),
		getSupabase().from('gre_writing').select('*'),
	]);
	if (writingWrongKind.error) throw new Error(writingWrongKind.error.message);
	const writing = (writingWrongKind.data || []).map((r) => mapWriting(r as Record<string, unknown>));
	return JSON.stringify(
		{ version: 1, exportedAt: new Date().toISOString(), words, passages, quant, writing },
		null,
		2,
	);
}

/** 把本机/导出的 bundle 写入云端（需已解锁）。 */
export async function importGreBundle(bundle: {
	words?: unknown[];
	passages?: unknown[];
	quant?: unknown[];
	writing?: unknown[];
}): Promise<{ words: number; passages: number; quant: number; writing: number }> {
	const data = await rpc<{
		words: number;
		passages: number;
		quant: number;
		writing: number;
	}>('gre_import_bundle', {
		p_password: requirePassword(),
		p_bundle: {
			words: bundle.words || [],
			passages: bundle.passages || [],
			quant: bundle.quant || [],
			writing: bundle.writing || [],
		},
	});
	return data;
}

/** 把正文拆成可点击词块（保留空白与标点） */
export function tokenizeForGloss(text: string): Array<{ type: 'word' | 'other'; value: string }> {
	const parts = text.split(/([A-Za-z][A-Za-z'-]*[A-Za-z]|[A-Za-z])/g);
	return parts
		.filter((p) => p.length > 0)
		.map((value) =>
			/^[A-Za-z][A-Za-z'-]*[A-Za-z]$|^[A-Za-z]$/.test(value)
				? { type: 'word' as const, value }
				: { type: 'other' as const, value },
		);
}

export function groupWordsByDay(words: GreWord[]): Array<{ day: string; items: GreWord[] }> {
	const map = new Map<string, GreWord[]>();
	for (const w of words) {
		const list = map.get(w.dayKey) || [];
		list.push(w);
		map.set(w.dayKey, list);
	}
	return [...map.entries()]
		.sort((a, b) => b[0].localeCompare(a[0]))
		.map(([day, items]) => ({
			day,
			items: items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
		}));
}

export { isSupabaseConfigured };
