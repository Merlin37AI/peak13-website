  /* ---------- calculator (starts empty) ---------- */
  var inH = $("#inHours"), inR = $("#inRate"), out = $("#outVal");
  function calc() {
    var hv = parseFloat(inH.value), rv = parseFloat(inR.value);
    if (inH.value === "" || inR.value === "" || !(hv > 0) || !(rv > 0)) { out.className = "empty"; out.textContent = "Add both figures"; return; }
    out.className = ""; out.textContent = "£" + Math.round(hv * rv * 52).toLocaleString("en-GB");
  }
  inH.addEventListener("input", calc); inR.addEventListener("input", calc);

