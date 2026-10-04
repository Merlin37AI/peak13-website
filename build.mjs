// Peak13 Website build. No dependencies: node build.mjs
// Assembles src/ into dist/ and copies public/ across.
//   src/layouts/base.html  + src/pages/index.html (with <!--include:...--> components)  -> dist/index.html
//   src/manifest.json lists the css and js fragments in the order they are joined      -> dist/assets/site.css, site.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => path.join(root, "src", p);
const dist = path.join(root, "dist");
const read = (p) => fs.readFileSync(p, "utf8");

function resolveIncludes(text, seen = []) {
  return text.replace(/<!--\s*include:\s*([^\s]+?)\s*-->/g, (_, rel) => {
    const file = src(rel);
    if (seen.includes(file)) throw new Error("Circular include: " + rel);
    return resolveIncludes(read(file).replace(/\s+$/, ""), [...seen, file]);
  });
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });

const manifest = JSON.parse(read(src("manifest.json")));
const css = manifest.css.map((f) => read(src(f))).join("");
const js = manifest.js.map((f) => read(src(f))).join("");
fs.writeFileSync(path.join(dist, "assets", "site.css"), css);
// The js fragments share one scope: they are joined inside a single wrapper, in manifest order.
fs.writeFileSync(path.join(dist, "assets", "site.js"), '(function () {\n  "use strict";\n' + js + "})();\n");

const layout = read(src("layouts/base.html"));
const page = resolveIncludes(read(src("pages/index.html")));
if (!layout.includes("<!--PAGE-->")) throw new Error("layouts/base.html has no <!--PAGE--> slot");
fs.writeFileSync(path.join(dist, "index.html"), layout.replace("<!--PAGE-->", page));

const pub = path.join(root, "public");
if (fs.existsSync(pub)) fs.cpSync(pub, dist, { recursive: true });

console.log(`Built dist/: ${manifest.css.length} css + ${manifest.js.length} js fragments, page assembled from src/pages/index.html`);
