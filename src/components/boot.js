  function startPage() {
    var h1 = $("#h1"); h1.classList.add("in");
  }

  measure(); onScroll(); requestAnimationFrame(frame);
  measureG(); requestAnimationFrame(frameG);

  startPage();
