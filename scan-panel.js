/* ========================================================================
   SCAN-PANEL.JS — Logika halaman standalone "Pemindai Kehadiran".
   Berjalan mandiri di scan-panel.html (bukan lagi disisipkan ke index.html).
   Mencakup: kamera QR (html5-qrcode), input scanner fisik/manual, rekap
   tamu (tabel), ekspor CSV, reset, dan sinkronisasi opsional ke Google
   Sheets lewat CONFIG.sheet.webAppUrl (lihat config.js).
   ======================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "gth2026_attendance_log";

  const scanStatus = document.getElementById("scan-status");
  const attendanceTableBody = document.getElementById("attendance-table-body");
  const attendanceCountEl = document.getElementById("attendance-count");
  const manualInput = document.getElementById("manual-code-input");
  const btnManualAdd = document.getElementById("btn-manual-add");
  const btnExportCsv = document.getElementById("btn-export-csv");
  const btnResetLog = document.getElementById("btn-reset-log");
  const syncBadge = document.getElementById("sync-badge");
  const syncNote = document.getElementById("scan-sync-note");

  /* ---------------------------------------------------------------------
     1. Isi header dari CONFIG (nama sekolah, judul & tanggal acara)
  --------------------------------------------------------------------- */
  if (typeof CONFIG !== "undefined") {
    const schoolEl = document.getElementById("scan-school-name");
    if (schoolEl) schoolEl.textContent = CONFIG.schoolName || "Panitia";

    const eventInfoEl = document.getElementById("scan-event-info");
    if (eventInfoEl) {
      eventInfoEl.textContent =
        (CONFIG.eventTitle || "") +
        (CONFIG.eventDateLabel ? " · " + CONFIG.eventDateLabel : "");
    }
    document.title = "Pemindai Kehadiran — " + (CONFIG.schoolName || "Panitia");
  }

  const sheetUrl =
    typeof CONFIG !== "undefined" && CONFIG.sheet && CONFIG.sheet.webAppUrl
      ? CONFIG.sheet.webAppUrl.trim()
      : "";
  const sheetConnected = sheetUrl.length > 0;

  let html5QrCodeInstance = null;
  let cameraStarting = false;
  let syncIntervalId = null;

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

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------------------
     2. Rekap Tamu — render sebagai tabel, terbaru di atas
  --------------------------------------------------------------------- */
  function renderAttendance() {
    const list = loadAttendance();
    if (attendanceCountEl) {
      attendanceCountEl.textContent = String(list.length);
    }
    if (!attendanceTableBody) return;

    if (list.length === 0) {
      attendanceTableBody.innerHTML =
        '<tr class="recap-empty-row"><td colspan="3">Belum ada tamu tercatat.</td></tr>';
      return;
    }

    attendanceTableBody.innerHTML = list
      .slice()
      .reverse()
      .map(function (entry) {
        const time = new Date(entry.time);
        const timeLabel = isNaN(time.getTime())
          ? "-"
          : time.toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            });
        return (
          "<tr>" +
          '<td class="att-name">' + escapeHtml(entry.name) + "</td>" +
          '<td class="att-code">' + escapeHtml(entry.code) + "</td>" +
          '<td class="att-time">' + timeLabel + "</td>" +
          "</tr>"
        );
      })
      .join("");
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

  /* ---------------------------------------------------------------------
     3. Kamera QR (html5-qrcode). Mendukung format QR_CODE (tiket baru)
     dan CODE_128 (jaga-jaga kalau masih ada tiket lama format 1D).
  --------------------------------------------------------------------- */
  function startScanner() {
    if (typeof Html5Qrcode === "undefined") {
      setStatus("Pemindai gagal dimuat. Cek koneksi internet.", "warn");
      return;
    }
    if (cameraStarting) return;
    cameraStarting = true;

    html5QrCodeInstance = new Html5Qrcode("qr-reader", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128
      ],
      verbose: false
    });

    html5QrCodeInstance
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        function (decodedText) {
          recordAttendance(decodedText);
        },
        function () {
          /* frame tanpa hasil scan — biarkan, ini dipanggil terus-menerus */
        }
      )
      .then(function () {
        setStatus("Arahkan kamera ke QR code tiket…", "");
      })
      .catch(function (err) {
        setStatus(
          "Tidak bisa akses kamera. Izinkan akses kamera, atau catat lewat kolom di bawah.",
          "warn"
        );
        console.warn("Kamera gagal dibuka:", err);
      })
      .finally(function () {
        cameraStarting = false;
      });
  }

  function updateSyncBadge() {
    if (!syncBadge) return;
    if (sheetConnected) {
      syncBadge.textContent = "🟢 Tersambung ke Google Sheets — data sinkron antar perangkat";
      syncBadge.className = "sync-badge ok";
      if (syncNote) syncNote.textContent = " dan disinkronkan ke Google Sheets";
    } else {
      syncBadge.textContent = "⚪ Mode lokal — data hanya tersimpan di perangkat ini";
      syncBadge.className = "sync-badge";
      if (syncNote) syncNote.textContent = "";
    }
  }

  /* ---------------------------------------------------------------------
     4. Input manual / scanner fisik 2D
     Scanner fisik pada umumnya bekerja sebagai keyboard (HID): ia akan
     "mengetik" hasil pindai ke kolom yang sedang fokus lalu menekan Enter.
     Makanya kolom ini otomatis difokuskan begitu halaman dibuka.
  --------------------------------------------------------------------- */
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
    // Fokuskan otomatis supaya siap menerima input dari scanner fisik.
    manualInput.focus();
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
      a.download = "rekap-tamu-gathering.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnResetLog) {
    btnResetLog.addEventListener("click", function () {
      if (confirm("Hapus semua rekap tamu di perangkat ini?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderAttendance();
        setStatus("Rekap tamu direset.", "");
      }
    });
  }

  /* ---------------------------------------------------------------------
     5. Jalankan begitu halaman dibuka
  --------------------------------------------------------------------- */
  updateSyncBadge();
  renderAttendance();
  startScanner();

  if (sheetConnected) {
    syncFromSheet();
    syncIntervalId = setInterval(syncFromSheet, 15000);
  }

  window.addEventListener("beforeunload", function () {
    if (syncIntervalId) clearInterval(syncIntervalId);
    if (html5QrCodeInstance) {
      try { html5QrCodeInstance.stop(); } catch (err) { /* abaikan */ }
    }
  });
})();
