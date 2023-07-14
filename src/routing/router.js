import Writable from '../stores/writable.js';
import Listeners from 'fire/util/listeners.js';
import Route from './route.js';
import Request from './request.js';

// we store the Router not in a local variable
// so that hmr works correctly
const glob = typeof window !== 'undefined' ? window : globalThis;

export default class Router {
	/// Creates a new Router and stores it globally
	/// 
	/// currentRequest is a store which stores the current request
	constructor() {
		this.routes = [];

		// gets updated before the page might have loaded
		this.currentRequest = new Writable;

		glob.ROUTER = this;
	}

	/// Gets the current global Router
	static get() {
		return glob.ROUTER;
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
		this.currentRequest.set(Request.fromCurrent());
		this.replaceState();
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
		if (this.currentRequest.get().uri === req.uri)
			return;

		window.history.pushState(req.toHistoryState(), '', req.uri);
		this.currentRequest.set(req);
	}

	/// Opens a url, does noting if the url does not belong to this router
	/// If the protocol or host does not match
	open(url) {
		const uri = this._convertUrlToUri(url);
		if (uri === null)
			return;

		this._openReq(new Request(uri));
	}

	_listen() {
		window.addEventListener('click', e => {
			const link = e.target.closest('a');

			if (!link)
				return;

			const uri = this._convertUrlToUri(link.href);
			if (uri === null)
				return;

			e.preventDefault();

			this._openReq(new Request(uri));
		});

		window.addEventListener('popstate', e => {
			e.preventDefault();

			const req = new Request(e.state.uri, e.state.state ?? null);
			this.currentRequest.set(req);
		})
	}

	/// returns null if the url does not match our host and protocol
	_convertUrlToUri(url) {
		const loc = window.location;
		const protHost = loc.protocol + '//' + loc.host + '/';

		if (url.startsWith('/'))
			url = protHost + url.substr(1);

		try {
			url = new URL(url);
		} catch (e) {
			console.log('invalid url', e);
			return null;
		}

		if (url.protocol !== loc.protocol || url.host !== loc.host)
			return null;

		return url.pathname;
	}
}