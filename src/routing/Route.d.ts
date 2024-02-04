import Request from './Request';

export default class Route {
	/**
	 * Creates a new route
	 *
	 * @param uri The uri of the route can be a string or a regular expression with named groups
	 * @param loadComp The component to be loaded when the route is matched
	 */
	constructor(uri: string | RegExp, loadComp: (req: Request) => Promise<any>);

	/**
	 * Checks if the route matches the given request should return true if the route matches the request
	 *
	 * @param req The request to match
	 */
	check(req: Request): boolean;

	/**
	 * Returns the regex matches
	 */
	toRegexProps(req: Request): { [key: string]: string };

	/**
	 * Returns the search props
	 */
	toSearchProps(req: Request): { [key: string]: string };

	/**
	 * Returns the properties of this route
	 */
	toProps(req: Request): { [key: string]: string };

	/**
	 * Loads the component corresponding to this route
	 */
	load(req: Request): Promise<any>;
}
