/** 客户端 Markdown 渲染：GFM 文本 + KaTeX 公式；图片用标准 ![](url) */

import { marked } from 'marked';
import katex from 'katex';

marked.setOptions({
	gfm: true,
	breaks: true,
});

/** 把 Markdown（可含 $ 公式）渲成 HTML 字符串 */
export function renderGreMarkdown(src: string): string {
	const raw = src || '';
	const blocks: string[] = [];
	const inlines: string[] = [];
	let protectedSrc = raw.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
		const i = blocks.length;
		blocks.push(String(tex));
		return `%%GREMATHBLOCK${i}%%`;
	});
	protectedSrc = protectedSrc.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
		const i = inlines.length;
		inlines.push(String(tex));
		return `%%GREMATHINLINE${i}%%`;
	});

	let html = marked.parse(protectedSrc, { async: false }) as string;

	html = html.replace(/%%GREMATHBLOCK(\d+)%%/g, (_, n) => {
		const tex = blocks[Number(n)] || '';
		try {
			return katex.renderToString(tex.trim(), {
				displayMode: true,
				throwOnError: false,
				strict: 'ignore',
			});
		} catch {
			return `<pre>$$${tex}$$</pre>`;
		}
	});
	html = html.replace(/%%GREMATHINLINE(\d+)%%/g, (_, n) => {
		const tex = inlines[Number(n)] || '';
		try {
			return katex.renderToString(tex.trim(), {
				displayMode: false,
				throwOnError: false,
				strict: 'ignore',
			});
		} catch {
			return `<code>${tex}</code>`;
		}
	});

	return html;
}

/** 压缩图片后返回 data URL，便于塞进 Markdown */
export function fileToDataUrl(file: File, maxEdge = 1400, quality = 0.82): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error);
		reader.onload = () => {
			const img = new Image();
			img.onerror = () => reject(new Error('图片读取失败'));
			img.onload = () => {
				const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
				const w = Math.max(1, Math.round(img.width * scale));
				const h = Math.max(1, Math.round(img.height * scale));
				const canvas = document.createElement('canvas');
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					resolve(String(reader.result));
					return;
				}
				ctx.drawImage(img, 0, 0, w, h);
				const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
				resolve(canvas.toDataURL(type, quality));
			};
			img.src = String(reader.result);
		};
		reader.readAsDataURL(file);
	});
}

export function insertAtCursor(textarea: HTMLTextAreaElement, snippet: string): void {
	const start = textarea.selectionStart ?? textarea.value.length;
	const end = textarea.selectionEnd ?? start;
	const before = textarea.value.slice(0, start);
	const after = textarea.value.slice(end);
	textarea.value = `${before}${snippet}${after}`;
	const pos = start + snippet.length;
	textarea.focus();
	textarea.setSelectionRange(pos, pos);
	textarea.dispatchEvent(new Event('input', { bubbles: true }));
}
