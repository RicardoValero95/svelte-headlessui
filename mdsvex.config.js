import prism from "prismjs";
import rehypeSlug from "rehype-slug";
import "prism-svelte";

export default {
  extensions: [".svx", ".md"],
  rehypePlugins: [rehypeSlug],
  highlight: (text, lang) =>
    lang && lang in prism.languages
      ? prism.highlight(text, prism.languages[lang], lang)
      : null,
};
