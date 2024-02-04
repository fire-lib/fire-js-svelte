export declare type RequestOptions = {
	origin?: string;
};

export type RequestOrigin = 'manual' | 'click' | 'pop';

export default class Request {
	/**
	 * The URL of the request
	 */
	url: URL;

	/**
	 * Data which should persist between page loads
	 */
	state: RequestOrigin;

	/**
	 * The Scroll position of the request
	 */
	scrollY: number;

	/**
	 * The history index of the request
	 *
	 * This should only be set by the router
	 */
	index: number;

	/**
	 * The origin of the request
	 */

	/**
	 * Creates a new request
	 * @param {URL} url must be of type URL
	 * @param {any} state some data which should persist page loads
	 * @param {Object} opts `{origin}`
	 */
	constructor(url: URL, state: any, opts: RequestOptions);

	/**
	 * Returns the pathname of the request removing any trailing slashes
	 */
	get pathname(): string;

	/**
	 * Returns the uri of the request
	 */
	get uri(): string;

	/**
	 * Returns the search of the request
	 */
	get search(): URLSearchParams;

	/**
	 * Returns a clone of the request, makes y shallow copy of the state
	 */
	clone(): Request;
}
