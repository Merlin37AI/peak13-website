  /* ---------- the call section shows the same seven-floor building, finished: every floor lit, the three fixed floors green ---------- */
  var cvt = $("#tower"), ct = cvt.getContext("2d"), tIn = false;
  function renderT(time) {
    var r = cvt.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.75), w = Math.round(r.width * d), h = Math.round(r.height * d);
    if (cvt.width !== w || cvt.height !== h) { cvt.width = w; cvt.height = h; }
    ct.clearRect(0, 0, w, h);
    var s = { open: 1 }, cam = new Camera(RM ? -34 : -34 + time * 0.012, 16, 7.6, Math.min(h * 1.7, w * 1.5), w / 2, h * 0.46), lw = Math.max(1, d * 0.9), boxes = [];
    for (var i = 0; i < F; i++) boxes.push({ x: 0, y: floorY(i, s), z: 0, hx: BW, hy: FHY, hz: BD, v: i });
    boxes.forEach(function (b) { b.dz = cam.cam(b.x, b.y, b.z)[2]; });
    boxes.sort(function (a, b) { return b.dz - a.dz; });
    var g = sheen(ct, bbox(cam, s), "190,255,222", "52,222,150", "10,150,96");
    boxes.forEach(function (b) {
      var fixed = FLOORS[b.v].rank > 0;
      drawBox(ct, cam, b, { grad: g, fa: fixed ? 0.05 : 0.03, sc: (fixed ? EM2 : EDGE).join(","), sa: fixed ? 0.5 : 0.24 }, lw);
      windows(ct, cam, b, fixed ? 2.4 : 1.5, b.v, fixed ? EM_S : null, RM ? 0 : time);
    });
  }
  new IntersectionObserver(function (es) { tIn = es[0].isIntersecting; }).observe(cvt);
  (function loopT(t) { requestAnimationFrame(loopT); if (tIn) renderT(t || 0); })();
