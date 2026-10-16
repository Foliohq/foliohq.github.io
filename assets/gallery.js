// Product tour: tabs, per-tab screen switcher, and the screenshot lightbox.
(function () {
  "use strict";

  // ── Tabs (WAI-ARIA tabs pattern: arrow keys, Home/End) ─────────────────
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs [role=tab]"));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
    if (tab.scrollIntoView && tab.parentNode.scrollWidth > tab.parentNode.clientWidth) {
      tab.parentNode.scrollTo({ left: tab.offsetLeft - 24, behavior: "smooth" });
    }
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  // Links elsewhere on the page that open a given tab.
  document.querySelectorAll("[data-open-tab]").forEach(function (a) {
    a.addEventListener("click", function () {
      var t = document.getElementById("tab-" + a.getAttribute("data-open-tab"));
      if (t) selectTab(t, false);
    });
  });

  // ── Screen switcher inside a panel ─────────────────────────────────────
  document.querySelectorAll(".panel").forEach(function (panel) {
    var shots = panel.querySelectorAll(".shots .shot");
    var subs = panel.querySelectorAll(".subtab");
    subs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-shot"));
        subs.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        shots.forEach(function (s, i) { s.classList.toggle("is-on", i === idx); s.tabIndex = i === idx ? 0 : -1; });
      });
    });
  });

  // ── Lightbox ───────────────────────────────────────────────────────────
  var lb = document.getElementById("lightbox");
  if (!lb) return;
  var img = document.getElementById("lbImg");
  var cap = document.getElementById("lbCap");
  var count = document.getElementById("lbCount");
  var zoomBtn = document.getElementById("lbZoom");
  var closeBtn = document.getElementById("lbClose");
  var prevBtn = document.getElementById("lbPrev");
  var nextBtn = document.getElementById("lbNext");
  var stage = document.getElementById("lbStage");

  // One list of unique screenshots, in page order.
  var items = [];
  var seen = {};
  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    var full = el.getAttribute("data-full");
    if (!seen[full]) { seen[full] = items.length; items.push({ full: full, title: el.getAttribute("data-title") || "", alt: (el.querySelector("img") || {}).alt || "" }); }
  });

  var index = 0;
  var opener = null;

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    img.src = it.full;
    img.alt = it.alt;
    cap.textContent = it.title;
    count.textContent = (index + 1) + " / " + items.length;
    setZoom(false);
  }
  function setZoom(on) {
    lb.classList.toggle("is-zoomed", on);
    zoomBtn.setAttribute("aria-pressed", String(on));
    zoomBtn.textContent = on ? "Fit to screen" : "Actual size";
    stage.scrollTop = 0; stage.scrollLeft = 0;
  }
  function open(full, from) {
    opener = from || null;
    lb.hidden = false;
    document.body.classList.add("lb-open");
    show(seen[full] || 0);
    closeBtn.focus();
  }
  function close() {
    lb.hidden = true;
    document.body.classList.remove("lb-open");
    img.removeAttribute("src");
    if (opener && document.contains(opener)) opener.focus();
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    el.addEventListener("click", function () { open(el.getAttribute("data-full"), el); });
  });
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () { show(index - 1); });
  nextBtn.addEventListener("click", function () { show(index + 1); });
  zoomBtn.addEventListener("click", function () { setZoom(!lb.classList.contains("is-zoomed")); });
  img.addEventListener("click", function () { setZoom(!lb.classList.contains("is-zoomed")); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target === stage) close(); });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    else if (e.key === "Home") { e.preventDefault(); show(0); }
    else if (e.key === "End") { e.preventDefault(); show(items.length - 1); }
    else if (e.key === "Tab") {
      // Keep focus inside the viewer.
      var f = [closeBtn, zoomBtn, prevBtn, nextBtn];
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
})();
