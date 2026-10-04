  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var D2R = Math.PI / 180;
  /* The building: one floor per department. Scroll walks it through the five STOIC steps. */
  var F = 7, BW = 0.85, BD = 0.6, FHY = 0.17;
  var EM_S = "31,209,138", RED_S = "255,106,95";
  var FLOORS = [
    { n: "Reception & enquiries", s: "Enquiries", f: "Re-keyed by hand", fs: "Re-keyed", rank: 3 },
    { n: "Lettings", s: "Lettings", f: "Viewings by phone tag", fs: "Phone tag", rank: 0 },
    { n: "Property management", s: "Managing" },
    { n: "Maintenance", s: "Repairs", f: "Waiting on approval", fs: "Waiting", rank: 1 },
    { n: "Accounts & rent", s: "Rent", f: "Arrears chased by hand", fs: "Chasing", rank: 2 },
    { n: "Compliance", s: "Compliance" },
    { n: "Landlord reporting", s: "Reports", f: "Rebuilt every month", fs: "Rebuilt", rank: 0 }
  ];
  var SX = [-0.5, 0.02, 0.48], SZ = [0.2, -0.15, 0.18], CORE = [0.66, -0.38];
  function $(s) { return document.querySelector(s); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ss(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function key(u, k) {
    if (u <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) {
      if (u <= k[i][0]) return lerp(k[i - 1][1], k[i][1], ss(k[i - 1][0], k[i][0], u));
    }
    return k[k.length - 1][1];
  }

  /* loss then recovery; on phones the card scrolls over the panel after u=4, so it all lands by then */
  function cost(u) {
    return MOB ? { a: ss(3.35, 3.6, u), idf: ss(3.4, 3.72, u), rcv: ss(3.74, 4.0, u) } : { a: ss(3.6, 3.9, u), idf: ss(3.64, 4.0, u), rcv: ss(4.02, 4.4, u) };
  }
