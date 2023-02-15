import { bundle } from "https://deno.land/x/emit@0.15.0/mod.ts";
import { createCache } from "https://deno.land/x/deno_cache@0.4.1/mod.ts";

const cache = createCache();

const { code: bundledCode } = await bundle("./mod.ts", {
	load: (specifier) => {
		if (specifier.endsWith(".deno.ts")) {
			const baseLength = specifier.length - ".deno.ts".length;
			specifier = specifier.substring(0, baseLength) + ".web.ts";
		}
		return cache.load(specifier);
	},
	compilerOptions: {
		sourceMap: false,
		inlineSources: false,
		inlineSourceMap: false,
	},
});

await Deno.writeTextFile(
	"./dist/web.mjs",
	bundledCode.replace(/\/\/# sourceMappingURL=.*\n/, ""),
);

console.log("Done.");
