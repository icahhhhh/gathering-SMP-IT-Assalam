/* ========================================================================
   CONFIG.JS — Semua data undangan ada di sini.
   Ganti isi di bawah sesuai kebutuhan acara sekolahmu, sisanya biar
   script.js yang urus (parallax, countdown, barcode, lottie, dst).
   ======================================================================== */

const CONFIG = {
  // ---- Identitas acara ----
  schoolName: "SMA Cakrawala Bahari",
  eventTitle: "Gathering Angkatan & Reuni Sekolah",
  eventTagline: "Sehari di Tepi Laut, Selamanya di Kenangan",

  // Format tanggal WAJIB: "YYYY-MM-DDTHH:mm:ss" (dipakai untuk hitung mundur)
  eventDateISO: "2026-07-25T07:00:00",
  eventDateLabel: "Sabtu, 25 Juli 2026",
  eventTimeLabel: "07.00 WITA – Selesai",

  location: {
    name: "Pantai Bunga Karang, Banjarmasin",
    address: "Jl. Pantai Indah No. 8, Banjarmasin, Kalimantan Selatan",
    mapsUrl: "https://maps.google.com/?q=Pantai+Bunga+Karang+Banjarmasin"
  },

  dressCode: "Kaos angkatan / nuansa biru & putih",

  // ---- Kontak panitia (dipakai tombol konfirmasi kehadiran) ----
  committee: {
    name: "Panitia Gathering",
    whatsapp: "6281234567890", // format internasional tanpa tanda +
    whatsappMessage: "Halo, saya konfirmasi kehadiran di acara Gathering Sekolah 25 Juli 2026."
  },

  // ---- Rundown acara ----
  schedule: [
    { time: "07.00", title: "Kumpul & Registrasi", desc: "Check-in dengan scan tiket di gerbang pantai." },
    { time: "08.00", title: "Sarapan Bersama", desc: "Sarapan santai beralas tikar menghadap laut." },
    { time: "09.30", title: "Games & Lomba Pantai", desc: "Tarik tambang, estafet air, dan lomba pasir." },
    { time: "12.00", title: "Makan Siang & Bebas Main Air", desc: "Waktu bebas berenang dan foto-foto." },
    { time: "15.30", title: "Sunset & Penutupan", desc: "Foto angkatan bareng saat matahari terbenam." }
  ],

  // ---- Tiket / barcode kehadiran ----
  ticket: {
    codePrefix: "GTH-2026",   // kode akan digabung dengan nama tamu dari URL (?to=)
    barcodeFormat: "CODE128"
  },

  /* ----------------------------------------------------------------------
     Backend Google Sheets (opsional).
     1. Buat Google Sheet baru, buka Extensions > Apps Script.
     2. Tempel isi file "apps-script-kehadiran.gs" yang disertakan.
     3. Deploy > New deployment > Web app
        - Execute as: Me
        - Who has access: Anyone
     4. Salin URL Web App yang muncul, tempel di bawah ini.
     Kalau dikosongkan, pencatatan kehadiran tetap jalan tapi hanya
     tersimpan lokal di satu perangkat (tidak sinkron antar HP/laptop).
  ---------------------------------------------------------------------- */
  sheet: {
    webAppUrl: "https://script.google.com/macros/s/AKfycbyyGUl5w7t0vjqaeN-GPwSWNJcrLsozMe6-0XeG-5sJJVt8XImmazX5SWvy_LZqrO2U/exec"
  },

  // ---- Galeri singkat (emoji dipakai sebagai placeholder ringan, boleh diganti foto asli) ----
  gallery: [
    { emoji: "🏖️", caption: "Main pasir bareng" },
    { emoji: "🌊", caption: "Ombak & tawa" },
    { emoji: "🍉", caption: "Bekal & jajanan pantai" },
    { emoji: "🎶", caption: "Musik & obrolan lama" }
  ],

  /* ----------------------------------------------------------------------
     Animasi Lottie (matahari terbit + sinar berputar). Dibuat manual
     dalam format Lottie JSON standar agar tidak bergantung ke file
     eksternal — cukup dimuat langsung oleh lottie-web lewat script.js.
  ---------------------------------------------------------------------- */
  lottieSun: {
    v: "5.9.6",
    fr: 30,
    ip: 0,
    op: 180,
    w: 300,
    h: 300,
    nm: "beach-sun",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Rays",
        sr: 1,
        ks: {
          o: { a: 0, k: 85 },
          r: { a: 1, k: [
            { t: 0, s: [0] },
            { t: 180, s: [360] }
          ] },
          p: { a: 0, k: [150, 150, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                p: { a: 0, k: [0, -95] },
                s: { a: 0, k: [10, 46] },
                r: { a: 0, k: 5 },
                nm: "ray"
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.62, 0.42, 1] },
                o: { a: 0, k: 100 },
                nm: "rayFill"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 }
              },
              {
                ty: "rp",
                c: { a: 0, k: 10 },
                o: { a: 0, k: 0 },
                m: 1,
                tr: {
                  p: { a: 0, k: [0, 0] },
                  a: { a: 0, k: [0, 0] },
                  s: { a: 0, k: [100, 100] },
                  r: { a: 0, k: 36 },
                  so: { a: 0, k: 100 },
                  eo: { a: 0, k: 100 }
                },
                nm: "raysRepeat"
              }
            ],
            nm: "raysGroup"
          }
        ],
        ip: 0,
        op: 180,
        st: 0,
        bm: 0
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "SunCore",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [150, 150, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [
            { t: 0, s: [100, 100, 100] },
            { t: 90, s: [108, 108, 100] },
            { t: 180, s: [100, 100, 100] }
          ] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { a: 0, k: [0, 0] },
                s: { a: 0, k: [130, 130] },
                nm: "sunCircle"
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.71, 0.31, 1] },
                o: { a: 0, k: 100 },
                nm: "sunFill"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 }
              }
            ],
            nm: "sunGroup"
          }
        ],
        ip: 0,
        op: 180,
        st: 0,
        bm: 0
      },
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "SunHighlight",
        sr: 1,
        ks: {
          o: { a: 0, k: 55 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [128, 128, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { a: 0, k: [0, 0] },
                s: { a: 0, k: [46, 46] },
                nm: "highlightCircle"
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.94, 0.8, 1] },
                o: { a: 0, k: 100 },
                nm: "highlightFill"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 }
              }
            ],
            nm: "highlightGroup"
          }
        ],
        ip: 0,
        op: 180,
        st: 0,
        bm: 0
      }
    ],
    markers: []
  }
};
