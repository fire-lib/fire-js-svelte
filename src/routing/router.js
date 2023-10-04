import Writable from '../stores/writable.js';
import Listeners from 'fire/util/listeners.js';
import Barrier from 'fire/util/barrier.js';
import Route from './route.js';
import Request from './request.js';

function defaultRequestListener(req, routing) {
	if (routing.dataReady())
		return;

	setTimeout(() => {
		routing.domReady();
	}, 100);
}

export default class Router {
	/**
	 * Creates a new Router to access it from everywhere, store it in a context
	 */
	constructor() {
		/**
		 * All routes
		 */
		this.routes = [];

		/**
		 * newRequest is a store which stores the request which is not completed
		 */
		this.newRequest = new Writable;
		this.requestListener = defaultRequestListener;
		this.newRequestVersion = 0;

		/**
		 * currentRequest is a store which stores the current request
		 */
		// gets updated before the page might have loaded
		this.currentRequest = new Writable;
	}

	/**
	 * Register a route with a uri and a load component function
	 * 
	 * @param {string} uri should either be a string or a Regex object with
	 * named groups
	 * @param {function} loadComp should be function which loads a svelte
	 * component
	 */
	register(uri, loadComp) {
		return this.registerRoute(new Route(uri, loadComp));
	}

	/**
	 * Registers a route
	 * 
	 * @param {Route} route
	 */
	registerRoute(route) {
		this.routes.push(route);
		return route;
	}

	/**
	 * Handle Requests
	 * when everything you wan't to do is done
	 * call routing.dataReady
	 * and then when the dom is updated call
	 * routing.domReady
	 * 
	 * @param {function} fn `(Request, routing) -> void`
	 */
	onRequest(fn) {
		this.requestListener = fn;

		return () => {
			this.requestListener = defaultRequestListener;
		};
	}

	/**
	 * Handles Route requests (overrides onRequest)
	 * 
	 * @param {function} fn `(Request, Route, ready) -> void`
	 */
	onRoute(fn) {
		return this.onRequest((req, ready) => {
			const route = this.route(req);
			fn(req, route, ready);
		});
	}

	/// setup Router on the client
	initClient() {
		const req = Request.fromCurrent();
		this.openReq(req, { history: 'none', checkCurrent: false });
		this._listen();

		// disable scroll restoration
		window.history.scrollRestoration = 'manual';

		return req;
	}

	initServer(url) {
		const req = new Request(new URL(url));
		this.newRequest.set(req);
		this.currentRequest.set(req);

		return req;
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
			req.uri
		);
	}

	/// Goes back a step in the history
	back() {
		return window.history.back();
	}

	/// This triggers the onRequest 
	/// always reloads even if the page might be the same
	reload() {
		const req = this.currentRequest.get();
		if (!req)
			throw new Error('router does not have a current request');
		this.openReq(req.clone(), { history: 'replace', checkCurrent: false });
	}

	// tries to get the route by the request
	route(req) {
		return this.routes.find(r => r.check(req));
	}

	/**
	 * Opens a request if the same page is not already open
	 * 
	 * @param {Request} req
	 * @param {Object} opts `{ history: push/replace/none, checkCurrent }`
	 */
	async openReq(req, opts = {}) {
		const history = opts?.history ?? 'push';
		const checkCurrent = opts?.checkCurrent ?? true;

		const nUri = req.uri;

		if (checkCurrent && this.currentRequest.get()?.uri === nUri)
			return;

		// process
		// trigger requestListener
		// trigger newRequest
		// wait on requestListener reaady
		// trigger scroll when dom update
		const version = ++this.newRequestVersion;
		const hasVersionChange = () => this.newRequestVersion !== version;

		const dataBarrier = new Barrier;
		const dataBarrier1 = dataBarrier.add();
		const dataBarrier2 = dataBarrier.add();

		const domBarrier = new Barrier;
		const domBarrier1 = domBarrier.add();
		const domBarrier2 = domBarrier.add();

		this.requestListener(req, {
			dataReady: async () => {
				return await dataBarrier1.ready(hasVersionChange());
			},
			domReady: async () => {
				return await domBarrier1.ready(hasVersionChange());
			}
		});

		this.newRequest.set(req);
		// if version changed
		if (await dataBarrier2.ready(hasVersionChange()))
			return console.log('request overriden, version changed');

		// before we update the current Request let's store the scroll position
		const curReq = this.currentRequest.get();
		if (curReq) {
			curReq.scrollY = window.scrollY;
			window.history.replaceState(
				curReq.toHistoryState(),
				''
			);
		}

		if (history === 'replace') {
			window.history.replaceState(
				req.toHistoryState(),
				'',
				req.uri
			);
		} else if (history === 'push') {
			window.history.pushState(req.toHistoryState(), '', nUri);
		}

		this.currentRequest.set(req);

		// if version changed
		if (await domBarrier2.ready(hasVersionChange()))
			return console.log('request overriden, version changed');

		// restore scroll
		window.scrollTo({
			top: req.scrollY
		});
	}

	/// Opens a url, does nothing if the url does not belong to this router
	/// If the protocol or host does not match
	open(url, state = {}, opts = {}) {
		if (!opts?.origin)
			opts.origin = 'manual';
		const req = this._urlToRequest(url, state, opts);
		if (!req)
			return;

		this.openReq(req);
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

			this.openReq(req);
		});

		window.addEventListener('popstate', e => {
			e.preventDefault();

			const req = Request.fromCurrent();
			req.origin = 'pop';
			this.openReq(req, { history: 'none', checkCurrent: false });
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

		return new Request(url, state, opts);
	}
}