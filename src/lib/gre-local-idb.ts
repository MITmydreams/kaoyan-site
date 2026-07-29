/**
 * 只读本机 IndexedDB（旧版 kaoyan-gre），供「导入到云端」用。
 * 新读写已全部走 Supabase。
 */

const GRE_DB_NAME = 'kaoyan-gre';
const GRE_DB_VERSION = 2;

export type LocalGreBundle = {
	words: unknown[];
	passages: unknown[];
	quant: unknown[];
	writing: unknown[];
};

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

function storeGetAll<T>(storeName: string): Promise<T[]> {
	return openDb().then(
		(db) =>
			new Promise((resolve, reject) => {
				if (!db.objectStoreNames.contains(storeName)) {
					resolve([]);
					return;
				}
				const tx = db.transaction(storeName, 'readonly');
				const req = tx.objectStore(storeName).getAll();
				req.onsuccess = () => resolve(req.result as T[]);
				req.onerror = () => reject(req.error);
			}),
	);
}

/** 导出本机旧库内容；若从未用过本地库则为空数组。 */
export async function exportLocalGreBundle(): Promise<LocalGreBundle> {
	const [words, passages, quant, writing] = await Promise.all([
		storeGetAll('words'),
		storeGetAll('passages'),
		storeGetAll('quant'),
		storeGetAll('writing'),
	]);
	return { words, passages, quant, writing };
}

export function localBundleCount(bundle: LocalGreBundle): number {
	return bundle.words.length + bundle.passages.length + bundle.quant.length + bundle.writing.length;
}
