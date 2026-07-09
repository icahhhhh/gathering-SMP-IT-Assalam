/* ========================================================================
   SCRIPT.JS — Logika undangan: isi konten dari config.js, parallax,
   countdown, animasi Lottie, barcode tiket, dan reveal-on-scroll.
   ======================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     1. Ambil nama tamu dari URL (?to=Nama). Kalau tidak ada, pakai default.
  --------------------------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);
  const guestName = (params.get("to") || "Teman Seangkatan").trim();

  /* ---------------------------------------------------------------------
     2. Isi semua teks statis dari CONFIG
  --------------------------------------------------------------------- */
  function fillText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  fillText("gate-guest-name", guestName);
  fillText("hero-school-name", CONFIG.schoolName);
  fillText("hero-tagline", CONFIG.eventTagline);
  fillText("hero-date-label", CONFIG.eventDateLabel);
  fillText("detail-date", CONFIG.eventDateLabel);
  fillText("detail-time", CONFIG.eventTimeLabel);
  fillText("detail-location", CONFIG.location.name);
  fillText("detail-dresscode", CONFIG.dressCode);
  fillText("footer-school-name", CONFIG.schoolName);
  fillText("ticket-guest-name", guestName);
  fillText("ticket-date", CONFIG.eventDateLabel);
  fillText("ticket-time", CONFIG.eventTimeLabel);
  fillText("ticket-location", CONFIG.location.name);

  document.title = "Undangan Gathering — " + CONFIG.schoolName;

  const mapsLink = document.getElementById("detail-maps-link");
  if (mapsLink) mapsLink.href = CONFIG.location.mapsUrl;

  const whatsappLink = document.getElementById("whatsapp-link");
  if (whatsappLink) {
    const msg = encodeURIComponent(
      CONFIG.committee.whatsappMessage + " (Nama: " + guestName + ")"
    );
    whatsappLink.href =
      "https://wa.me/" + CONFIG.committee.whatsapp + "?text=" + msg;
  }

  /* ---------------------------------------------------------------------
     3. Rundown acara (timeline)
  --------------------------------------------------------------------- */
  const timelineEl = document.getElementById("timeline");
  if (timelineEl && Array.isArray(CONFIG.schedule)) {
    CONFIG.schedule.forEach(function (item) {
      const wrap = document.createElement("div");
      wrap.className = "timeline-item reveal";
      wrap.innerHTML =
        '<div class="timeline-dot"></div>' +
        '<div class="timeline-time">' + item.time + "</div>" +
        "<h3>" + item.title + "</h3>" +
        "<p>" + item.desc + "</p>";
      timelineEl.appendChild(wrap);
    });
  }

  /* ---------------------------------------------------------------------
     4. Galeri singkat
  --------------------------------------------------------------------- */
  const galleryEl = document.getElementById("gallery-grid");
  if (galleryEl && Array.isArray(CONFIG.gallery)) {
    CONFIG.gallery.forEach(function (item) {
      const tile = document.createElement("div");
      tile.className = "gallery-tile";
      tile.innerHTML =
        '<div class="emoji">' + item.emoji + "</div>" +
        "<p>" + item.caption + "</p>";
      galleryEl.appendChild(tile);
    });
  }

  /* ---------------------------------------------------------------------
     5. Animasi Lottie (matahari) — dipasang di 3 tempat: gate, hero, showcase
  --------------------------------------------------------------------- */
  function mountLottie(elementId) {
    const container = document.getElementById(elementId);
    if (!container || typeof lottie === "undefined") return;
    lottie.loadAnimation({
      container: container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: CONFIG.lottieSun
    });
  }

  mountLottie("gate-lottie");
  mountLottie("hero-lottie");
  mountLottie("showcase-lottie");

  /* ---------------------------------------------------------------------
     6. Tiket: buat kode unik dari nama tamu + generate QR code (2D)
     Kode berisi prefix + nama asli (dipisah "::") supaya saat di-scan,
     panitia langsung tahu itu tiket siapa tanpa perlu database tamu.
     QR code dipilih (bukan barcode 1D) supaya bisa dipindai baik lewat
     kamera HP (di scan panel) maupun scanner fisik 2D di gerbang.
  --------------------------------------------------------------------- */
  function cleanNameForBarcode(name) {
    return name.replace(/\s+/g, " ").trim().slice(0, 40) || "Tamu";
  }

  const ticketCode =
    CONFIG.ticket.codePrefix + "::" + cleanNameForBarcode(guestName);

  const barcodeContainer = document.getElementById("barcode");
  if (barcodeContainer && typeof QRCode !== "undefined") {
    try {
      new QRCode(barcodeContainer, {
        text: ticketCode,
        width: 92,
        height: 92,
        colorDark: "#0a2e4d",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (err) {
      console.warn("QR code gagal dibuat:", err);
    }
  }

  /* ---------------------------------------------------------------------
     7. Countdown menuju tanggal acara
  --------------------------------------------------------------------- */
  const eventDate = new Date(CONFIG.eventDateISO).getTime();

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = eventDate - now;

    const els = {
      d: document.getElementById("cd-days"),
      h: document.getElementById("cd-hours"),
      m: document.getElementById("cd-minutes"),
      s: document.getElementById("cd-seconds")
    };

    if (diff <= 0) {
      if (els.d) els.d.textContent = "00";
      if (els.h) els.h.textContent = "00";
      if (els.m) els.m.textContent = "00";
      if (els.s) els.s.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (els.d) els.d.textContent = pad(days);
    if (els.h) els.h.textContent = pad(hours);
    if (els.m) els.m.textContent = pad(minutes);
    if (els.s) els.s.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------------------------------------------------------------------
     8. Opening gate
  --------------------------------------------------------------------- */
  const gate = document.getElementById("gate");
  const btnOpen = document.getElementById("btn-open");
  const main = document.getElementById("main");

  if (btnOpen && gate && main) {
    btnOpen.addEventListener("click", function () {
      gate.classList.add("gate-hidden");
      main.classList.add("revealed");
      document.body.style.overflow = "auto";
      setTimeout(function () {
        gate.style.display = "none";
      }, 950);
    });
  }

  /* ---------------------------------------------------------------------
     9. Efek parallax saat scroll (untuk layer di dalam hero)
  --------------------------------------------------------------------- */
  const parallaxLayers = document.querySelectorAll(".hero-layer[data-speed]");
  const heroSection = document.getElementById("hero");
  let ticking = false;

  function applyParallax() {
    if (!heroSection) return;
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = heroSection.offsetHeight;

    // Hanya hitung selama hero masih terlihat, biar hemat kerja saat scroll jauh
    if (scrollY < heroHeight * 1.4) {
      parallaxLayers.forEach(function (layer) {
        const speed = parseFloat(layer.getAttribute("data-speed")) || 0;
        layer.style.transform = "translateY(" + scrollY * speed + "px)";
      });
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(applyParallax);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* Parallax halus mengikuti pergerakan mouse (khusus desktop) */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    heroSection &&
      heroSection.addEventListener("mousemove", function (e) {
        const rect = heroSection.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;

        parallaxLayers.forEach(function (layer) {
          const speed = parseFloat(layer.getAttribute("data-speed")) || 0;
          const moveX = relX * speed * 40;
          const moveY = relY * speed * 40;
          layer.style.transform =
            "translate(" + moveX + "px," + moveY + "px)";
        });
      });
  }

  /* ---------------------------------------------------------------------
     10. Reveal-on-scroll untuk elemen dengan class .reveal
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback kalau browser tidak dukung IntersectionObserver
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------------------------------------------------------------------
     11. PANITIA — Pemindai kehadiran
     Modul ini sekarang dipisah sepenuhnya ke scan-panel.html / .css / .js
     supaya fitur scan bisa berdiri sendiri dan tidak mencampur tanggung
     jawab dengan halaman undangan utama. Lihat scan-panel.js.
  --------------------------------------------------------------------- */
})();
