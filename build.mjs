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

const layout = resolveIncludes(read(src("layouts/base.html")));
const page = resolveIncludes(read(src("pages/index.html")));
if (!layout.includes("<!--PAGE-->")) throw new Error("layouts/base.html has no <!--PAGE--> slot");
fs.writeFileSync(path.join(dist, "index.html"), layout.replace("<!--PAGE-->", page));

// Inner pages (legal and services): plain reading layout, no scene scripts. Output is dist/<name>.html.
// Titles and descriptions are checked against their length limits, and every JSON-LD block is built from
// data (never typed by hand) so it is always valid JSON. The FAQ text and its FAQPage markup share one source.
const SITE = "https://www.peak13.co.uk";
const ORG = { "@id": `${SITE}/#organization` };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const ld = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj)}\n</script>`;
const faq = JSON.parse(read(src("pages/faq.json")));
const crumbs = (name, slug) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Services", item: `${SITE}/services.html` },
    { "@type": "ListItem", position: 3, name, item: `${SITE}/${slug}.html` },
  ],
});
const service = (name, slug, serviceType, description, offer) => ({
  "@context": "https://schema.org", "@type": "Service", name, serviceType, description,
  url: `${SITE}/${slug}.html`, provider: ORG, areaServed: "GB",
  offers: { "@type": "Offer", url: `${SITE}/${slug}.html`, priceCurrency: "GBP", ...offer },
});
const D_AUDIT = "A 5-day operational audit for UK lettings and property management firms. We trace where time and money go and rank it. £997 one-off.";
const D_AUTO = "Workflow automations and AI agents for UK lettings and property management firms, built round your own process. From £3,000, quoted first.";
const D_RET = "15 hours a month inside your lettings or property management business. £1,500 a month, 3-month minimum, first month includes the audit.";
const D_HUB = "Three operational efficiency services for UK lettings and property management firms: a £997 audit, automations from £3,000, a £1,500 retainer.";
const innerPages = [
  { name: "privacy", title: "Privacy notice | Peak13", desc: "How Peak13 Potential Ltd handles personal data collected through this website and when you contact us." },
  { name: "terms", title: "Website terms | Peak13", desc: "The terms for using the Peak13 Potential Ltd website." },
  { name: "services", title: "Efficiency Services for UK Lettings Agents | Peak13", desc: D_HUB,
    ld: [{ "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] },
  { name: "stoic-audit", title: "STOIC Operational Audit for UK Lettings Agents | Peak13", desc: D_AUDIT,
    ld: [service("STOIC Operational Audit", "stoic-audit", "Operational efficiency audit", D_AUDIT, { price: "997" }), crumbs("STOIC Operational Audit", "stoic-audit")] },
  { name: "agents-and-automations", title: "Workflow Automation for UK Lettings Agents | Peak13", desc: D_AUTO,
    ld: [service("Agents & Automations", "agents-and-automations", "Workflow automation and AI agents", D_AUTO,
        { priceSpecification: { "@type": "PriceSpecification", minPrice: 3000, priceCurrency: "GBP" } }), crumbs("Agents & Automations", "agents-and-automations")] },
  { name: "embedded-retainer", title: "Embedded Operations Retainer for Lettings Agents | Peak13", desc: D_RET,
    ld: [service("Embedded Operations Retainer", "embedded-retainer", "Embedded operations retainer", D_RET,
        { priceSpecification: { "@type": "UnitPriceSpecification", price: 1500, priceCurrency: "GBP", unitCode: "MON", unitText: "month" } }), crumbs("Embedded Operations Retainer", "embedded-retainer")] },
];
const faqHtml = `<div class="faq">\n${faq.map((f) => `<h3>${esc(f.q)}</h3>\n<p>${esc(f.a)}</p>`).join("\n")}\n</div>`;
const innerLayout = resolveIncludes(read(src("layouts/legal.html")));
for (const p of innerPages) {
  if (p.title.length >= 60) throw new Error(`Title too long (${p.title.length}): ${p.title}`);
  if (p.desc.length > 150) throw new Error(`Description too long (${p.desc.length}): ${p.name}`);
  const body = resolveIncludes(read(src(`pages/${p.name}.html`))).replace("<!--FAQ-->", faqHtml);
  const html = innerLayout
    .replaceAll("%TITLE%", esc(p.title)).replaceAll("%DESC%", esc(p.desc)).replaceAll("%CANON%", `${SITE}/${p.name}.html`)
    .replace("%LD%", (p.ld || []).map(ld).join("\n"))
    .replace("<!--PAGE-->", () => body);
  fs.writeFileSync(path.join(dist, `${p.name}.html`), html);
}

const pub = path.join(root, "public");
if (fs.existsSync(pub)) fs.cpSync(pub, dist, { recursive: true });

console.log(`Built dist/: ${manifest.css.length} css + ${manifest.js.length} js fragments, page assembled from src/pages/index.html`);
