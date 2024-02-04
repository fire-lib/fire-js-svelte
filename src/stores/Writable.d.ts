export default class Writable<T> {
	/**
	 * Creates a new instance of Writable.
	 *
	 * @param value The initial value to be stored.
	 */
	constructor(value?: T);

	/**
	 * Subscribes a listener to changes in the stored value.
	 *
	 * @param listener The function to be added as a listener. It should accept the stored value as its only argument.
	 * @returns A function that, when called, will remove the added listener from the set.
	 */
	subscribe(listener: (value: T) => void): () => void;

	/**
	 * Returns the stored value.
	 */
	get(): T;

	/**
	 * Sets the stored value to the given value and notifies all subscribed listeners.
	 */
	set(value: T): void;

	/**
	 * Sets the stored value without notifying any subscribed listeners.
	 */
	setSilent(value: T): void;
}
