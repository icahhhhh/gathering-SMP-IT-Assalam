/* ========================================================================
   GENERATOR-UNDANGAN.JS — Logika halaman "Generator Undangan".
   Proses daftar nama tamu jadi link undangan bernama (?to=Nama), lalu
   tiap tamu bisa: salin pesan siap kirim, buka WhatsApp dengan pesan
   sudah terisi, atau bagikan lewat native share menu HP.
   Status "sudah dikirim" & daftar tamu tersimpan lokal (localStorage).
   ======================================================================== */

const SENT_KEY = "gth2026_sent_guests";

let generatedItems = [];
let sentNames = new Set();

/* ---------------------------------------------------------------------
   0. Deteksi base URL undangan (index.html). Bisa dipaksa lewat
   CONFIG.baseUrl di config.js kalau di-hosting di domain/folder lain.
--------------------------------------------------------------------- */
function detectBaseUrl() {
    if (typeof CONFIG !== "undefined" && CONFIG.baseUrl) return CONFIG.baseUrl;
    try {
        const loc = new URL(window.location.href);
        const dir = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
        return loc.origin + dir + "index.html";
    } catch (e) {
        return "index.html";
    }
}
const baseUrl = detectBaseUrl();

/* ---------------------------------------------------------------------
   1. Riwayat "sudah dikirim" (localStorage)
--------------------------------------------------------------------- */
function loadSentNames() {
    try {
        const raw = localStorage.getItem(SENT_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(arr);
    } catch (e) {
        return new Set();
    }
}

function saveSentNames() {
    localStorage.setItem(SENT_KEY, JSON.stringify(Array.from(sentNames)));
}

document.addEventListener('DOMContentLoaded', () => {
    sentNames = loadSentNames();
    if (typeof CONFIG !== "undefined") {
        document.title = "Generator Undangan — " + (CONFIG.schoolName || "Panitia");
    }
});

/* ---------------------------------------------------------------------
   2. Proses daftar nama dari textarea
--------------------------------------------------------------------- */
function processGeneration() {
    const bulkText = document.getElementById('bulkNames').value.trim();
    if (!bulkText) return showToast("⚠️ Isi dulu daftar nama tamu");

    const names = bulkText.split('\n').map(n => n.trim()).filter(n => n !== "");
    const btn = document.getElementById('btnGenerate');

    btn.disabled = true;
    btn.innerText = "Memproses...";

    generatedItems = names.map((name, index) => ({
        id: index,
        name: name,
        kategori: 'Alumni'
    }));

    renderBulkList();

    document.getElementById('resultBox').classList.remove('hidden');
    document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth' });

    btn.disabled = false;
    btn.innerText = "Buat Link Undangan";
    showToast(`✨ ${names.length} nama berhasil diproses`);
}

function buildLink(name, kategori) {
    const sep = baseUrl.indexOf('?') >= 0 ? '&' : '?';
    return `${baseUrl}${sep}to=${encodeURIComponent(name)}`;
}

/* ---------------------------------------------------------------------
   3. Render kartu tamu
--------------------------------------------------------------------- */
function renderBulkList() {
    const listContainer = document.getElementById('bulkList');
    listContainer.innerHTML = '';

    generatedItems.forEach((item) => {
        const link = buildLink(item.name, item.kategori);
        const isAlreadySent = sentNames.has(item.name.toLowerCase());

        const card = document.createElement('div');
        card.className = "glass-card rounded-[2rem] p-6 shadow-sm fade-up flex flex-col gap-4";
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1 pr-4">
                    <p class="text-[9px] font-bold text-mtn-ocean/60 uppercase tracking-widest mb-1">Nama Tamu</p>
                    <p class="text-sm font-bold text-mtn-navy flex items-center gap-2 flex-wrap">
                        ${item.name}
                        ${isAlreadySent ? '<span class="bg-mtn-coral/10 text-mtn-coralDeep text-[8px] px-2 py-0.5 rounded-full uppercase font-bold">Sudah Dikirim</span>' : ''}
                    </p>
                </div>
            </div>

            <div class="bg-mtn-foam border border-mtn-sky/60 p-3 rounded-xl">
                <p class="text-[8px] font-mono text-mtn-ocean/70 truncate mb-1">${link}</p>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <button onclick="handleAction('salin', '${item.id}')"
                        class="bg-white border border-mtn-sky text-mtn-navy py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-sm active:scale-95 transition-all">
                        ${isAlreadySent ? 'Salin Lagi' : 'Salin Pesan'}
                </button>
                <button onclick="handleAction('wa', '${item.id}')"
                        class="bg-mtn-navy text-white py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-mtn-navy/10 active:scale-95 transition-all flex justify-center items-center gap-1.5">
                    <span class="text-xs">💬</span> ${isAlreadySent ? 'Kirim Ulang' : 'Kirim WA'}
                </button>
                <button onclick="handleAction('share', '${item.id}')"
                        class="bg-mtn-coral text-white py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all flex justify-center items-center gap-1.5">
                    <span class="text-xs">📤</span> Bagikan
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function updateItemKategori(id, newKategori) {
    generatedItems[id].kategori = newKategori;
    renderBulkList();
    showToast(`Kategori ${generatedItems[id].name} → ${newKategori}`);
}

/* ---------------------------------------------------------------------
   4. Aksi tombol: salin pesan, kirim WA, atau bagikan
--------------------------------------------------------------------- */
async function handleAction(type, idStr) {
    const id = parseInt(idStr, 10);
    const item = generatedItems[id];
    if (!item) return;

    const link = buildLink(item.name, item.kategori);
    const message = getInvitationMessage(item.name, link);
    const isResend = sentNames.has(item.name.toLowerCase());

    if (type === 'salin') {
        copyToClipboard(message);
        showToast(isResend ? "📋 Pesan disalin lagi" : "📋 Pesan undangan disalin");
    } else if (type === 'wa') {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        showToast(isResend ? "✨ Kirim ulang undangan..." : "✨ Membuka WhatsApp...");
    } else if (type === 'share') {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: (typeof CONFIG !== "undefined" ? CONFIG.eventTitle : "Undangan"),
                    text: message
                });
                showToast("📤 Menu bagikan dibuka");
            } catch (err) {
                console.log("Share dibatalkan:", err);
            }
        } else {
            copyToClipboard(message);
            showToast("⚠️ Browser tidak mendukung share. Pesan disalin!");
        }
    }

    if (!isResend) {
        sentNames.add(item.name.toLowerCase());
        saveSentNames();
        renderBulkList();
    }
}

function copyToClipboard(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
        document.execCommand('copy');
    } catch (e) { /* abaikan */ }
    document.body.removeChild(el);
}

/* ---------------------------------------------------------------------
   5. Susun teks pesan undangan dari CONFIG
--------------------------------------------------------------------- */
function getInvitationMessage(name, link) {
    const c = (typeof CONFIG !== "undefined") ? CONFIG : {};
    const schoolName = c.schoolName || "";
    const eventTitle = c.eventTitle || "Gathering & Reuni Sekolah";
    const dateLabel = c.eventDateLabel || "";
    const timeLabel = c.eventTimeLabel || "";
    const locName = (c.location && c.location.name) || "";
    const dressCode = (c.dressCode || "").replace(/<br\s*\/?>/gi, ", ");
    const committeeName = (c.committee && c.committee.name) || "Panitia";

    return `Halo, *${name}*! 👋🌲

Kepada Yth. Bapak/Ibu/Saudara/i diundang untuk hadir di:

*${eventTitle}*

🗓️ ${dateLabel}
⏰ ${timeLabel}
📍 ${locName}
👕 Dress code: ${dressCode}

Silahkan buka undangan digitalmu di link berikut untuk lihat rundown acara & ambil e-tiket kehadiran (wajib ditunjukkan saat check-in ya):
${link}

Jangan lupa konfirmasi kehadiran lewat tombol yang ada di undangan. Ditunggu kedatangannya di pegunungan! 🏔️

Salam hangat,
${committeeName}`;
}

/* ---------------------------------------------------------------------
   6. Ekspor CSV & reset
--------------------------------------------------------------------- */
function exportCsv() {
    if (generatedItems.length === 0) return showToast("⚠️ Belum ada data untuk diekspor");
    let csv = "Nama,Kategori,Link,Status\n";
    generatedItems.forEach(item => {
        const link = buildLink(item.name, item.kategori);
        const status = sentNames.has(item.name.toLowerCase()) ? "Sudah Dikirim" : "Belum Dikirim";
        csv += `"${item.name.replace(/"/g, '""')}","${item.kategori}","${link}","${status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daftar-link-undangan.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("⬇ CSV berhasil diunduh");
}

function resetAll() {
    if (!confirm("Hapus semua daftar tamu & riwayat pengiriman di perangkat ini?")) return;
    generatedItems = [];
    sentNames = new Set();
    localStorage.removeItem(SENT_KEY);
    document.getElementById('bulkList').innerHTML = '';
    document.getElementById('resultBox').classList.add('hidden');
    document.getElementById('bulkNames').value = '';
    showToast("🗑️ Semua data direset");
}

/* ---------------------------------------------------------------------
   7. Toast notifikasi kecil
--------------------------------------------------------------------- */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.opacity = "1";
    t.style.transform = "translate(-50%, 0)";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
        t.style.opacity = "0";
        t.style.transform = "translate(-50%, 1rem)";
    }, 3000);
}
