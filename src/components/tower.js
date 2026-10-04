  /* ---------- CSS 3D tower in the call section: eight floors, four corner columns ---------- */
  var cube = $("#cube"), html = "";
  for (var ci = 0; ci < 8; ci++) html += '<i style="transform:translateY(' + ((ci - 3.5) * 22).toFixed(1) + 'px) rotateX(90deg)"></i>';
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { html += '<b style="transform:translate3d(' + (c[0] * 75) + 'px,0,' + (c[1] * 75) + 'px)"></b>'; });
  cube.innerHTML = html;

