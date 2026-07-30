/** Join Astro `base` with a site path (handles missing slash). */
export function withBase(path = '') {
	const raw = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
	const base = raw.endsWith('/') ? raw : `${raw}/`;
	const p = String(path).replace(/^\//, '');
	return `${base}${p}`;
}
