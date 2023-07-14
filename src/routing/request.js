function sanitizeUri(uri) {
	if (uri.length < 2)
		return uri;

	if (uri[uri.length - 1] === '/')
		return uri.substr(0, uri.length - 1);
	return uri;
}

export default class Request {
	constructor(uri, state = {}) {
		this.uri = sanitizeUri(uri);
		this.state = state;
	}

	static fromCurrent() {
		const state = window.history.state?.state ?? null;
		return new Request(window.location.pathname, state);
	}

	toHistoryState() {
		return {
			uri: this.uri,
			state: this.state
		}
	}
}