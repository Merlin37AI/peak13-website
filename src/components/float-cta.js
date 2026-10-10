/* floating booking button: visible once the hero has scrolled away, hidden again while the offers or the final call to action are on screen */
(function floatCta() {
  var el = document.querySelector(".floatcta");
  if (!el || !("IntersectionObserver" in window)) return;
  var seen = { hero: true, audit: false, cta: false };
  function sync() { el.classList.toggle("on", !seen.hero && !seen.audit && !seen.cta); }
  [["hero", ".hero"], ["audit", "#audit"], ["cta", ".cta-wrap"]].forEach(function (p) {
    var node = document.querySelector(p[1]);
    if (!node) return;
    new IntersectionObserver(function (es) { seen[p[0]] = es[0].isIntersecting; sync(); }).observe(node);
  });
})();
