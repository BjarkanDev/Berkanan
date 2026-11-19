// Berkanan — site.js
// Small, dependency-free enhancements. The site works fully without JavaScript.
(function () {
    "use strict";

    var root = document.documentElement;
    var body = document.body;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Theme toggle (light A / dark C) ---------------------------------
    var themeBtn = document.querySelector("[data-theme-toggle]");

    // CV links: light theme gets the light PDF, dark theme the dark one.
    // Without JS the href stays on the light version.
    function syncCvLinks(t) {
        document.querySelectorAll("[data-cv-light][data-cv-dark]").forEach(function (a) {
            a.setAttribute("href", a.getAttribute(t === "dark" ? "data-cv-dark" : "data-cv-light"));
        });
    }

    function setTheme(t) {
        root.setAttribute("data-theme", t);
        syncCvLinks(t);
        try { localStorage.setItem("theme", t); } catch (e) { }
        if (themeBtn) themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
    syncCvLinks(root.getAttribute("data-theme") || "light");
    if (themeBtn) {
        setTheme(root.getAttribute("data-theme") || "light");
        themeBtn.addEventListener("click", function () {
            setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
        });
    }

    // ---- Header state ------------------------------------------------------
    var header = document.querySelector("[data-header]");
    var hero = document.querySelector("[data-hero]");
    if (hero) body.classList.add("has-hero");
    function onScroll() {
        if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---- Mobile navigation -----------------------------------------------
    var navBtn = document.querySelector("[data-nav-toggle]");
    function closeNav() {
        body.classList.remove("nav-open");
        if (navBtn) { navBtn.setAttribute("aria-expanded", "false"); navBtn.setAttribute("aria-label", "Open menu"); }
    }
    if (navBtn) {
        navBtn.addEventListener("click", function () {
            var open = body.classList.toggle("nav-open");
            navBtn.setAttribute("aria-expanded", String(open));
            navBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });
        document.querySelectorAll(".site-nav a").forEach(function (a) { a.addEventListener("click", closeNav); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
        window.addEventListener("resize", function () { if (window.innerWidth > 760) closeNav(); });
    }

    // ---- Hero video: only reveal once it can actually play ----------------
    var video = document.querySelector("[data-hero-video]");
    if (video) {
        if (reduceMotion) {
            video.removeAttribute("autoplay");
            video.pause();
        }
        var showVideo = function () { body.classList.add("hero-video-on"); };
        if (video.readyState >= 2) showVideo();
        video.addEventListener("loadeddata", showVideo, { once: true });
        // If every <source> fails (files not added yet) the pastel hero stays.
        var sources = video.querySelectorAll("source");
        var last = sources[sources.length - 1];
        if (last) last.addEventListener("error", function () { body.classList.remove("hero-video-on"); });
    }

    // ---- Reveal on scroll --------------------------------------------------
    var reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
        reveals.forEach(function (el, i) {
            // Gentle stagger for siblings in grids
            var parent = el.parentElement;
            if (parent && (parent.classList.contains("disciplines") || parent.classList.contains("cards"))) {
                el.style.transitionDelay = (Array.prototype.indexOf.call(parent.children, el) % 3) * 90 + "ms";
            }
            io.observe(el);
        });
    }

    // ---- Portfolio filter --------------------------------------------------
    var filters = document.querySelector("[data-filters]");
    var cards = document.querySelectorAll("[data-cards] .card");
    var empty = document.querySelector("[data-empty]");
    if (filters && cards.length) {
        filters.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-filter]");
            if (!btn) return;
            var f = btn.getAttribute("data-filter");
            filters.querySelectorAll("[data-filter]").forEach(function (b) {
                var on = b === btn;
                b.classList.toggle("is-active", on);
                b.setAttribute("aria-pressed", String(on));
            });
            var shown = 0;
            cards.forEach(function (card) {
                var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
                var match = f === "all" || tags.indexOf(f) !== -1;
                card.hidden = !match;
                if (match) { shown++; card.classList.add("is-visible"); }
            });
            if (empty) empty.hidden = shown !== 0;
        });
    }

    // ---- Footer year (keeps static copies current) ------------------------
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
})();
