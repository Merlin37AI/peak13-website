  /* ---------- build flow: lights each step in turn while on screen ---------- */
  var flow = $("#flow"), fns = flow.querySelectorAll(".fn"), fouts = flow.querySelectorAll(".flow__out li"), fstep = $("#flowStep");
  var fs = -1, fhold = 0, ftimer = null;
  function setFlow(n) {
    fs = n;
    fns.forEach(function (el, i) { el.classList.toggle("on", i <= n); el.classList.toggle("cur", i === n); });
    fouts.forEach(function (el) { el.classList.toggle("on", n >= 3); });
    fstep.textContent = "Step " + clamp(n + 1, 1, 5) + " / 5";
  }
  var fpaused = false, fbtn = $("#flowPause");
  fbtn.addEventListener("click", function () {
    fpaused = !fpaused;
    fbtn.setAttribute("aria-pressed", fpaused);
    fbtn.textContent = fpaused ? "Play" : "Pause";
  });
  function flowTick() {
    if (fpaused) return;
    if (fs < 4) { setFlow(fs + 1); return; }
    if (++fhold < 3) { fns.forEach(function (el) { el.classList.remove("cur"); }); return; }
    fhold = 0; setFlow(-1);
  }
  var minis = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle("live", e.isIntersecting); });
  });
  document.querySelectorAll(".mini").forEach(function (el) { minis.observe(el); });
  if (RM) { setFlow(4); fns.forEach(function (el) { el.classList.remove("cur"); }); }
  else new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { if (!ftimer) { ftimer = setInterval(flowTick, 1500); flowTick(); } }
    else { clearInterval(ftimer); ftimer = null; }
  }, { threshold: 0.35 }).observe(flow);

