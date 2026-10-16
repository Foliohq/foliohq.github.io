// ── Config ───────────────────────────────────────────────────────────────
// Chrome Web Store listing URL. Every primary button uses it. Leave empty to fall back to early access.
const STORE_URL = "https://chromewebstore.google.com/detail/ikcoodldjhpklnhbcfnecjpakoodkipl";
// ─────────────────────────────────────────────────────────────────────────

(function () {
  "use strict";

  var EARLY_ACCESS_URL = "mailto:support@kepful.app?subject=Kepful%20early%20access";
  var live = STORE_URL !== "";
  var ctaUrl = live ? STORE_URL : EARLY_ACCESS_URL;
  var ctaLabel = live ? "Add to Chrome" : "Get early access";

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

  // Public Supabase endpoint + publishable key (safe to publish: it can only call
  // the functions and tables made public on purpose).
  var SUPABASE_URL = "https://ddogtxwckmgdvsdmuntt.supabase.co";
  var SUPABASE_KEY = "sb_publishable_ilY6aJMw9kc5eXYpzglwQg_NEYarv1K";

  // "Get Pro": explains that checkout starts inside the extension, so the
  // purchase is linked to the right account.
  var getPro = document.getElementById("getPro");
  var proSteps = document.getElementById("proSteps");
  if (getPro && proSteps) {
    getPro.addEventListener("click", function () {
      var open = proSteps.hidden;
      proSteps.hidden = !open;
      getPro.setAttribute("aria-expanded", String(open));
    });
  }

  // Founding offer: how many of the 50 places are left. Falls back to a plain
  // "Limited founding offer" if the number cannot be read.
  var chip = document.getElementById("foundingChip");
  var bar = document.getElementById("foundingBar");
  if (chip && window.fetch) {
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    fetch(SUPABASE_URL + "/rest/v1/rpc/founding_slots_left", {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY, "Content-Type": "application/json" },
      body: "{}",
      signal: ctl ? ctl.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error("status " + res.status);
      return res.json();
    }).then(function (left) {
      clearTimeout(timer);
      if (typeof left !== "number" || left < 0 || left > 50 || Math.floor(left) !== left) throw new Error("unexpected value");
      if (left === 0) {
        chip.textContent = "All 50 founding places are taken";
        return;
      }
      chip.textContent = left + " of 50 places left";
      if (bar) {
        bar.hidden = false;
        var fill = bar.firstElementChild;
        fill.style.width = "0%";
        requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = (((50 - left) / 50) * 100) + "%"; }); });
      }
    }).catch(function () { clearTimeout(timer); /* keep the fallback text */ });
  }

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
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !menuBtn.contains(e.target)) { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
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

  // Stagger siblings inside grids so they arrive one after another.
  document.querySelectorAll(".cards, .steps, .plans, .promises").forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll(".reveal"), function (el, i) { el.style.setProperty("--d", (i * 70) + "ms"); });
  });

  // Highlight the nav link of the section being read.
  var links = document.querySelectorAll(".nav-links a[href^='/#'], .nav-links a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").replace(/^\/?#/, "")] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
        var a = byId[en.target.id];
        if (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var sec = document.getElementById(id); if (sec) spy.observe(sec); });
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
