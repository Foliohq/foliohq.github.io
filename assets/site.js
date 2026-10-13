// ── Config ───────────────────────────────────────────────────────────────
// Chrome Web Store listing URL. Every primary button uses it. Leave empty to fall back to early access.
const STORE_URL = "https://chromewebstore.google.com/detail/ikcoodldjhpklnhbcfnecjpakoodkipl";
// ─────────────────────────────────────────────────────────────────────────

(function () {
  "use strict";

  var EARLY_ACCESS_URL = "mailto:foliosupport.team@gmail.com?subject=Folio%20early%20access";
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

  // Pro waitlist: saves the email to Supabase (insert-only table, public key).
  var WAITLIST_URL = "https://ddogtxwckmgdvsdmuntt.supabase.co/rest/v1/waitlist";
  var WAITLIST_KEY = "sb_publishable_ilY6aJMw9kc5eXYpzglwQg_NEYarv1K";
  var wlForm = document.getElementById("waitlist");
  if (wlForm) {
    var wlMsg = wlForm.querySelector(".wl-msg");
    var wlBtn = wlForm.querySelector("button[type=submit]");
    var wlInput = wlForm.elements.email;
    var wlHoney = wlForm.elements.website;
    var showMsg = function (text, cls) { wlMsg.textContent = text; wlMsg.className = "wl-msg " + cls; wlMsg.hidden = false; };
    var showDone = function () {
      var done = document.createElement("p");
      done.className = "wl-msg ok";
      done.setAttribute("role", "status");
      done.textContent = "You're on the list! We'll email you when Pro launches.";
      wlForm.replaceWith(done);
    };
    wlForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = wlInput.value.trim().toLowerCase();
      if (wlHoney && wlHoney.value) { showDone(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg("Please enter a valid email address.", "err"); wlInput.focus(); return; }
      wlBtn.disabled = true;
      wlMsg.hidden = true;
      fetch(WAITLIST_URL, {
        method: "POST",
        headers: { "apikey": WAITLIST_KEY, "Authorization": "Bearer " + WAITLIST_KEY, "Content-Type": "application/json", "Prefer": "return=minimal" },
        body: JSON.stringify({ email: email })
      }).then(function (res) {
        if (res.status === 201 || res.status === 409) { showDone(); return; }
        throw new Error("status " + res.status);
      }).catch(function () {
        wlBtn.disabled = false;
        showMsg("Something went wrong. Email us at foliosupport.team@gmail.com.", "err");
      });
    });
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
