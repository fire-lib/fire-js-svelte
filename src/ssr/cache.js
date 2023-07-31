export default class SsrCache {
	constructor() {
		this.store = {};

		if (typeof window !== 'undefined' && 'SSR_STORE' in window)
			this.store = window.SSR_STORE;
	}

	/// check if the value is in the cache else calls the fn
	async load(key, fn) {
		if (key in this.store)
			return this.store[key];
		const v = await fn();
		this.set(key, v);
		return v;
	}

	/// returns null if the data does not exists
	get(key) {
		return this.store[key] ?? null;
	}

	set(key, val) {
		this.store[key] = val;
	}

	clear() {
		this.store = {};
	}

	jsonStringify() {
		return JSON.stringify(this.store).replaceAll('<', '\\u003c');
	}

	toHead() {
		return `\n\t\t<script>window.SSR_STORE = ${
			this.jsonStringify()
		};</script>`;
	}
}