export default class Route {
	constructor(uri, loadComp) {
		this.uri = uri;
		this.isRegex = typeof uri !== 'string';
		this.loadComp = loadComp;
		this.props = {};

		if (this.isRegex && !(uri instanceof RegExp))
			throw new Error('expected a regex as uri');
	}

	check(req) {
		if (!this.isRegex)
			return this.uri === req.uri;
		const match = req.uri.match(this.uri);
		if (!match || match[0] != req.uri)
			return false;

		this.props = match.groups;
		return true;
	}

	async load() {
		return await this.loadComp();
	}
}