  /* ---------- the method scene as one working week: 5 days x 3 people x 8 hours = 120 hour blocks.
     Example figures, the same sums as the cost panel (hours x £25 x 52). Drawn only when WEEK is true (core.js). ---------- */
  var WK = (function () {
    var jobs = [], kind = [], seed = 7, i, j;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (i = 0; i < F; i++) if (FLOORS[i].f) jobs.push({ fl: FLOORS[i], n: Math.round(FLOORS[i].v / 1300), cells: [] });
    jobs.sort(function (a, b) { return (a.fl.rank || 9) - (b.fl.rank || 9); });
    for (i = 0; i < 120; i++) kind.push(-1);
    for (j = 0; j < jobs.length; j++) {
      while (jobs[j].cells.length < jobs[j].n) {
        var c = Math.floor(rnd() * 15), r = Math.floor(rnd() * 8), run = 1 + Math.floor(rnd() * 3);
        for (; run > 0 && r < 8 && jobs[j].cells.length < jobs[j].n; run--, r++) if (kind[c * 8 + r] < 0) { kind[c * 8 + r] = j; jobs[j].cells.push(c * 8 + r); }
      }
      jobs[j].cells.sort(function (a, b) { return a - b; });
    }
    return { jobs: jobs, kind: kind };
  })();
  var WDAYS = ["MON", "TUE", "WED", "THU", "FRI"];

  function renderWeek(u, time, s) {
    var w = cv.width, h = cv.height, i, j, k;
    ctx.clearRect(0, 0, w, h);
    var cq = cost(u), D = 1 - 0.72 * s.dim * (1 - 0.6 * cq.rcv);
    var cell = MOB ? Math.min(w * 0.86 / 17.4, h * 0.3 / 8) : Math.min(w * 0.34 / 17.4, h * 0.56 / 8) * lerp(1, 0.68, s.dim), gap = cell * 0.6, pad = cell * 0.1;
    var GW = 15 * cell + 4 * gap, GH = 8 * cell;
    var gx0 = MOB ? w * 0.5 - GW / 2 : lerp(w * 0.62 - GW / 2, w * 0.33 + 90 * DPR, s.dim), cx = gx0 + GW / 2, gy0 = MOB ? h * 0.1 : h * 0.5 - GH / 2;
    function inAt(idx) { var d = Math.floor(idx / 24) * 0.08; return ss(-0.6 + d, -0.2 + d, u); }   /* the week arrives a day at a time, before the Survey card settles */
    var scan = s.trace * (GW + cell), sweeping = s.trace > 0.001;
    function cellX(idx) { var c = Math.floor(idx / 8); return gx0 + c * cell + Math.floor(c / 3) * gap; }
    function cellY(idx) { return gy0 + (idx % 8) * cell; }
    function seen(idx) { return sweeping && cellX(idx) + cell / 2 - gx0 <= scan; }
    function block(x, y, rgb, a) { ctx.fillStyle = "rgba(" + rgb + "," + clamp(a, 0, 1).toFixed(3) + ")"; ctx.beginPath(); ctx.roundRect(x + pad, y + pad, cell - 2 * pad, cell - 2 * pad, cell * 0.16); ctx.fill(); }

    /* the ordinary hours: glass until the sweep reaches them, then a quiet green for work that flows */
    for (i = 0; i < 120; i++) {
      if (WK.kind[i] >= 0) continue;
      var a0 = inAt(i) * (1 - 0.8 * s.ghost) * D;
      if (a0 < 0.01) continue;
      if (seen(i)) block(cellX(i), cellY(i), EM_S, 0.2 * a0); else block(cellX(i), cellY(i), "214,236,226", 0.16 * a0);
    }

    /* day names and the example caption */
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = mono(MOB ? 9 : 10.5);
    var da = ss(-0.5, -0.1, u) * (1 - s.ghost) * D;
    if (da > 0.01) for (i = 0; i < 5; i++) {
      ctx.fillStyle = "rgba(226,238,232," + (0.8 * da).toFixed(3) + ")";
      ctx.fillText(WDAYS[i], gx0 + i * (3 * cell + gap) + 1.5 * cell, gy0 - 14 * DPR);
    }
    ctx.font = mono(MOB ? 8.5 : 9.5);
    ctx.fillStyle = "rgba(226,238,232," + (0.65 * da).toFixed(3) + ")";
    ctx.fillText("EXAMPLE WEEK • 3 PEOPLE • 120 HOURS", cx, gy0 + GH + 18 * DPR);
    ctx.fillStyle = "rgba(226,238,232," + (0.65 * s.ghost * D * (MOB ? 1 : 1 - s.dim)).toFixed(3) + ")";
    ctx.fillText("EXAMPLE • 40 HOURS A WEEK FOUND, RANKED", cx, gy0 + GH + 18 * DPR);

    /* the wasted hours: red where the sweep finds them, then pulled out of the week into ranked rows */
    for (j = 0; j < WK.jobs.length; j++) {
      var job = WK.jobs[j], fl = job.fl, kept = fl.rank > 0, n = job.n;
      var rowY = gy0 + j * (GH - cell) / 4, rcy = rowY + cell / 2;
      var jc = kept ? mixRGB(RED, EM, s.rec) : mixRGB(RED, [180, 190, 186], s.ghost), found = 0;
      for (k = 0; k < n; k++) {
        var idx = job.cells[k], e = ss(0, 1, clamp(s.ghost * 1.5 - (k / n) * 0.5, 0, 1));
        var x = lerp(cellX(idx), gx0 + 1.4 * cell + k * cell, e), y = lerp(cellY(idx), rowY, e);
        var ap = inAt(idx) * D;
        if (!seen(idx)) { block(x, y, "214,236,226", 0.16 * ap); continue; }
        found = Math.max(found, ss(0, cell * 2, scan - (cellX(idx) + cell / 2 - gx0)));
        if (kept) block(x, y, jc, 0.9 * ap);
        else {
          /* what we leave alone stays on the drawing as an outline */
          block(x, y, jc, 0.9 * ap * (1 - 0.85 * s.ghost));
          if (s.ghost > 0.01) { ctx.setLineDash([3 * DPR, 3 * DPR]); ctx.strokeStyle = "rgba(" + jc + "," + (0.7 * s.ghost * ap).toFixed(3) + ")"; ctx.lineWidth = DPR; ctx.strokeRect(x + pad, y + pad, cell - 2 * pad, cell - 2 * pad); ctx.setLineDash([]); }
        }
      }
      /* rank badge for the vital few */
      if (kept && s.ghost > 0.4) {
        var ba = ss(0.4, 0.8, s.ghost) * D, bx = gx0 + 0.55 * cell;
        ctx.fillStyle = "rgba(" + jc + "," + ba.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(bx, rcy, 9 * DPR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(10,15,13," + ba.toFixed(3) + ")"; ctx.font = mono(11); ctx.textAlign = "center"; ctx.fillText(String(fl.rank), bx, rcy + 0.5 * DPR);
      }
      /* the name of the waste and its hours */
      var la = (MOB ? s.ghost : Math.max(found, s.ghost) * (1 - s.dim)) * D * (kept ? 1 : 1 - 0.45 * s.ghost);
      if (la > 0.01) {
        ctx.textAlign = "left"; ctx.font = mono(MOB ? 9 : 10.5);
        var lx = MOB ? gx0 + 1.4 * cell + pad : gx0 + GW + 22 * DPR;
        ctx.fillStyle = "rgba(" + jc + "," + (0.95 * la).toFixed(3) + ")";
        if (MOB) ctx.fillText(fl.s.toUpperCase() + " • " + n + " HRS", lx, rowY + cell * 1.38);
        else {
          ctx.beginPath(); ctx.arc(lx - 8 * DPR, rcy, 2.4 * DPR, 0, Math.PI * 2); ctx.fill();
          ctx.fillText(fl.n.toUpperCase() + " • " + n + " HRS", lx, rcy - 7 * DPR);
          ctx.fillText(fl.f, lx, rcy + 7 * DPR);
        }
      }
      /* Cost: what each row is worth in a year, red while it is being lost, green once recovered */
      if (!MOB && cq.idf > 0.01) {
        var won = kept && cq.rcv > 0.5;
        ctx.textAlign = "right"; ctx.font = mono(12.5);
        ctx.fillStyle = "rgba(" + (won ? EM_S : kept ? RED_S : "180,190,186") + "," + cq.idf.toFixed(3) + ")";
        ctx.fillText((won ? "+" : "-") + money(fl.v * (won ? cq.rcv : cq.idf)), gx0 - 14 * DPR, rcy);
        if (j === 0) { ctx.font = mono(9); ctx.fillStyle = "rgba(226,238,232," + (0.6 * cq.idf).toFixed(3) + ")"; ctx.fillText("EXAMPLE, A YEAR", gx0 - 14 * DPR, rcy - 20 * DPR); }
      }
    }

    /* the sweep line */
    if (sweeping && s.trace < 0.999) {
      var sx = gx0 + scan;
      ctx.strokeStyle = "rgba(236,244,240," + (0.12 * D).toFixed(3) + ")"; ctx.lineWidth = 6 * DPR; ctx.beginPath(); ctx.moveTo(sx, gy0 - 6 * DPR); ctx.lineTo(sx, gy0 + GH + 6 * DPR); ctx.stroke();
      ctx.strokeStyle = "rgba(236,244,240," + (0.85 * D).toFixed(3) + ")"; ctx.lineWidth = 1.5 * DPR; ctx.beginPath(); ctx.moveTo(sx, gy0 - 6 * DPR); ctx.lineTo(sx, gy0 + GH + 6 * DPR); ctx.stroke();
    }
    ctx.textAlign = "left";
  }
