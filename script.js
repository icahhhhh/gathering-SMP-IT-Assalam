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
     6. Tiket: buat kode unik dari nama tamu + generate barcode
     Kode berisi prefix + nama asli (dipisah "::") supaya saat di-scan,
     panitia langsung tahu itu tiket siapa tanpa perlu database tamu.
  --------------------------------------------------------------------- */
  function cleanNameForBarcode(name) {
    return name.replace(/\s+/g, " ").trim().slice(0, 40) || "Tamu";
  }

  const ticketCode =
    CONFIG.ticket.codePrefix + "::" + cleanNameForBarcode(guestName);

  if (typeof JsBarcode !== "undefined") {
    try {
      JsBarcode("#barcode", ticketCode, {
        format: CONFIG.ticket.barcodeFormat || "CODE128",
        lineColor: "#0a2e4d",
        width: 2,
        height: 60,
        displayValue: false,
        margin: 6,
        background: "transparent"
      });
    } catch (err) {
      console.warn("Barcode gagal dibuat:", err);
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
     11. PANITIA — Pemindai kehadiran (kamera) + pencatatan lokal
     Data tersimpan di localStorage PERANGKAT yang dipakai memindai.
     Cocok untuk satu titik check-in (mis. HP panitia di gerbang).
  --------------------------------------------------------------------- */
  const STORAGE_KEY = "gth2026_attendance_log";
  const scanPanel = document.getElementById("scan-panel");
  const btnOpenScan = document.getElementById("btn-open-scan");
  const btnCloseScan = document.getElementById("btn-close-scan");
  const scanStatus = document.getElementById("scan-status");
  const attendanceListEl = document.getElementById("attendance-list");
  const attendanceCountEl = document.getElementById("attendance-count");
  const manualInput = document.getElementById("manual-code-input");
  const btnManualAdd = document.getElementById("btn-manual-add");
  const btnExportCsv = document.getElementById("btn-export-csv");
  const btnResetLog = document.getElementById("btn-reset-log");

  let html5QrCodeInstance = null;
  let cameraStarting = false;
  let syncIntervalId = null;

  const sheetUrl = (CONFIG.sheet && CONFIG.sheet.webAppUrl || "").trim();
  const sheetConnected = sheetUrl.length > 0;

  /* ---- JSONP: ambil daftar kehadiran dari Google Sheet tanpa kena CORS ---- */
  function jsonpRequest(url, params) {
    return new Promise(function (resolve, reject) {
      const callbackName = "gth_cb_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
      const script = document.createElement("script");
      const query = Object.keys(params)
        .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); })
        .join("&");

      const timeout = setTimeout(function () {
        cleanup();
        reject(new Error("Timeout menghubungi Google Sheets"));
      }, 8000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[callbackName] = function (data) {
        cleanup();
        resolve(data);
      };

      script.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + query + "&callback=" + callbackName;
      script.onerror = function () {
        cleanup();
        reject(new Error("Gagal memuat data dari Google Sheets"));
      };
      document.body.appendChild(script);
    });
  }

  /* ---- Kirim satu kehadiran baru ke Google Sheet (fire-and-forget) ---- */
  function postAttendanceToSheet(entry) {
    if (!sheetConnected) return;
    fetch(sheetUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(entry)
    }).catch(function (err) {
      console.warn("Gagal mengirim ke Google Sheets (akan tetap tersimpan lokal):", err);
    });
  }

  /* ---- Tarik data terbaru dari sheet, gabungkan dengan cache lokal ---- */
  function syncFromSheet() {
    if (!sheetConnected) return Promise.resolve();
    return jsonpRequest(sheetUrl, { action: "list" })
      .then(function (data) {
        if (!data || !Array.isArray(data.rows)) return;
        const local = loadAttendance();
        const knownCodes = {};
        local.forEach(function (item) { knownCodes[item.code] = true; });

        let addedAny = false;
        data.rows.forEach(function (row) {
          if (!knownCodes[row.code]) {
            local.push({ code: row.code, name: row.name, time: row.time });
            knownCodes[row.code] = true;
            addedAny = true;
          }
        });

        if (addedAny) {
          saveAttendance(local);
          renderAttendance();
        }
      })
      .catch(function (err) {
        console.warn("Sinkronisasi Google Sheets gagal:", err);
      });
  }

  function loadAttendance() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveAttendance(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function parseTicketCode(rawText) {
    // Format tiket kita: "GTH-2026::Nama Tamu". Kode lain (mis. hasil
    // ketik manual) tetap diterima apa adanya sebagai identitas.
    const parts = String(rawText).split("::");
    if (parts.length >= 2) {
      return { code: rawText, name: parts.slice(1).join("::").trim() };
    }
    return { code: rawText, name: rawText };
  }

  function renderAttendance() {
    const list = loadAttendance();
    if (attendanceCountEl) {
      attendanceCountEl.textContent = String(list.length);
    }
    if (!attendanceListEl) return;
    attendanceListEl.innerHTML = "";
    list
      .slice()
      .reverse()
      .forEach(function (entry) {
        const li = document.createElement("li");
        const time = new Date(entry.time);
        const timeLabel = isNaN(time.getTime())
          ? ""
          : time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        li.innerHTML =
          '<span class="att-name">' + escapeHtml(entry.name) + "</span>" +
          '<span class="att-time">' + timeLabel + "</span>";
        attendanceListEl.appendChild(li);
      });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function beep(freq) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      osc.onended = function () {
        ctx.close();
      };
    } catch (err) {
      /* Audio tidak tersedia, abaikan saja */
    }
  }

  function setStatus(message, tone) {
    if (!scanStatus) return;
    scanStatus.textContent = message;
    scanStatus.className = "scan-status " + (tone || "");
  }

  function recordAttendance(rawText) {
    const parsed = parseTicketCode(rawText);
    const list = loadAttendance();
    const already = list.some(function (item) {
      return item.code === parsed.code;
    });

    if (already) {
      setStatus("⚠ " + parsed.name + " — sudah tercatat sebelumnya", "warn");
      beep(220);
      return;
    }

    const newEntry = {
      code: parsed.code,
      name: parsed.name,
      time: new Date().toISOString()
    };
    list.push(newEntry);
    saveAttendance(list);
    renderAttendance();
    setStatus("✅ " + parsed.name + " — kehadiran tercatat", "ok");
    beep(880);
    postAttendanceToSheet(newEntry);
  }

  function startScanner() {
    if (typeof Html5Qrcode === "undefined") {
      setStatus("Pemindai gagal dimuat. Cek koneksi internet.", "warn");
      return;
    }
    if (cameraStarting) return;
    cameraStarting = true;

    html5QrCodeInstance = new Html5Qrcode("qr-reader", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.QR_CODE
      ],
      verbose: false
    });

    html5QrCodeInstance
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 140 } },
        function (decodedText) {
          recordAttendance(decodedText);
        },
        function () {
          /* frame tanpa hasil scan — biarkan, ini dipanggil terus-menerus */
        }
      )
      .then(function () {
        setStatus("Arahkan kamera ke barcode tiket…", "");
      })
      .catch(function (err) {
        setStatus(
          "Tidak bisa akses kamera. Izinkan akses kamera, atau catat manual di bawah.",
          "warn"
        );
        console.warn("Kamera gagal dibuka:", err);
      })
      .finally(function () {
        cameraStarting = false;
      });
  }

  function stopScanner() {
    if (html5QrCodeInstance) {
      html5QrCodeInstance
        .stop()
        .then(function () {
          html5QrCodeInstance.clear();
          html5QrCodeInstance = null;
        })
        .catch(function () {
          html5QrCodeInstance = null;
        });
    }
  }

  function updateSyncBadge() {
    const badge = document.getElementById("sync-badge");
    if (!badge) return;
    if (sheetConnected) {
      badge.textContent = "🟢 Tersambung ke Google Sheets — data sinkron antar perangkat";
      badge.className = "sync-badge ok";
    } else {
      badge.textContent = "⚪ Mode lokal — data hanya tersimpan di perangkat ini";
      badge.className = "sync-badge";
    }
  }

  if (btnOpenScan && scanPanel) {
    btnOpenScan.addEventListener("click", function () {
      scanPanel.classList.add("scan-open");
      document.body.style.overflow = "hidden";
      updateSyncBadge();
      renderAttendance();
      startScanner();

      if (sheetConnected) {
        syncFromSheet();
        syncIntervalId = setInterval(syncFromSheet, 15000);
      }
    });
  }

  if (btnCloseScan && scanPanel) {
    btnCloseScan.addEventListener("click", function () {
      scanPanel.classList.remove("scan-open");
      document.body.style.overflow = "";
      stopScanner();
      if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
      }
    });
  }

  if (btnManualAdd && manualInput) {
    btnManualAdd.addEventListener("click", function () {
      const val = manualInput.value.trim();
      if (!val) return;
      recordAttendance(val);
      manualInput.value = "";
      manualInput.focus();
    });
    manualInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") btnManualAdd.click();
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", function () {
      const list = loadAttendance();
      let csv = "Nama,Kode Tiket,Waktu Check-in\n";
      list.forEach(function (item) {
        const time = new Date(item.time).toLocaleString("id-ID");
        csv +=
          '"' + item.name.replace(/"/g, '""') + '",' +
          '"' + item.code.replace(/"/g, '""') + '",' +
          '"' + time + '"\n';
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kehadiran-gathering.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnResetLog) {
    btnResetLog.addEventListener("click", function () {
      if (confirm("Hapus semua catatan kehadiran di perangkat ini?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderAttendance();
        setStatus("Data kehadiran direset.", "");
      }
    });
  }
})();
