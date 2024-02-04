import Route from './Route';
import Request from './Request';

export type RoutingHandler = {
	dataReady: () => Promise<boolean>;
	domReady: () => Promise<boolean>;
};

export type OpenReqOptions = {
	history?: HistoryAction;
	checkCurrent?: boolean;
};

export type HistoryAction = 'push' | 'replace' | 'none';

export type RequestOptions = {
	origin?: string;
	scrollY?: number;
	history?: HistoryAction;
	checkCurrent?: boolean;
};

export default class Router {
	/**
	 * Creates a new Router to access it from everywhere, store it in a context
	 */
	constructor();

	/**
	 * Register a route with a uri and a load component function
	 *
	 * @param uri should either be a string or a Regex object with
	 * named groups
	 * @param loadComp should be function which loads a svelte
	 * component
	 */
	register(
		uri: string | RegExp,
		loadComp: (req: Request) => Promise<any>,
	): void;

	/**
	 * Registers a route
	 *
	 * @param route
	 */
	registerRoute(route: Route): void;

	/**
	 * Handle Requests
	 * when everything you wan't to do is done
	 * call routing.dataReady
	 * and then when the dom is updated call
	 * routing.domReady
	 *
	 * @param fn `(Request, routing) -> void`
	 */
	onRequest(fn: (req: Request, routing: RoutingHandler) => void): void;

	/**
	 * Handles Route requests (overrides onRequest)
	 *
	 * @param {function} fn `(Request, Route, ready) -> void`
	 */
	onRoute(
		fn: (req: Request, route: Route, routing: RoutingHandler) => void,
	): void;

	/**
	 * Steup Router on the client
	 */
	initClient(): void;

	/**
	 * Steup Router on the server
	 */
	initServer(url: string): void;

	/**
	 * Replaces the state of the current request
	 */
	replaceState(state?: object): void;

	/**
	 * This is only intended to be used if you wan't to modify the history state without triggering a routeChange Event
	 */
	pushReq(req: Request): void;

	/**
	 * replace the current Request without triggering any events
	 */
	replaceReq(req: Request): void;

	/**
	 * Returns true if we can go back in history
	 */
	canGoBack(): boolean;

	/**
	 * Goes back a step in the history
	 */
	back(): void;

	/**
	 * This triggers the onRequest
	 * always reloads even if the page might be the same
	 */
	reload(): void;

	/**
	 * tries to get the route by the request
	 */
	route(req: Request): Route | null;

	/**
	 * Opens a request if the same page is not already open
	 *
	 * @param {Request} req
	 * @param {Object} opts `{ history: push/replace/none, checkCurrent }`
	 */
	openReq(req: Request, opts?: OpenReqOptions): Promise<void>;

	/**
	 * Opens a url, if the protocol or the host does not match does nothing
	 *
	 * @param {string} url must start with a / or a protocol
	 * @param {any} state some data which should persist page loads
	 * @param {Object} opts `{ origin, scrollY, history, checkCurrent }`
	 */
	open(url: string, state?: any, opts?: RequestOptions): void;
}
