export default class SsrCache {
	constructor();

	/**
	 * check if the value is in the cache else calls the fn
	 */
	load<K, T>(key: K, fn: () => Promise<T>): Promise<T>;

	/**
	 * Returns the value from the cache
	 */
	get<K, T>(key: K): T | null;

	/**
	 * Sets the value in the cache
	 */
	set<K, T>(key: K, value: T): void;

	/**
	 * Clears the cache
	 */
	clear(): void;

	/**
	 * Returns the cache as json
	 */
	jsonStringify(): string;

	/**
	 * Returns the cache in a script tag
	 */
	toHead(): string;
}
