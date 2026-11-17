  /* ---------- scene timeline, u = chapter position (0..4 = card resting) ---------- */
  function state(u) {
    var s = {};
    s.yaw = key(u, [[-0.3, 0], [0.45, -34], [1.3, -48], [2.3, -30], [3.4, -22], [4.4, -36]]);
    s.pitch = key(u, [[-0.3, 3], [0.45, 14], [1.3, 24], [2.3, 22], [3.4, 15], [4.4, 14]]);
    s.open = ss(-0.1, 0.5, u);
    s.trace = ss(0.5, 1.4, u);
    /* camera direction: arrive wide, push in and climb with the job on Trace, pull back for the ranking, push in again for the money */
    s.dist = key(u, [[-0.3, 8.8], [0.4, 7.6], [0.95, 6.3], [1.4, 6.3], [1.9, 7.9], [2.9, 8.2], [3.6, 7.6], [4.3, 6.7]]);
    s.ty = ss(0.55, 0.9, u) * (1 - ss(1.4, 1.8, u)) * (s.trace - 0.5) * (F - 1) * 0.405 * 0.6 - 0.15 * ss(3.6, 4.3, u);
    s.ghost = ss(1.55, 1.95, u);
    s.dim = ss(2.55, 2.9, u);
    var cc = cost(u);
    s.rec = cc.rcv;
    s.lab = ss(-0.15, 0.2, u) * (1 - ss(2.45, 2.75, u));
    s.tok = ss(0, 0.2, cc.a);
    return s;
  }

