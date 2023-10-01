function sanitizeUri(uri) {
	if (uri.length < 2)
		return uri;

	if (uri[uri.length - 1] === '/')
		return uri.substr(0, uri.length - 1);
	return uri;
}

export default class Request {
	constructor(uri, state = {}, search = '', opts = {}) {
		this.uri = sanitizeUri(uri);
		this.search = new URLSearchParams(search);
		this.state = state;
		// manual, click, pop
		this.origin = opts?.origin ?? 'manual';
	}

	static fromCurrent() {
		return new Request(
			window.location.pathname,
			window.history.state?.state ?? null,
			window.location.search
		);
	}

	toUriWithSearch() {
		let uri = this.uri;
		if (this.search.size)
			uri += '?' + this.search.toString();

		return uri;
	}

	toHistoryState() {
		return {
			uri: this.uri,
			state: this.state,
			search: this.search.toString()
		};
	}

	/// does only copy the state on level deep
	clone() {
		const { uri, state, search } = this.toHistoryState();
		return new Request(uri, { ...state }, search);
	}
}