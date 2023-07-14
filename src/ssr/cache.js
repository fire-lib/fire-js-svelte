let store = {};

/// check if the value is in the cache else calls the fn
export async function load(key, fn) {
	if (key in store)
		return store[key];
	const v = await fn();
	set(key, v);
	return v;
}

/// returns null if the data does not exists
export function get(key) {
	return store[key] ?? null;
}

export function set(key, val) {
	store[key] = val;
}

export function clear() {
	store = {};
}

//-- internal

/// loads the store from ssr
export function loadCache() {
	if (window.SSR_STORE)
		store = window.SSR_STORE;

	console.log('store', store);
}

export function allAsJSON() {
	return JSON.stringify(store).replaceAll('<', '\\u003c');
}

export function toHead() {
	return `\n\t\t<script>window.SSR_STORE = ${ allAsJSON() };</script>`;
}