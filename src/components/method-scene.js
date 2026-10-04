  /* ---------- main scene ---------- */
  var cv = $("#block"), ctx = cv.getContext("2d");
  var CW = 0, CH = 0, DPR = 1, MOB = false;
  function sizeCanvas() {
    var r = cv.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    CW = r.width; CH = r.height;
    cv.width = Math.max(1, Math.round(CW * DPR)); cv.height = Math.max(1, Math.round(CH * DPR));
    MOB = CW < 700;
  }
  function mono(px) { return Math.round(px * DPR) + "px 'Fragment Mono', monospace"; }

  function render(u, time) {
    var s = state(u), i, k;
    var sway = RM ? 0 : Math.sin(time * 0.00032) * 2.4;
    var w = cv.width, h = cv.height;
    var f = MOB ? w * 1.45 : Math.min(h * 1.62, w * 0.95);
    var ox = MOB ? w * 0.34 : w * 0.62, oy = MOB ? h * 0.34 : h * lerp(0.34, 0.5, ss(-0.4, 0, u));
    var cam = new Camera(s.yaw + sway, s.pitch, s.dist, f, ox, oy);
    var lw = Math.max(1, DPR * 0.9);
    var D = 1 - 0.72 * s.dim;
    var rt = route(s), dHead = s.trace * rt.len;
    ctx.clearRect(0, 0, w, h);

    /* ground: soft pool of light + plus marks on the ground grid */
    var gy = -F * pitchOf(s) / 2 - 0.04;
    var fc = cam.pt(0, gy, 0), fr = cam.pt(1.8, gy, 0), fz = cam.pt(0, gy, 1.8);
    var rx = Math.max(Math.hypot(fr[0] - fc[0], fr[1] - fc[1]), Math.hypot(fz[0] - fc[0], fz[1] - fc[1]));
    var ry = Math.max(Math.abs(fr[1] - fc[1]), Math.abs(fz[1] - fc[1]), rx * 0.08);
    ctx.save(); ctx.translate(fc[0], fc[1]); ctx.scale(1, ry / rx);
    var gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 1.3);
    gr.addColorStop(0, "rgba(" + mixRGB(GLASS, EM, s.ghost) + "," + (0.10 * D + 0.04 * s.ghost) + ")");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, rx * 1.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = "rgba(222,240,232," + (0.26 * D).toFixed(3) + ")"; ctx.lineWidth = lw;
    for (var gx = -3; gx <= 3; gx += 1.5) for (var gz = -3; gz <= 3; gz += 1.5) {
      if (Math.abs(gx) < 1.6 && Math.abs(gz) < 1.6) continue;
      var pc = cam.cam(gx, gy, gz); if (pc[2] < 1) continue;
      var q = cam.scr(pc), kk = 7 * DPR * (6 / pc[2]);
      ctx.beginPath(); ctx.moveTo(q[0] - kk, q[1]); ctx.lineTo(q[0] + kk, q[1]); ctx.moveTo(q[0], q[1] - kk); ctx.lineTo(q[0], q[1] + kk); ctx.stroke();
    }

    /* floors + the lift core, back to front */
    var th = F * pitchOf(s) / 2, boxes = [];
    for (i = 0; i < F; i++) boxes.push({ x: 0, y: floorY(i, s), z: 0, hx: BW, hy: FHY, hz: BD, v: i });
    boxes.push({ x: CORE[0], y: 0, z: CORE[1], hx: 0.09, hy: th - 0.02, hz: 0.09, v: -1 });
    boxes.push({ x: 0, y: th + 0.03, z: 0, hx: BW + 0.04, hy: 0.025, hz: BD + 0.04, v: -2 });
    for (i = 0; i < boxes.length; i++) boxes[i].dz = cam.cam(boxes[i].x, boxes[i].y, boxes[i].z)[2];
    boxes.sort(function (a, b) { return b.dz - a.dz; });
    var bb = bbox(cam, s);
    var gGlass = sheen(ctx, bb, "244,250,247", "176,200,192", "112,140,132");
    var gVital = sheen(ctx, bb, mixRGB([244, 250, 247], [190, 255, 222], s.ghost), mixRGB([176, 200, 192], [52, 222, 150], s.ghost), mixRGB([112, 140, 132], [10, 150, 96], s.ghost));
    var outlined = [];
    for (i = 0; i < boxes.length; i++) {
      var b = boxes[i], keep = b.v < 0 || FLOORS[b.v].rank > 0, fade = keep ? 1 : 1 - s.ghost;
      var st = keep && b.v >= 0 && s.ghost > 0
        ? { grad: gVital, fa: lerp(0.02, 0.034, s.ghost) * D, sc: mixRGB(EDGE, EM2, s.ghost), sa: lerp(0.17, 0.4, s.ghost) * D }
        : { grad: gGlass, fa: (b.v < 0 ? 0.05 : 0.02) * fade * D, sc: EDGE.join(","), sa: (b.v < 0 ? 0.3 : 0.17) * fade * D };
      if (fade > 0.01 || keep) drawBox(ctx, cam, b, st, lw);
      if (b.v >= 0 && fade > 0.01) windows(ctx, cam, b, fade * D, b.v);
      if (!keep && s.ghost > 0.01) outlined.push(b);
    }
    /* what we leave alone stays on the drawing as a dashed outline */
    if (outlined.length) {
      ctx.setLineDash([4 * DPR, 5 * DPR]);
      for (i = 0; i < outlined.length; i++) drawBox(ctx, cam, outlined[i], { fa: 0, sc: EDGE.join(","), sa: 0.5 * s.ghost * D }, lw);
      ctx.setLineDash([]);
    }

    /* Trace: one job's track through every department */
    var ta = s.trace > 0.001 ? (1 - 0.55 * s.ghost) * D : 0;
    if (ta > 0.01) {
      var pts = [], j;
      for (j = 0; j < rt.pts.length; j++) {
        if (rt.cum[j] <= dHead) pts.push(cam.pt(rt.pts[j][0], rt.pts[j][1], rt.pts[j][2]));
        else {
          var tt = (dHead - rt.cum[j - 1]) / (rt.cum[j] - rt.cum[j - 1]), A = rt.pts[j - 1], B = rt.pts[j];
          pts.push(cam.pt(lerp(A[0], B[0], tt), lerp(A[1], B[1], tt), lerp(A[2], B[2], tt)));
          break;
        }
      }
      [[6 * DPR, "rgba(236,244,240," + (0.1 * ta).toFixed(3) + ")"], [1.5 * DPR, "rgba(236,244,240," + (0.85 * ta).toFixed(3) + ")"]].forEach(function (L) {
        ctx.lineWidth = L[0]; ctx.strokeStyle = L[1]; ctx.lineJoin = "round"; ctx.beginPath();
        for (var m = 0; m < pts.length; m++) { if (m) ctx.lineTo(pts[m][0], pts[m][1]); else ctx.moveTo(pts[m][0], pts[m][1]); }
        ctx.stroke();
      });
      if (s.trace < 0.999 && pts.length) {
        var hp = pts[pts.length - 1];
        ctx.fillStyle = "rgba(255,255,255," + (0.95 * ta).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(hp[0], hp[1], 3.2 * DPR, 0, Math.PI * 2); ctx.fill();
      }
    }

    /* stops: green where work flows, red where waste is flagged */
    var marks = [], vis = [];
    for (i = 0; i < rt.stops.length; i++) {
      var sp = rt.stops[i], fl = FLOORS[sp.i], flagged = !!fl.f && sp.k === 1;
      var visited = s.trace > 0.001 && rt.cum[sp.idx] <= dHead;
      var P = rt.pts[sp.idx], p2 = cam.pt(P[0], P[1], P[2]);
      if (flagged) marks.push({ x: p2[0], y: p2[1], i: sp.i, visited: visited });
      if (sp.k === 1) vis[sp.i] = visited;
      var setAside = flagged && fl.rank === 0 && s.ghost > 0;
      var base = (sp.k === 1 ? 5 : 3.5) * DPR, ma = (setAside ? 1 - 0.55 * s.ghost : 1) * D;
      if (!visited) {
        ctx.strokeStyle = "rgba(226,238,232," + (0.3 * ma * (s.trace > 0.001 ? 1 : s.lab)).toFixed(3) + ")"; ctx.lineWidth = lw;
        ctx.strokeRect(p2[0] - base * 0.7, p2[1] - base * 0.7, base * 1.4, base * 1.4);
        continue;
      }
      var col = !flagged ? EM_S : setAside ? "180,190,186" : mixRGB(RED, EM, fl.rank > 0 ? s.rec : 0);
      ctx.fillStyle = "rgba(" + col + "," + (0.95 * ma).toFixed(3) + ")";
      ctx.fillRect(p2[0] - base, p2[1] - base, base * 2, base * 2);
      if (flagged && !setAside) {
        var ph = RM ? 0.5 : 0.5 + 0.5 * Math.sin(time * 0.004 + sp.i), rr = (8 + 6 * ph) * DPR;
        ctx.strokeStyle = "rgba(" + col + "," + ((0.55 - 0.3 * ph) * ma).toFixed(3) + ")"; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.arc(p2[0], p2[1], rr, 0, Math.PI * 2); ctx.stroke();
        if (s.ghost > 0.4) {
          var bx = p2[0] + 17 * DPR, by = p2[1] - 15 * DPR, ba = ss(0.4, 0.8, s.ghost) * D;
          ctx.fillStyle = "rgba(" + col + "," + ba.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(bx, by, 9 * DPR, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(10,15,13," + ba.toFixed(3) + ")"; ctx.font = mono(11); ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(fl.rank), bx, by + 0.5 * DPR); ctx.textAlign = "left";
        }
      }
    }

    /* labels: one per floor, on the right of the building */
    if (s.lab > 0.01) {
      var edge = [], maxX = -1e9;
      for (i = 0; i < F; i++) {
        var yc = floorY(i, s), best = null;
        [[BW, BD], [BW, -BD], [-BW, BD], [-BW, -BD]].forEach(function (c) { var p = cam.pt(c[0], yc, c[1]); if (!best || p[0] > best[0]) best = p; });
        edge.push(best); maxX = Math.max(maxX, best[0]);
      }
      var lx0 = maxX + 22 * DPR;
      for (i = 0; i < F; i++) {
        var fl2 = FLOORS[i], red = !!fl2.f && vis[i], green = !fl2.f && vis[i];
        var la = s.lab * (fl2.rank > 0 || !fl2.f ? 1 : 1 - 0.6 * s.ghost);
        if (s.ghost > 0 && !fl2.rank) la *= 1 - 0.5 * s.ghost;
        var tint = red ? RED_S : green ? EM_S : "226,238,232";
        ctx.strokeStyle = "rgba(" + tint + "," + (0.3 * la).toFixed(3) + ")"; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(edge[i][0] + 4 * DPR, edge[i][1]); ctx.lineTo(lx0 - 6 * DPR, edge[i][1]); ctx.stroke();
        ctx.fillStyle = "rgba(" + tint + "," + (0.95 * la).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(lx0 - 6 * DPR, edge[i][1], 2.4 * DPR, 0, Math.PI * 2); ctx.fill();
        ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.font = mono(MOB ? 9.5 : 10.5);
        if (MOB) {
          ctx.fillText((red ? fl2.fs : fl2.s).toUpperCase(), lx0, edge[i][1]);
        } else if (red) {
          ctx.fillText(fl2.n.toUpperCase(), lx0, edge[i][1] - 7 * DPR);
          ctx.fillStyle = "rgba(" + RED_S + "," + (0.95 * la).toFixed(3) + ")";
          ctx.fillText(fl2.f, lx0, edge[i][1] + 7 * DPR);
        } else {
          ctx.fillText(fl2.n.toUpperCase(), lx0, edge[i][1]);
        }
      }
    }

    /* Cost: £ tokens leave the red marks (loss identified), then come back green (loss recovered) */
    if (!RM && s.tok > 0.01) {
      var cq = cost(u), idf = cq.idf, rcv = cq.rcv, tx = MOB ? w * 0.5 : w * 0.8, ty = MOB ? h * 0.2 : h * 0.5;
      var back = rcv > 0.02, srcs = marks.filter(function (m) { return back ? FLOORS[m.i].rank > 0 : true; });
      if (srcs.length) for (k = 0; k < 9; k++) {
        var e = (time * 0.00032 + k / 9) % 1, sm = srcs[k % srcs.length];
        var px = back ? lerp(tx, sm.x, e) : lerp(sm.x, tx, e), py = back ? lerp(ty, sm.y, e) : lerp(sm.y, ty, e);
        var al = Math.sin(Math.PI * e) * (back ? Math.min(1, rcv * 3) : idf) * s.tok, tc = back ? EM_S : RED_S;
        ctx.strokeStyle = "rgba(" + tc + "," + (0.9 * al).toFixed(3) + ")"; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.arc(px, py, 9 * DPR, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(" + tc + "," + (0.12 * al).toFixed(3) + ")"; ctx.fill();
        ctx.fillStyle = "rgba(" + tc + "," + al.toFixed(3) + ")"; ctx.font = "400 " + Math.round(12 * DPR) + "px 'Host Grotesk', sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("£", px, py + 0.5 * DPR); ctx.textAlign = "left";
      }
    }
    return s;
  }

