/** GRE 本地库（IndexedDB）。今日本地预览；日后可换成远程 API，接口保持这套。 */

export const GRE_DB_NAME = 'kaoyan-gre';
export const GRE_DB_VERSION = 2;
export const LDOCE_BASE = 'https://www.ldoceonline.com/dictionary/';

export type GreWord = {
	id: string;
	word: string;
	gloss: string;
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
	/** 知识点分类，用于汇总页分框 */
	topic: string;
	title: string;
	/** Markdown：支持公式 $...$ / $$...$$，图片 ![alt](data:...) */
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
	return raw.trim().toLowerCase().replace(/[’‘]/g, "'");
}

export function ldoceUrl(word?: string): string {
	const w = (word || '').trim();
	if (!w) return LDOCE_BASE;
	return `${LDOCE_BASE}${encodeURIComponent(normalizeWord(w))}/`;
}

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(GRE_DB_NAME, GRE_DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains('words')) {
				const store = db.createObjectStore('words', { keyPath: 'id' });
				store.createIndex('byWord', 'word', { unique: true });
				store.createIndex('byDay', 'dayKey', { unique: false });
			}
			if (!db.objectStoreNames.contains('passages')) {
				db.createObjectStore('passages', { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains('quant')) {
				db.createObjectStore('quant', { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains('writing')) {
				db.createObjectStore('writing', { keyPath: 'id' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

function txDone(tx: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}

function storeGetAll<T>(storeName: string): Promise<T[]> {
	return openDb().then(
		(db) =>
			new Promise((resolve, reject) => {
				const tx = db.transaction(storeName, 'readonly');
				const req = tx.objectStore(storeName).getAll();
				req.onsuccess = () => resolve(req.result as T[]);
				req.onerror = () => reject(req.error);
			}),
	);
}

function storePut(storeName: string, value: unknown): Promise<void> {
	return openDb().then(async (db) => {
		const tx = db.transaction(storeName, 'readwrite');
		tx.objectStore(storeName).put(value);
		await txDone(tx);
	});
}

function storeDelete(storeName: string, id: string): Promise<void> {
	return openDb().then(async (db) => {
		const tx = db.transaction(storeName, 'readwrite');
		tx.objectStore(storeName).delete(id);
		await txDone(tx);
	});
}

function storeGet<T>(storeName: string, id: string): Promise<T | null> {
	return openDb().then(
		(db) =>
			new Promise((resolve, reject) => {
				const tx = db.transaction(storeName, 'readonly');
				const req = tx.objectStore(storeName).get(id);
				req.onsuccess = () => resolve((req.result as T) || null);
				req.onerror = () => reject(req.error);
			}),
	);
}

export async function listWords(): Promise<GreWord[]> {
	const rows = await storeGetAll<GreWord>('words');
	return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getWordByLemma(raw: string): Promise<GreWord | null> {
	const word = normalizeWord(raw);
	if (!word) return null;
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('words', 'readonly');
		const idx = tx.objectStore('words').index('byWord');
		const req = idx.get(word);
		req.onsuccess = () => resolve((req.result as GreWord) || null);
		req.onerror = () => reject(req.error);
	});
}

export async function upsertWord(input: {
	word: string;
	gloss: string;
	note?: string;
}): Promise<GreWord> {
	const word = normalizeWord(input.word);
	const gloss = input.gloss.trim();
	if (!word) throw new Error('单词不能为空');
	if (!gloss) throw new Error('释义不能为空');

	const existing = await getWordByLemma(word);
	const now = new Date().toISOString();
	const row: GreWord = existing
		? {
				...existing,
				gloss,
				note: input.note?.trim() || existing.note,
				updatedAt: now,
			}
		: {
				id: uid(),
				word,
				gloss,
				note: input.note?.trim() || undefined,
				createdAt: now,
				updatedAt: now,
				dayKey: dayKeyFrom(now),
			};
	await storePut('words', row);
	return row;
}

export async function deleteWord(id: string): Promise<void> {
	await storeDelete('words', id);
}

export async function getWordById(id: string): Promise<GreWord | null> {
	return storeGet<GreWord>('words', id);
}

/** 按 id 更新；若改 lemma 与其它词冲突则报错 */
export async function updateWordById(
	id: string,
	input: { word: string; gloss: string; note?: string },
): Promise<GreWord> {
	const existing = await getWordById(id);
	if (!existing) throw new Error('词条不存在');
	const word = normalizeWord(input.word);
	const gloss = input.gloss.trim();
	if (!word) throw new Error('单词不能为空');
	if (!gloss) throw new Error('释义不能为空');
	const clash = await getWordByLemma(word);
	if (clash && clash.id !== id) throw new Error(`「${word}」已存在于词库`);
	const now = new Date().toISOString();
	const row: GreWord = {
		...existing,
		word,
		gloss,
		note: input.note?.trim() || undefined,
		updatedAt: now,
	};
	await storePut('words', row);
	return row;
}

export async function listPassages(): Promise<GrePassage[]> {
	const rows = await storeGetAll<GrePassage>('passages');
	return rows.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function getPassageById(id: string): Promise<GrePassage | null> {
	return storeGet<GrePassage>('passages', id);
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
	await storePut('passages', row);
	return row;
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
	await storePut('passages', row);
	return row;
}

export async function deletePassage(id: string): Promise<void> {
	await storeDelete('passages', id);
}

export async function listQuant(kind?: GreQuantItem['kind']): Promise<GreQuantItem[]> {
	const rows = await storeGetAll<GreQuantItem>('quant');
	const filtered = kind ? rows.filter((r) => r.kind === kind) : rows;
	return filtered.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function getQuantById(id: string): Promise<GreQuantItem | null> {
	return storeGet<GreQuantItem>('quant', id);
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
	await storePut('quant', row);
	return row;
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
	await storePut('quant', row);
	return row;
}

export async function deleteQuant(id: string): Promise<void> {
	await storeDelete('quant', id);
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
	const rows = await storeGetAll<GreWritingItem>('writing');
	return rows
		.filter((r) => r.kind === kind)
		.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function getWritingById(id: string): Promise<GreWritingItem | null> {
	return storeGet<GreWritingItem>('writing', id);
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
	await storePut('writing', row);
	return row;
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
	await storePut('writing', row);
	return row;
}

export async function deleteWriting(id: string): Promise<void> {
	await storeDelete('writing', id);
}

export async function exportGreJson(): Promise<string> {
	const [words, passages, quant, writing] = await Promise.all([
		listWords(),
		listPassages(),
		listQuant(),
		storeGetAll<GreWritingItem>('writing'),
	]);
	return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), words, passages, quant, writing }, null, 2);
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
