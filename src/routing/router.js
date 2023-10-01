import Writable from '../stores/writable.js';
import Listeners from 'fire/util/listeners.js';
import Route from './route.js';
import Request from './request.js';

export default class Router {
	/// Creates a new Router to access it from everywhere, store it in a context
	/// 
	/// currentRequest is a store which stores the current request
	constructor() {
		this.routes = [];

		// gets updated before the page might have loaded
		this.currentRequest = new Writable;
	}

	/// Register a route with a uri and a load component function
	///
	/// uri: should either be a string or a Regex object with named groups
	/// loadComp: should be function which loads a svelte component
	register(uri, loadComp) {
		return this.registerRoute(new Route(uri, loadComp));
	}

	/// Registers a route
	/// 
	/// route: Route
	registerRoute(route) {
		this.routes.push(route);
		return route;
	}

	// fn: (Request) -> void
	onRequest(fn) {
		return this.currentRequest.listeners.add(fn);
	}

	/// setup Router on the client
	initClient() {
		const req = Request.fromCurrent();
		this.currentRequest.set(req);
		window.history.replaceState(req.toHistoryState(), '');
		this._listen();
	}

	/// Replaces the state of the current request
	replaceState(state = {}) {
		// todo should this trigger a request change?
		this.currentRequest.get().state = state;
		window.history.replaceState(
			this.currentRequest.get().toHistoryState(),
			''
		);
	}

	// replace the current Request without triggering any events
	replaceReq(req) {
		this.currentRequest.setSilent(req);
		window.history.replaceState(
			req.toHistoryState(),
			'',
			req.toUriWithSearch()
		);
	}

	/// Goes back a step in the history
	back() {
		window.history.back();
	}

	/// This triggers the onRequest 
	/// always reloads even if the page might be the same
	reload() {
		this.currentRequest.set(this.currentRequest.get());
	}

	// tries to get the route by the request
	route(req) {
		return this.routes.find(r => r.check(req));
	}

	_openReq(req) {
		const nUri = req.toUriWithSearch();
		if (this.currentRequest.get().toUriWithSearch() === nUri)
			return;

		window.history.pushState(req.toHistoryState(), '', nUri);
		this.currentRequest.set(req);
	}

	/// Opens a url, does noting if the url does not belong to this router
	/// If the protocol or host does not match
	open(url, state = {}, opts = {}) {
		const req = this._urlToRequest(url, state, opts);
		if (!req)
			return;

		this._openReq(req);
	}

	_listen() {
		window.addEventListener('click', e => {
			const link = e.target.closest('a');
			const openInNewTab = e.metaKey || e.ctrlKey || e.shiftKey;
			const saveLink = e.altKey;
			if (!link || !link.href || openInNewTab || saveLink)
				return;

			const target = link?.target ?? '';
			if (target.toLowerCase() === '_blank')
				return;

			const req = this._urlToRequest(link.href, {}, { origin: 'click' });
			if (!req)
				return;

			e.preventDefault();

			this._openReq(req);
		});

		window.addEventListener('popstate', e => {
			e.preventDefault();

			const req = new Request(
				e.state.uri,
				e.state.state ?? {},
				e.state?.search ?? '',
				{ origin: 'pop' }
			);
			this.currentRequest.set(req);
		})
	}

	/// returns null if the url does not match our host and protocol
	_urlToRequest(url, state = {}, opts = {}) {
		const loc = window.location;

		if (url.startsWith('/'))
			url = loc.protocol + '//' + loc.host + url;

		try {
			url = new URL(url);
		} catch (e) {
			console.log('invalid url', e);
			return null;
		}
		// validate protocol and host
		if (url.protocol !== loc.protocol || url.host !== loc.host)
			return null;

		return new Request(url.pathname, state, url.search, opts);
	}
}