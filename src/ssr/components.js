export default class SsrComponents {
	constructor() {
		this.modules = new Set;
	}

	/// ctx: Map
	addToContext(ctx) {
		ctx.set('modules', this.modules);
	}

	/// Returns preload for js and link stylesheet for css
	///
	/// ssrManifest: {}, gets generated by client build
	toHead(ssrManifest) {
		const requirements = new Set;
		for (const mod of this.modules) {
			const deps = ssrManifest[mod] ?? [];
			deps.forEach(dep => requirements.add(dep));
		}

		let head = '';
		for (const req of requirements) {
			if (req.endsWith('.js')) {
				head += `\n\t\t<link rel="preload" href="${req}" as="script">`;
			} else if (req.endsWith('.css')) {
				head += `\n\t\t<link rel="stylesheet" href="${req}">`;
			}
		}

		return head;
	}
}

// todo need to replace this
// relative should be the function from ``
/*
import { relative } from 'path';
usedSsrComponents(f => relative(__dirname, f))
*/
export function usedSsrComponents(relativeFn) {
	return {
		transform(code, id, options) {
			if (!options?.ssr || !id.endsWith('.svelte'))
				return;

			const file = relativeFn(id);

			const initFnSign = 'create_ssr_component(($$result, $$props, $$bindings, slots) => {';

			let idx = code.indexOf(initFnSign);
			if (idx < 0)
				return;
			idx += initFnSign.length;

			code = `
import { getContext as __modulesGetContext } from 'svelte';
${ code.substr(0, idx) }
(() => {
const ctx = __modulesGetContext('modules');
if (ctx && ctx instanceof Set) {
	ctx.add('${ file }');
}
})();
${ code.substr(idx) }
`;

			return code;
		}
	};
}