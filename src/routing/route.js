export default class Route {
	constructor(uri, loadComp) {
		this.uri = uri;
		this.isRegex = typeof uri !== 'string';
		this.loadComp = loadComp;

		if (this.isRegex && !(uri instanceof RegExp))
			throw new Error('expected a regex as uri');
	}

	check(req) {
		const reqUri = req.pathname;

		if (!this.isRegex)
			return this.uri === reqUri;

		const match = reqUri.match(this.uri);
		return match && match[0] === reqUri;
	}

	/// Regex matches
	toRegexProps(req) {
		if (!this.isRegex)
			return {};

		const match = req.pathname.match(this.uri);
		return match.groups;
	}

	toSearchProps(req) {
		return Object.fromEntries(req.url.searchParams.entries());
	}

	toProps(req) {
		return {
			...this.toRegexProps(req),
			...this.toSearchProps(req)
		};
	}

	/**
	 * Loads the component corresponding to this route
	 */
	async load(req) {
		return await this.loadComp(req);
	}
}