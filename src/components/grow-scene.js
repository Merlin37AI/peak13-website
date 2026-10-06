  /* ---------- grow: one person, then a small business, then a large one; real people and AI employees side by side ---------- */
  var GICON = {
    person: "M12 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5",
    agent: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 1.5V4 M12 20v2.5 M1.5 12H4 M20 12h2.5",
    chat: "M4 5h16v11h-8.5L7 20v-4H4z",
    phone: "M8 3h8v18H8z M11 18h2",
    doc: "M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7",
    wrench: "M16 3.5l3.5 2v4L16 11.5l-3.5-2v-4z M13.5 10.5L4.5 19.5l2 2 9-9",
    pound: "M16.5 6.5C15.5 5 14 4.5 12.8 4.5 10.9 4.5 9.5 6 9.5 8v3.5 M7 11.5h7 M9.5 11.5V16c0 1.5-.6 2.8-2.2 3.5h11",
    shield: "M12 3l7 3v5.5c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5V6z M9 12l2.2 2.2L15 10.2",
    sheet: "M4 4h16v16H4z M4 10h16 M4 15h16 M10 4v16",
    mail: "M3 6h18v12H3z M3 7l9 6.5L21 7",
    calendar: "M4 6h16v14H4z M4 11h16 M9 3v5 M15 3v5"
  };
  var GICP = {};
  Object.keys(GICON).forEach(function (k) { GICP[k] = new Path2D(GICON[k]); });

  var GROLES = [
    { n: "Enquiries", s: "Enquiries", ic: "chat" },
    { n: "Sales & lettings", s: "Lettings", ic: "phone" },
    { n: "Admin", s: "Admin", ic: "doc" },
    { n: "Repairs", s: "Repairs", ic: "wrench" },
    { n: "Accounts", s: "Accounts", ic: "pound" },
    { n: "Compliance", s: "Rules", ic: "shield" },
    { n: "Reports", s: "Reports", ic: "sheet" }
  ];
  var GSTAFF = ["AAP", "PA", "PPA", "AAP", "AP", "PA", "AAP"];   /* P = real person, A = AI employee */
  var GS = [0.05, 0.45, 1.0, 1.3, 1.95, 2.2, 2.5];                /* when each floor starts to rise */
  var GGROUND = -1.25, GP = 0.4, GFH = 0.16;
  function gFloor(i, u) { return ss(GS[i], GS[i] + 0.3, u); }
  function gStaff(i, k, u) { return ss(GS[i] + 0.22 + k * 0.07, GS[i] + 0.4 + k * 0.07, u); }
  function gChip(i, u) { return ss(GS[i] + 0.2, GS[i] + 0.5, u); }
  function gY(i) { return GGROUND + (i + 0.5) * GP; }

  var cvg = $("#gr"), cg = cvg.getContext("2d");
  var lisG = document.querySelectorAll("#grow .chapter");
  var WG = 0, HG = 0, DG = 1, MOBG = false, liG0 = 0, LIHG = window.innerHeight, ANCHG = 0.5;
  function measureG() {
    var r = cvg.getBoundingClientRect();
    DG = Math.min(window.devicePixelRatio || 1, 1.75);
    WG = r.width; HG = r.height;
    cvg.width = Math.max(1, Math.round(WG * DG)); cvg.height = Math.max(1, Math.round(HG * DG));
    MOBG = WG < 700;
    var q = lisG[0].getBoundingClientRect();
    liG0 = q.top + window.scrollY; LIHG = q.height || window.innerHeight; ANCHG = MOBG ? 0.64 : 0.5;
  }
  function uG() { return (window.scrollY + window.innerHeight * ANCHG - (liG0 + LIHG * ANCHG)) / LIHG; }
  function gMono(px) { return Math.round(px * DG) + "px 'Fragment Mono', monospace"; }
  function gRGBA(c, a) { return "rgba(" + c + "," + clamp(a, 0, 1).toFixed(3) + ")"; }
  function gIcon(name, x, y, s, col, lw) {
    cg.save(); cg.translate(x - s / 2, y - s / 2); cg.scale(s / 24, s / 24);
    cg.lineWidth = lw || 1.7; cg.lineCap = "round"; cg.lineJoin = "round"; cg.strokeStyle = col; cg.stroke(GICP[name]); cg.restore();
  }
  function gPill(x, y, w, h, col, al, ic, label) {
    cg.beginPath(); cg.roundRect(x, y - h / 2, w, h, h / 2);
    cg.fillStyle = gRGBA(col, al * 0.12); cg.fill(); cg.strokeStyle = gRGBA(col, al * 0.8); cg.lineWidth = DG; cg.stroke();
    gIcon(ic, x + h * 0.55, y, h * 0.58, gRGBA(col, al));
    cg.font = gMono(MOBG ? 8.5 : 9.5); cg.fillStyle = gRGBA(col, al); cg.textAlign = "left"; cg.textBaseline = "middle";
    cg.fillText(label.toUpperCase(), x + h * 1.0 + 2 * DG, y + 0.5 * DG);
  }

  function renderG(u, time) {
    var w = cvg.width, h = cvg.height, D = DG, i, k;
    cg.clearRect(0, 0, w, h);
    var sway = RM ? 0 : Math.sin(time * 0.00032) * 2;
    var yaw = key(u, [[-0.3, -10], [0.5, -26], [1.5, -34], [3, -38]]) + sway, pitch = key(u, [[-0.3, 12], [3, 18]]), dist = key(u, [[0, 6.9], [2, 7.6], [3, 8.3]]);
    var f = MOBG ? w * 1.65 : Math.min(h * 1.6, w * 1.0);
    var c0 = new Camera(yaw, pitch, dist, f, 0, 0), gp = c0.pt(0, GGROUND, 0);
    var ox = MOBG ? w * 0.4 : w * 0.62, tY = h * (MOBG ? 0.52 : 0.86);
    var cam = new Camera(yaw, pitch, dist, f, ox, tY - gp[1]);
    var lw = Math.max(1, D * 0.9);

    /* ground: a pool of light and plus marks */
    var fc = cam.pt(0, GGROUND, 0), fr = cam.pt(1.8, GGROUND, 0), fz = cam.pt(0, GGROUND, 1.8);
    var rx = Math.max(Math.hypot(fr[0] - fc[0], fr[1] - fc[1]), Math.hypot(fz[0] - fc[0], fz[1] - fc[1])), ry = Math.max(Math.abs(fr[1] - fc[1]), Math.abs(fz[1] - fc[1]), rx * 0.08);
    cg.save(); cg.translate(fc[0], fc[1]); cg.scale(1, ry / rx);
    var gr = cg.createRadialGradient(0, 0, 0, 0, 0, rx * 1.3); gr.addColorStop(0, "rgba(206,228,218,0.12)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    cg.fillStyle = gr; cg.beginPath(); cg.arc(0, 0, rx * 1.3, 0, Math.PI * 2); cg.fill(); cg.restore();
    cg.strokeStyle = "rgba(222,240,232,0.22)"; cg.lineWidth = lw;
    for (var gx = -3; gx <= 3; gx += 1.5) for (var gz = -3; gz <= 3; gz += 1.5) {
      if (Math.abs(gx) < 1.6 && Math.abs(gz) < 1.6) continue;
      var pc = cam.cam(gx, GGROUND, gz); if (pc[2] < 1) continue;
      var q = cam.scr(pc), kk = 7 * D * (6 / pc[2]);
      cg.beginPath(); cg.moveTo(q[0] - kk, q[1]); cg.lineTo(q[0] + kk, q[1]); cg.moveTo(q[0], q[1] - kk); cg.lineTo(q[0], q[1] + kk); cg.stroke();
    }

    /* the desk it all starts on, then the floors */
    var boxes = [], r0 = gFloor(0, u);
    boxes.push({ x: 0, y: GGROUND + 0.05, z: 0, hx: 0.55, hy: 0.05, hz: 0.4, v: -1, a: 1 - r0 });
    for (i = 0; i < F; i++) {
      var r = gFloor(i, u);
      if (r > 0.01) boxes.push({ x: 0, y: gY(i) - (1 - r) * 0.3, z: 0, hx: BW, hy: GFH, hz: BD, v: i, a: r });
    }
    for (i = 0; i < boxes.length; i++) boxes[i].dz = cam.cam(boxes[i].x, boxes[i].y, boxes[i].z)[2];
    boxes.sort(function (a, b) { return b.dz - a.dz; });
    var bb = [1e9, 1e9, -1e9, -1e9];
    [[-BW, GGROUND], [BW, GGROUND], [-BW, GGROUND + F * GP], [BW, GGROUND + F * GP]].forEach(function (c) { var p = cam.pt(c[0], c[1], BD); bb[0] = Math.min(bb[0], p[0]); bb[1] = Math.min(bb[1], p[1]); bb[2] = Math.max(bb[2], p[0]); bb[3] = Math.max(bb[3], p[1]); });
    var gGlass = sheen(cg, bb, "244,250,247", "176,200,192", "112,140,132");
    for (i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      if (b.a < 0.01) continue;
      drawBox(cg, cam, b, { grad: gGlass, fa: 0.022 * b.a, sc: EDGE.join(","), sa: 0.2 * b.a }, lw);
      if (b.v >= 0) windows(cg, cam, b, b.a, b.v);
    }

    /* the staff: real people and AI employees */
    var real = 0, ai = 0, sz = (MOBG ? 13 : 17) * D;
    for (i = 0; i < F; i++) {
      var st = GSTAFF[i], n = st.length;
      for (k = 0; k < n; k++) {
        var sp = gStaff(i, k, u); if (sp < 0.01) continue;
        if (sp > 0.5) { if (st[k] === "P") real++; else ai++; }
        var p = cam.pt((k - (n - 1) / 2) * 0.46, gY(i) - GFH + 0.09, 0.14), s2 = sz * (0.4 + 0.6 * sp);
        if (st[k] === "P") {
          gIcon("person", p[0], p[1], s2, gRGBA("236,244,240", sp), 1.9);
        } else {
          cg.fillStyle = gRGBA(EM_S, sp * 0.18); cg.beginPath(); cg.arc(p[0], p[1], s2 * 0.78, 0, Math.PI * 2); cg.fill();
          cg.strokeStyle = gRGBA(EM_S, sp * 0.85); cg.lineWidth = lw; cg.beginPath(); cg.arc(p[0], p[1], s2 * 0.78, 0, Math.PI * 2); cg.stroke();
          gIcon("agent", p[0], p[1], s2 * 1.05, gRGBA("120,250,190", sp), 1.5);
        }
      }
    }

    /* the founder, and the seven jobs they are carrying */
    var fp0 = cam.pt(0, GGROUND + 0.16, 0), fp1 = cam.pt(MOBG ? -1.15 : -1.45, GGROUND + 0.16, 0.3), fp = [lerp(fp0[0], fp1[0], r0), lerp(fp0[1], fp1[1], r0)];
    var maxX = -1e9;
    [[BW, BD], [BW, -BD]].forEach(function (c) { [GGROUND, GGROUND + F * GP].forEach(function (yy) { maxX = Math.max(maxX, cam.pt(c[0], yy, c[1])[0]); }); });
    var lx0 = maxX + 24 * D, pw = (MOBG ? 76 : 126) * D, ph = (MOBG ? 18 : 22) * D, load = 0, m = [];
    for (i = 0; i < F; i++) { m[i] = gChip(i, u); load += 1 - m[i]; }
    var over = load / F, calm = 1 - over;
    for (i = 0; i < F; i++) {
      var B = [lx0, cam.pt(BW, gY(i), BD)[1]], A;
      if (MOBG) A = [lx0, h * 0.1 + i * 24 * D];
      else { var row = i < 4 ? 0 : 1, nr = row ? 3 : 4, j = row ? i - 4 : i; A = [ox - pw / 2 + (j - (nr - 1) / 2) * (pw + 16 * D) - 40 * D, h * (row ? 0.25 : 0.15)]; }
      var pos = [lerp(A[0], B[0], m[i]), lerp(A[1], B[1], m[i])], col = mixRGB(RED, EM, m[i]);
      if (m[i] < 0.98) {
        cg.setLineDash([3 * D, 4 * D]); cg.strokeStyle = gRGBA(RED_S, (1 - m[i]) * 0.5); cg.lineWidth = D;
        cg.beginPath(); cg.moveTo(fp[0], fp[1] - 12 * D); cg.lineTo(pos[0] + pw / 2, pos[1]); cg.stroke(); cg.setLineDash([]);
      } else {
        var eg = cam.pt(BW, gY(i), BD);
        cg.strokeStyle = gRGBA(EM_S, 0.3); cg.lineWidth = D; cg.beginPath(); cg.moveTo(eg[0] + 4 * D, eg[1]); cg.lineTo(pos[0] - 4 * D, pos[1]); cg.stroke();
      }
      gPill(pos[0], pos[1], pw, ph, col, 0.55 + 0.4 * m[i], GROLES[i].ic, MOBG ? GROLES[i].s : GROLES[i].n);
    }
    var fcol = mixRGB(RED, EM, calm), ring = RM ? 0.5 : 0.5 + 0.5 * Math.sin(time * 0.004);
    cg.strokeStyle = gRGBA(fcol, (0.5 - 0.25 * ring) * (0.4 + 0.6 * over)); cg.lineWidth = D;
    cg.beginPath(); cg.arc(fp[0], fp[1] - 8 * D, (22 + 7 * ring * over) * D, 0, Math.PI * 2); cg.stroke();
    gIcon("person", fp[0], fp[1] - 8 * D, 30 * D, gRGBA(fcol, 1), 1.9);
    cg.textAlign = "center"; cg.textBaseline = "middle"; cg.font = gMono(MOBG ? 9 : 10.5);
    var t1 = MOBG ? "1 PERSON, 7 JOBS" : "YOU: 1 PERSON, 7 JOBS", t2 = MOBG ? "YOU, LEADING" : "YOU, SETTING DIRECTION";
    var tx1 = clamp(fp[0], cg.measureText(t1).width / 2 + 10 * D, w - cg.measureText(t1).width / 2 - 10 * D), tx2 = clamp(fp[0], cg.measureText(t2).width / 2 + 10 * D, w - cg.measureText(t2).width / 2 - 10 * D);
    cg.fillStyle = gRGBA(RED_S, over > 0.5 ? 1 : 0); cg.fillText(t1, tx1, fp[1] + 24 * D);
    cg.fillStyle = gRGBA(EM_S, calm > 0.5 ? 1 : 0); cg.fillText(t2, tx2, fp[1] + 24 * D);

    /* the count: real people against AI employees */
    var lxx = MOBG ? 22 * D : w - 36 * D, ly = (MOBG ? 104 : 74) * D, al = ss(0.1, 0.5, u);
    cg.textAlign = MOBG ? "left" : "right"; cg.font = gMono(MOBG ? 10 : 11.5); cg.textBaseline = "middle";
    cg.fillStyle = gRGBA("236,244,240", al); cg.fillText("REAL PEOPLE  " + real, lxx, ly);
    cg.fillStyle = gRGBA("120,250,190", al); cg.fillText("AI EMPLOYEES  " + ai, lxx, ly + 20 * D);
    cg.textAlign = "left";
  }

  var gClip = $("#gClip"), gStep = $("#gStep"), gIdx = document.querySelectorAll("#gIdx b");
  var GN = ["The dream", "The odds", "You, doing everything", "A small business", "A growing business", "A large business"], GNN = ["The dream", "The odds", "One person", "Small business", "Growing business", "Large business"], gLast = -1;
  function hudG(u) {
    var st = clamp(Math.floor(u + 0.5), 0, 5), i;
    if (st !== gLast) {
      gLast = st;
      gClip.textContent = "Grow " + (st + 1) + ": " + GN[st];
      gStep.textContent = "GROW • 0" + (st + 1) + "/06 • " + GNN[st];
      for (i = 0; i < gIdx.length; i++) gIdx[i].className = i === st ? "on" : i < st ? "done" : "";
    }
  }
  /* the character sheet, the badge it shrinks into, and the odds */
  var shEl = $("#sheet"), bdEl = $("#badge"), odEl = $("#odds");
  var dotSets = [];
  odEl.querySelectorAll(".dots").forEach(function (box) {
    var h = "", n;
    for (n = 0; n < 100; n++) h += "<i></i>";
    box.innerHTML = h; dotSets.push({ els: box.children, last: [] });
  });
  function setDots(set, fn) {
    for (var i = 0; i < 100; i++) { var c = fn(i); if (set.last[i] !== c) { set.last[i] = c; set.els[i].className = c; } }
  }
  function panelsG(u) {
    var sa = ss(-0.5, -0.15, u) * (1 - ss(0.5, 0.85, u));
    setIf(shEl, "opacity", sa.toFixed(3)); setIf(shEl, "visibility", sa < 0.01 ? "hidden" : "visible");
    setIf(shEl, "translate", ((1 - ss(-0.5, -0.15, u)) * 28 - ss(0.5, 0.85, u) * 40).toFixed(1) + "px 0");
    setIf(shEl, "scale", (1 - 0.14 * ss(0.4, 0.85, u)).toFixed(3));
    shEl.classList.toggle("on", sa > 0.5);
    var ba = MOBG ? ss(1.55, 1.85, u) : ss(0.55, 0.9, u);
    setIf(bdEl, "opacity", ba.toFixed(3)); setIf(bdEl, "visibility", ba < 0.01 ? "hidden" : "visible");
    var oa = ss(0.55, 0.8, u) * (1 - ss(1.5, 1.8, u));
    setIf(odEl, "opacity", oa.toFixed(3)); setIf(odEl, "visibility", oa < 0.01 ? "hidden" : "visible");
    setIf(odEl, "translate", ((1 - ss(0.55, 0.8, u)) * 28).toFixed(1) + "px 0");
    var p0 = ss(0.6, 0.85, u), p1 = ss(0.7, 0.97, u), p2 = ss(0.78, 1.0, u);
    var c0 = Math.round(36 * p0), a1 = Math.round(100 * Math.min(1, p1 * 2)), r1 = Math.round(62 * clamp((p1 - 0.5) * 2, 0, 1)), c2 = Math.round(100 * p2);
    setDots(dotSets[0], function (i) { return i < c0 ? "on" : ""; });
    setDots(dotSets[1], function (i) { return i >= a1 ? "" : (i >= 38 && (i - 38) < r1 ? "bad" : "on"); });
    setDots(dotSets[2], function (i) { return i >= c2 ? "" : (i === 99 && c2 === 100 ? "emp pin" : i < 75 ? "solo" : "emp"); });
  }

  var curG = null, tgtG = 0, dirtyG = true, inViewG = false;
  new IntersectionObserver(function (es) { inViewG = es[0].isIntersecting; dirtyG = true; }, { rootMargin: "100px" }).observe($("#grow"));
  function frameG(t) {
    requestAnimationFrame(frameG);
    if (!inViewG) return;
    tgtG = uG();
    if (curG === null) curG = tgtG;
    var prev = curG;
    curG = RM ? tgtG : curG + (tgtG - curG) * 0.14;
    if (Math.abs(tgtG - curG) < 0.0004) curG = tgtG;
    if (!RM || curG !== prev || dirtyG) {
      var ig = ss(1.5, 1.95, curG);
      setIf(cvg, "opacity", ig.toFixed(3));
      if (ig > 0.01) renderG(curG - 2, t);
      hudG(curG); panelsG(curG); dirtyG = false;
    }
  }

