export default class SsrComponents {
	constructor();

	/**
	 * Add a component to the context
	 *
	 * @param context
	 */
	addToContext(context: Map<string, any>): void;

	/**
	 * Returns preload for js and link stylesheet for css
	 */
	toHead(ssrManifest: object): string;
}

/**
 * Used to collect all the components that are used in the app
 */
export declare function usedSsrComponents(
	relativeFn: (f: string) => string,
): any;
