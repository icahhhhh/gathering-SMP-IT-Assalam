/* ========================================================================
   CONFIG.JS — Semua data undangan ada di sini.
   Ganti isi di bawah sesuai kebutuhan acara sekolahmu, sisanya biar
   script.js yang urus (parallax, countdown, barcode, lottie, dst).
   ======================================================================== */

const CONFIG = {
  // ---- Link Utama Undangan (Untuk Generator) ----
  baseUrl: "https://gathering-smp-it-assalam.vercel.app/", // Ganti dengan URL live undanganmu setelah di-hosting

  // ---- Identitas acara ----
  logoUrl: "Logo Sinar Ode WO.png", // Masukkan URL atau path file logomu di sini. Kosongkan ("") jika ingin disembunyikan.
  schoolName: "SMP IT Assalam",
  eventTitle: "SATU HATI: Silaturahmi, Taat, Harmoni Bersama Keluarga SMP IT Assalam Pelaihari",
  eventTagline: "Silaturahmi, Taat, dan Harmoni Bersama Keluarga Besar SMP IT Assalam",

  // Format tanggal WAJIB: "YYYY-MM-DDTHH:mm:ss" (dipakai untuk hitung mundur)
  eventDateISO: "2026-07-18T07:00:00",
  eventDateLabel: "Sabtu, 18 Juli 2026",
  eventTimeLabel: "08.00 WITA – Selesai",

  location: {
    name: "Rumah Makan Pegunungan Batilai",
    address: "Batilai, Telaga, Kec. Pelaihari, Kabupaten Tanah Laut, Kalimantan Selatan 70815",
    mapsUrl: "https://maps.app.goo.gl/saZeNz8YVoZUrT1T9"
  },

  dressCode: "👕 Polo/Kaos <br> 👖 Celana panjang <br> 👟 Sneakers/Sepatu olahraga",

  // ---- Kontak panitia (dipakai tombol konfirmasi kehadiran) ----
  committee: {
    name: "Panitia Gathering",
    whatsapp: "6281234567890", // format internasional tanpa tanda +
    whatsappMessage: "Halo, saya konfirmasi kehadiran di acara SATU HATI: Silaturahmi, Taat, Harmoni Bersama Keluarga SMPIT Assalam, 18 Juli 2026."
  },

  // ---- Rundown acara ----
  schedule: [
    { time: "07.30", title: "Registrasi & Kedatangan", desc: "Check-in kehadiran tamu dan siswa bersama keluarga." },
    { time: "08.00", title: "Pembukaan Acara", desc: "Sambutan Kepala Sekolah & Ketua Panitia, dilanjutkan doa pembuka." },
    { time: "08.30", title: "Ice Breaking Keluarga", desc: "Games pembuka bersama seluruh keluarga untuk mencairkan suasana." },
    { time: "09.00", title: "Taat Journey: Taaruf", desc: "Sesi perkenalan antar keluarga, dipisah kelompok ikhwan & akhwat." },
    { time: "10.00", title: "Games Keluarga Kompetitif", desc: "Lomba seru orang tua & anak, dilanjut hiburan penampilan siswa." },
    { time: "11.30", title: "ISHOMA & Sholat Dzuhur", desc: "Istirahat, makan siang, dan sholat Dzuhur berjamaah." },
    { time: "13.00", title: "Taat Journey: Tafakur", desc: "Muhasabah bersama, menulis surat untuk orang tua/anak, tausiyah reflektif." },
    { time: "13.45", title: "Games Penutup & Pengumuman", desc: "Lomba final antar keluarga, pengumuman pemenang, dan pembagian doorprize." },
    { time: "14.45", title: "Penutupan", desc: "Foto bersama, doa penutup, dan sesi pulang." }
  ],

  // ---- Tiket / QR code kehadiran ----
  ticket: {
    codePrefix: "GTH-2026"   // kode akan digabung dengan nama tamu dari URL (?to=), lalu dibuat jadi QR code 2D di tiket
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
    webAppUrl: "https://script.google.com/macros/s/AKfycbw0HfEcG4v2XQud4_-o9b8vE1kQt98v7aGTuPWyGCITGZWKeaeQXB3bWCsEOzxo3xaW/exec"
  },

  // ---- Galeri singkat (emoji dipakai sebagai placeholder ringan, boleh diganti foto asli) ----
  gallery: [
    { emoji: "🤝", caption: "Silaturahmi ortu & guru" },
    { emoji: "🕌", caption: "Taaruf & takafur anak-anak" },
    { emoji: "🎮", caption: "Main Games bareng keluarga" },
    { emoji: "🎶", caption: "Kebersamaan penuh harmoni" }
  ],

  // ---- Sosial Media ----
  socialMedia: {
    whatsapp: "https://wa.me/6283159371090", // Ganti dengan nomor WA kamu (gunakan format 62...)
    instagram: "https://instagram.com/sinarode_weddingorganizer", // Ganti dengan link Instagram
    tiktok: "https://tiktok.com/@sinarode_weddingo" // Ganti dengan link TikTok
  },

  // ---- Musik Latar ----
  // Ganti URL di bawah dengan link langsung ke file .mp3 musik pilihanmu
  musicUrl: "musik.mp3",

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
    nm: "mountain-sunrise",
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
      },
      {
        ddd: 0,
        ind: 4,
        ty: 4,
        nm: "MountainBack",
        sr: 1,
        ks: {
          o: { a: 0, k: 90 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [150, 150, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sh",
                ks: {
                  a: 0,
                  k: {
                    i: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
                    o: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
                    v: [[-150,150],[-150,30],[-90,-50],[-40,20],[10,-65],[60,15],[110,-40],[150,25],[150,150]],
                    c: true
                  }
                },
                nm: "mountainBackPath"
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.7176, 0.851, 0.6745, 1] },
                o: { a: 0, k: 100 },
                nm: "mountainBackFill"
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
            nm: "mountainBackGroup"
          }
        ],
        ip: 0,
        op: 180,
        st: 0,
        bm: 0
      },
      {
        ddd: 0,
        ind: 5,
        ty: 4,
        nm: "MountainFront",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [150, 150, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sh",
                ks: {
                  a: 0,
                  k: {
                    i: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
                    o: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
                    v: [[-150,150],[-150,80],[-100,20],[-55,70],[-10,10],[40,75],[85,15],[130,70],[150,50],[150,150]],
                    c: true
                  }
                },
                nm: "mountainFrontPath"
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.1843, 0.4196, 0.3098, 1] },
                o: { a: 0, k: 100 },
                nm: "mountainFrontFill"
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
            nm: "mountainFrontGroup"
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
