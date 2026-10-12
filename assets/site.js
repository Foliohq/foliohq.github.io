// ── Config ───────────────────────────────────────────────────────────────
// Leave empty until Folio is live on the Chrome Web Store. Paste the store
// listing URL here and every primary button switches in one place.
const STORE_URL = "";
// ─────────────────────────────────────────────────────────────────────────

(function () {
  "use strict";

  var EARLY_ACCESS_URL = "mailto:foliosupport.team@gmail.com?subject=Folio%20early%20access";
  var live = STORE_URL !== "";
  var ctaUrl = live ? STORE_URL : EARLY_ACCESS_URL;
  var ctaLabel = live ? "Add to Chrome, free" : "Get early access";

  // Primary buttons: label and link. Buttons with data-cta-link only take the link.
  document.querySelectorAll("[data-cta]").forEach(function (a) {
    a.href = ctaUrl;
    a.textContent = ctaLabel;
    if (live) { a.target = "_blank"; a.rel = "noopener"; }
  });
  document.querySelectorAll("[data-cta-link]").forEach(function (a) {
    a.href = ctaUrl;
    if (live) { a.target = "_blank"; a.rel = "noopener"; }
  });

  // Sticky nav: translucent blur once the page has scrolled.
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu.
  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("mobileMenu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menu.hidden;
      menu.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open && nav) nav.classList.add("scrolled");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
    });
  }

  // Pricing: Monthly / Yearly.
  var billing = document.querySelectorAll("[data-billing]");
  if (billing.length) {
    var setBilling = function (mode) {
      billing.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-billing") === mode)); });
      document.querySelectorAll("[data-show]").forEach(function (el) { el.hidden = el.getAttribute("data-show") !== mode; });
    };
    billing.forEach(function (b) { b.addEventListener("click", function () { setBilling(b.getAttribute("data-billing")); }); });
    setBilling("yearly");
  }

  // Gentle fade-up on scroll (skipped for reduced motion).
  var items = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
