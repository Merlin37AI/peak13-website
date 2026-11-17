  /* ---------- the call section shows the same example week, finished: the 32 recovered hours in green, the 8 left alone as outlines ---------- */
  var cvt = $("#tower"), ct = cvt.getContext("2d"), tIn = false;
  function renderT(time) {
    var r = cvt.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.75), w = Math.round(r.width * d), h = Math.round(r.height * d), i;
    if (cvt.width !== w || cvt.height !== h) { cvt.width = w; cvt.height = h; }
    ct.clearRect(0, 0, w, h);
    var cell = Math.min(w * 0.78 / 17.4, h * 0.56 / 8), gap = cell * 0.6, pad = cell * 0.1;
    var gx0 = w / 2 - (15 * cell + 4 * gap) / 2, gy0 = h * 0.47 - 4 * cell;
    ct.font = Math.round(10 * d) + "px 'Fragment Mono', monospace"; ct.textAlign = "center"; ct.textBaseline = "middle"; ct.fillStyle = "rgba(226,238,232,0.7)";
    for (i = 0; i < 5; i++) ct.fillText(WDAYS[i], gx0 + i * (3 * cell + gap) + 1.5 * cell, gy0 - 14 * d);
    for (i = 0; i < 120; i++) {
      var c = Math.floor(i / 8), x = gx0 + c * cell + Math.floor(c / 3) * gap + pad, y = gy0 + (i % 8) * cell + pad, sz = cell - 2 * pad, j = WK.kind[i];
      if (j >= 0 && !(WK.jobs[j].fl.rank > 0)) {
        ct.setLineDash([3 * d, 3 * d]); ct.strokeStyle = "rgba(180,190,186,0.6)"; ct.lineWidth = d; ct.strokeRect(x, y, sz, sz); ct.setLineDash([]);
        continue;
      }
      /* recovered hours glow, with a slow wave across the week; ordinary hours stay quiet */
      var a = j >= 0 ? 0.8 + (RM ? 0 : 0.15 * Math.sin(time * 0.0012 - c * 0.5)) : 0.2;
      ct.fillStyle = "rgba(" + EM_S + "," + a.toFixed(3) + ")"; ct.beginPath(); ct.roundRect(x, y, sz, sz, cell * 0.16); ct.fill();
    }
  }
  new IntersectionObserver(function (es) { tIn = es[0].isIntersecting; }).observe(cvt);
  (function loopT(t) { requestAnimationFrame(loopT); if (tIn) renderT(t || 0); })();
