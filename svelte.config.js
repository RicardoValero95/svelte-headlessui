import path from "path";

import adapter from "@sveltejs/adapter-auto";
import { mdsvex } from "mdsvex";
import preprocess from "svelte-preprocess";
import unoCss from "unocss/vite";

import mdsvexConfig from "./mdsvex.config.js";
import unoConfig from "./uno.config.js";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  extensions: [".svelte", ".svx", ".md"],
  preprocess: [preprocess(), mdsvex(mdsvexConfig)],

  kit: {
    adapter: adapter(),
    package: {
      exports: (filepath) => {
        return filepath.endsWith("index.js");
      },
      files: (filepath) => {
        return !filepath.endsWith(".test.ts");
      },
    },

    // hydrate the <div id="svelte"> element in src/app.html
    target: "#svelte",
    vite: {
      plugins: [unoCss(unoConfig)],
      resolve: {
        alias: {
          $site: path.resolve("./src/site"),
        },
      },
    },
  },
};

export default config;
