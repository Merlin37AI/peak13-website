  /* ---------- tiny projector ---------- */
  function Camera(yaw, pitch, dist, f, ox, oy) {
    this.cy = Math.cos(yaw * D2R); this.sy = Math.sin(yaw * D2R);
    this.cp = Math.cos(pitch * D2R); this.sp = Math.sin(pitch * D2R);
    this.d = dist; this.f = f; this.ox = ox; this.oy = oy;
  }
  Camera.prototype.rot = function (x, y, z) {
    var x1 = x * this.cy + z * this.sy, z1 = -x * this.sy + z * this.cy;
    return [x1, y * this.cp + z1 * this.sp, -y * this.sp + z1 * this.cp];
  };
  Camera.prototype.cam = function (x, y, z) { var r = this.rot(x, y, z); r[2] += this.d; return r; };
  Camera.prototype.scr = function (p) { return [this.ox + this.f * p[0] / p[2], this.oy - this.f * p[1] / p[2]]; };
  Camera.prototype.pt = function (x, y, z) { return this.scr(this.cam(x, y, z)); };

  var FACES = [[1, 5, 7, 3, 1, 0, 0], [4, 0, 2, 6, -1, 0, 0], [2, 3, 7, 6, 0, 1, 0], [4, 5, 1, 0, 0, -1, 0], [5, 4, 6, 7, 0, 0, 1], [0, 1, 3, 2, 0, 0, -1]];
  var LIGHT = (function () { var l = [-0.5, 0.8, -0.45], m = Math.hypot(l[0], l[1], l[2]); return [l[0] / m, l[1] / m, l[2] / m]; })();

  function drawBox(ctx, cam, b, st, lw) {
    var c = [], s = [], i;
    for (i = 0; i < 8; i++) {
      var p = cam.cam(b.x + (i & 1 ? b.hx : -b.hx), b.y + (i & 2 ? b.hy : -b.hy), b.z + (i & 4 ? b.hz : -b.hz));
      c.push(p); s.push(cam.scr(p));
    }
    for (var f = 0; f < 6; f++) {
      var Fc = FACES[f];
      var n = cam.rot(Fc[4], Fc[5], Fc[6]);
      var a = c[Fc[0]], b2 = c[Fc[2]];
      var mx = (a[0] + b2[0]) / 2, my = (a[1] + b2[1]) / 2, mz = (a[2] + b2[2]) / 2;
      if (n[0] * mx + n[1] * my + n[2] * mz >= 0) continue;
      var lit = 0.55 + 0.45 * Math.max(0, Fc[4] * LIGHT[0] + Fc[5] * LIGHT[1] + Fc[6] * LIGHT[2]);
      ctx.beginPath();
      ctx.moveTo(s[Fc[0]][0], s[Fc[0]][1]);
      ctx.lineTo(s[Fc[1]][0], s[Fc[1]][1]);
      ctx.lineTo(s[Fc[2]][0], s[Fc[2]][1]);
      ctx.lineTo(s[Fc[3]][0], s[Fc[3]][1]);
      ctx.closePath();
      var fa = (Fc[5] !== 0 ? st.fa * 2.2 : st.fa) * lit;
      if (fa > 0.002) {
        if (st.grad) { ctx.globalAlpha = Math.min(1, fa); ctx.fillStyle = st.grad; ctx.fill(); ctx.globalAlpha = 1; }
        else { ctx.fillStyle = "rgba(" + st.fc + "," + fa.toFixed(3) + ")"; ctx.fill(); }
      }
      if (st.sa > 0.004) { ctx.lineWidth = lw; ctx.strokeStyle = "rgba(" + st.sc + "," + (st.sa * (0.6 + 0.4 * lit)).toFixed(3) + ")"; ctx.stroke(); }
    }
  }

  function mixRGB(a, b, t) { return Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," + Math.round(lerp(a[2], b[2], t)); }
  var GLASS = [206, 228, 218], EDGE = [222, 240, 232], EM = [31, 209, 138], EM2 = [120, 250, 190], RED = [255, 106, 95];

  function pitchOf(s) { return lerp(0.345, 0.405, s.open); }
  function floorY(i, s) { return (i - (F - 1) / 2) * pitchOf(s); }
  function stopPos(i, k, s) {
    var dir = i % 2 ? -1 : 1;
    return [dir * SX[k] + 0.1 * Math.sin(i * 1.7 + k * 2.1), floorY(i, s) - FHY + 0.03, SZ[k] + 0.09 * Math.cos(i * 2.3 + k)];
  }
  /* one job's route: in at the door, across every floor, up the core */
  function route(s) {
    var pts = [[0, floorY(0, s) - FHY + 0.03, BD + 0.06]], stops = [], i, k, y;
    for (i = 0; i < F; i++) {
      for (k = 0; k < 3; k++) { pts.push(stopPos(i, k, s)); stops.push({ i: i, k: k, idx: pts.length - 1 }); }
      if (i < F - 1) {
        y = floorY(i, s) - FHY + 0.03;
        pts.push([CORE[0], y, CORE[1]]);
        pts.push([CORE[0], floorY(i + 1, s) - FHY + 0.03, CORE[1]]);
      }
    }
    var cum = [0];
    for (i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
    return { pts: pts, stops: stops, cum: cum, len: cum[cum.length - 1] };
  }
  function sheen(ctx, bb, a, b, c) {
    var g = ctx.createLinearGradient(bb[0], bb[1], bb[2], bb[3]);
    g.addColorStop(0, "rgb(" + a + ")"); g.addColorStop(0.5, "rgb(" + b + ")"); g.addColorStop(1, "rgb(" + c + ")");
    return g;
  }
  function bbox(cam, s) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, th = F * pitchOf(s) / 2;
    for (var i = 0; i < 8; i++) {
      var p = cam.pt(i & 1 ? BW : -BW, i & 2 ? th : -th, i & 4 ? BD : -BD);
      x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
    }
    return [x0, y0, x1, y1];
  }
  function faceVis(cam, nx, nz, x, y, z) {
    var n = cam.rot(nx, 0, nz), p = cam.cam(x, y, z);
    return n[0] * p[0] + n[1] * p[1] + n[2] * p[2] < 0;
  }
  function fillQuad(ctx, a, b, c, d) {
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
  }
  /* window strips on whichever walls face the camera */
  function windows(ctx, cam, b, alpha, idx, rgb) {
    var faces = [[0, 1], [0, -1], [1, 0], [-1, 0]], fi, k;
    for (fi = 0; fi < 4; fi++) {
      var nx = faces[fi][0], nz = faces[fi][1], px = b.x + nx * b.hx, pz = b.z + nz * b.hz;
      if (!faceVis(cam, nx, nz, px, b.y, pz)) continue;
      var alongX = nz !== 0, span = alongX ? b.hx : b.hz, nW = alongX ? 6 : 4;
      var ww = (2 * span - 0.16) / nW, y0 = b.y - b.hy * 0.55, y1 = b.y + b.hy * 0.55;
      for (k = 0; k < nW; k++) {
        var c0 = -span + 0.08 + k * ww + ww * 0.14, c1 = c0 + ww * 0.72, A, B, C, D;
        if (alongX) { A = cam.pt(b.x + c0, y0, pz); B = cam.pt(b.x + c1, y0, pz); C = cam.pt(b.x + c1, y1, pz); D = cam.pt(b.x + c0, y1, pz); }
        else { A = cam.pt(px, y0, b.z + c0); B = cam.pt(px, y0, b.z + c1); C = cam.pt(px, y1, b.z + c1); D = cam.pt(px, y1, b.z + c0); }
        var r = 0.5 + 0.5 * Math.sin(idx * 12.9 + k * 7.3 + fi * 3.1);
        ctx.fillStyle = "rgba(" + (rgb || "214,236,226") + "," + (alpha * (0.06 + 0.12 * r * r)).toFixed(3) + ")";
        fillQuad(ctx, A, B, C, D);
      }
    }
  }

