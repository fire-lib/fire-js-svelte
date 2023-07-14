import Listeners from 'fire/util/listeners.js';

export default class Writable {
	constructor(def = null) {
		this.inner = def;
		this.listeners = new Listeners;
	}

	subscribe(fn) {
		fn(this.inner);
		return this.listeners.add(fn);
	}

	get() {
		return this.inner;
	}

	set(inner) {
		this.inner = inner;
		this.listeners.trigger(inner);
	}
}