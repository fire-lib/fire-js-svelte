export default class Request {
	/**
	 * Creates a new request
	 * @param {URL} url must be of type URL
	 * @param {any} state some data which should persist page loads
	 * @param {Object} opts `{origin}`
	 */
	constructor(url, state = null, opts = {}) {
		/**
		 * The url of the request
		 */
		this.url = url;

		/**
		 * Data which should persist between pageloads
		 */
		this.state = state;

		/**
		 * The origin of this request
		 * manual/click/pop
		 */
		this.origin = opts?.origin ?? 'manual';

		/**
		 * Returns the scrollY position the request expects to be at
		 * 
		 * This does not change while scrolling
		 */
		this.scrollY = opts?.scrollY ?? 0;

		/**
		 * Returns the history index if the current request
		 * 
		 * This is should only be set by the router
		 */
		this.index = opts?.index ?? 0;
	}

	static fromCurrent() {
		const historyState = window.history.state;

		return new Request(
			new URL(window.location.href),
			historyState?.state ?? null,
			{
				origin: 'manual',
				scrollY: historyState?.scrollY ?? window.scrollY,
				index: historyState?.index ?? 0
			}
		);
	}

	/**
	 * Returns the pathname
	 * remove any trialing slash
	 */
	get pathname() {
		const p = this.url.pathname;
		if (p.endsWith('/') && p.length > 1)
			return p.substring(0, p.length - 1);
		return p;
	}

	get uri() {
		return this.pathname + this.url.search + this.url.hash;
	}

	get search() {
		return this.url.searchParams;
	}

	toHistoryState() {
		return {
			state: this.state,
			scrollY: this.scrollY,
			index: this.index
		};
	}

	/// does only copy the state on level deep
	clone() {
		let state = null;
		if (this.state !== null) {
			if (typeof this.state.clone === 'function')
				state = this.state.clone();
			else if (typeof this.state === 'object')
				state = { ...this.state };
			else
				state = this.state;
		}

		return new Request(
			new URL(this.url.toString()),
			state,
			{
				origin: this.origin,
				scrollY: this.scrollY,
				index: this.index
			}
		);
	}
}