---
title: "Non-traditional WebC usage#"
author: Eleventy
url: https://www.11ty.dev/docs/languages/webc/#global-no-import-components
---

> Eleventy runs WebC in Bundler mode. That means that when it finds `<style>`, `<link rel="stylesheet">`, or `<script>` elements in component definitions, they are removed from the output markup and *their content* is aggregated together for re-use in asset bundles on the page. Read more about [CSS and JS in WebC](https://www.11ty.dev/docs/languages/webc#css-and-js-(bundler-mode)). *(You can opt-out of this behavior with `webc:keep`.)*


> You have full access to the data cascade here (note `frontmatterdata` is [set in front matter](https://www.11ty.dev/docs/languages/webc#front-matter) above).


> Notably, the parser tries to force custom element children in the `<head>` over to the `<body>`. To workaround this limitation, use [`webc:is`](https://www.11ty.dev/docs/languages/webc#webcis).


> *Notable note*: front matter (per standard Eleventy conventions) is supported in page-level templates only (`.webc` files in your input directory) and not in components (see below).


> Notably, the path for `components` is relative to your project root (**not** your [project’s `input` directory](https://www.11ty.dev/docs/config#input-directory)).


> The file names of components found in the glob determine the global tag name used in your project (e.g. `_components/my-component.webc` will give you access to `<my-component>`).


> `webc:keep` is required on `<style>` and `<script>` in your layout files to prevent re-bundling the bundles.



