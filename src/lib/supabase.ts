import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
	if (client) return client;
	const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
	const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
	if (!url || !key) {
		throw new Error(
			'未配置 Supabase：请在 site/.env 设置 PUBLIC_SUPABASE_URL 与 PUBLIC_SUPABASE_ANON_KEY（见 README）',
		);
	}
	client = createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	return client;
}

export function isSupabaseConfigured(): boolean {
	return Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
}
