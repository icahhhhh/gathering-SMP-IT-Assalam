/* ========================================================================
   GENERATOR-UNDANGAN-TAILWIND.CONFIG.JS
   Konfigurasi warna & font Tailwind supaya sama dengan tema "Hijau
   Pegunungan" di style.css / scan-panel.css. File ini WAJIB dimuat
   SEBELUM generator-undangan.css & sebelum body dirender (taruh di
   <head>, setelah script cdn.tailwindcss.com).
   ======================================================================== */

tailwind.config = {
    theme: {
        extend: {
            colors: {
                mtn: {
                    navy: '#16332a',
                    ocean: '#2f6b4f',
                    aqua: '#5fa773',
                    sky: '#d8e8d0',
                    sand: '#f3ecd9',
                    sandDeep: '#e3d2ac',
                    coral: '#e2984f',
                    coralDeep: '#c97a34',
                    foam: '#f5faf3',
                    ink: '#1c3a2e'
                }
            },
            fontFamily: {
                serif: ['"Fraunces"', 'serif'],
                sans: ['Manrope', 'sans-serif']
            }
        }
    }
};
