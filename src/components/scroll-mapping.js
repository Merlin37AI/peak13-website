  /* ---------- scroll mapping ---------- */
  /* u = 0..4 when chapter card 0..4 sits at its resting line (mid-screen on desktop, 64% down on phones) */
  var lis = document.querySelectorAll("#stage .chapter");
  var li0Doc = 0, LIH = window.innerHeight, ANCHOR = 0.5;
  function measure() {
    sizeCanvas();
    var r = lis[0].getBoundingClientRect();
    li0Doc = r.top + window.scrollY;
    LIH = r.height || window.innerHeight;
    ANCHOR = MOB ? 0.64 : 0.5;
  }
  function uNow() {
    return (window.scrollY + window.innerHeight * ANCHOR - (li0Doc + LIH * ANCHOR)) / LIH;
  }

  var cur = null, tgt = 0, dirty = true, inView = true, lastT = 0;
  function onScroll() { tgt = uNow(); rail(); }
  function frame(t) {
    requestAnimationFrame(frame);
    if (!inView) return;
    if (cur === null) cur = tgt;
    var prev = cur;
    cur = RM ? tgt : cur + (tgt - cur) * 0.14;
    if (Math.abs(tgt - cur) < 0.0004) cur = tgt;
    if (!RM || cur !== prev || dirty) { var s = render(cur, t); hud(cur, s); dirty = false; }
  }

  var thumb = $("#railThumb");
  function rail() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    thumb.style.transform = "translateY(" + (p * 106).toFixed(1) + "px)";
  }

  new IntersectionObserver(function (es) { inView = es[0].isIntersecting; dirty = true; }, { rootMargin: "100px" }).observe($("#stage"));
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { measure(); onScroll(); dirty = true; if (typeof measureG === "function") { measureG(); dirtyG = true; } });
  window.addEventListener("load", function () { measure(); onScroll(); dirty = true; measureG(); dirtyG = true; });

