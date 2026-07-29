/**
 * Prefix absolute same-site markdown links with Astro `base`
 * so GitHub project Pages links don't jump to domain root.
 */
export function remarkPrefixBase(base = '/') {
	const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
	return () => (tree) => {
		if (!normalized) return;
		const visit = (node) => {
			if (!node || typeof node !== 'object') return;
			if (node.type === 'link' || node.type === 'definition') {
				const url = node.url;
				if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
					node.url = `${normalized}${url}`;
				}
			}
			if (Array.isArray(node.children)) {
				for (const child of node.children) visit(child);
			}
		};
		visit(tree);
	};
}
