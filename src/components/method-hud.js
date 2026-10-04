  /* ---------- HUD + panels ---------- */
  var CLIPS = ["Step 1: The whole building", "Step 2: The track", "Step 3: The vital few", "Step 4: The matrix", "Step 5: Loss and recovery"];
  var STEPS = ["Survey", "Trace", "Order", "Interrogate", "Cost"];
  var hudClip = $("#hudClip"), hudOrbit = $("#hudOrbit"), hudStep = $("#hudStep"), idx = document.querySelectorAll("#hudIdx b");
  var mx = $("#mx"), cs = $("#cs"), mxB = mx.querySelectorAll(".b"), mxL = mx.querySelectorAll(".top3 li");
  var csBars = { ti: cs.querySelector(".ti"), tr: cs.querySelector(".tr2"), mi: cs.querySelector(".mi"), mr: cs.querySelector(".mr") };
  var csNum = { ti: cs.querySelector("[data-k=ti]"), tr: cs.querySelector("[data-k=tr]"), mi: cs.querySelector("[data-k=mi]"), mr: cs.querySelector("[data-k=mr]") };
  var lastStep = -1, lastOrbit = "";
  function setIf(el, prop, v) { var m = el._m || (el._m = {}); if (m[prop] !== v) { m[prop] = v; if (prop === "t") el.textContent = v; else el.style[prop] = v; } }
  function panel(el, a) {
    setIf(el, "opacity", a.toFixed(3));
    setIf(el, "visibility", a < 0.01 ? "hidden" : "visible");
    setIf(el, "translate", ((1 - a) * 28).toFixed(1) + "px 0");
  }
  function money(n) { return "£" + Math.round(n).toLocaleString("en-GB"); }
  function hud(u, s) {
    var st = stepOf(u), i;
    if (st !== lastStep) {
      lastStep = st;
      hudClip.textContent = CLIPS[st];
      hudStep.textContent = "STOIC • 0" + (st + 1) + "/05 • " + STEPS[st];
      for (i = 0; i < idx.length; i++) idx[i].className = i === st ? "on" : i < st ? "done" : "";
    }
    var deg = Math.round(((-s.yaw % 360) + 360) % 360);
    var o = (MOB ? "" : "Orbit ") + ("00" + deg).slice(-3) + "° • Floors 0" + F;
    if (o !== lastOrbit) { lastOrbit = o; hudOrbit.textContent = o; }

    /* Interrogate: impact against effort, then the top three */
    panel(mx, ss(2.4, 2.7, u) * (1 - ss(3.4, 3.65, u)));
    for (i = 0; i < mxB.length; i++) {
      var bt = ss(2.5 + i * 0.04, 2.7 + i * 0.04, u);
      mxB[i].style.opacity = bt.toFixed(3); mxB[i].style.transform = "scale(" + bt.toFixed(3) + ")";
    }
    for (i = 0; i < mxL.length; i++) {
      var lt = ss(2.68 + i * 0.06, 2.88 + i * 0.06, u);
      mxL[i].style.opacity = lt.toFixed(3); mxL[i].style.transform = "translateX(" + ((1 - lt) * 16).toFixed(1) + "px)";
    }

    /* Cost: loss identified, then loss recovered, in time and money */
    var cq = cost(u), idf = cq.idf, rcv = cq.rcv;
    panel(cs, cq.a);
    csBars.ti.style.transform = "scaleX(" + idf.toFixed(3) + ")"; csBars.mi.style.transform = "scaleX(" + idf.toFixed(3) + ")";
    csBars.tr.style.transform = "scaleX(" + (0.8 * rcv).toFixed(3) + ")"; csBars.mr.style.transform = "scaleX(" + (0.8 * rcv).toFixed(3) + ")";
    setIf(csNum.ti, "t", Math.round(40 * idf) + " hrs a week");
    setIf(csNum.tr, "t", Math.round(32 * rcv) + " hrs a week");
    setIf(csNum.mi, "t", money(52000 * idf) + " a year");
    setIf(csNum.mr, "t", money(41600 * rcv) + " a year");
    cs.classList.toggle("won", rcv > 0.5);
  }
  function stepOf(u) { return clamp(Math.floor(u + 0.5), 0, 4); }

