/**
 * ========================================================================
 * BACKEND KEHADIRAN — Google Apps Script
 * ------------------------------------------------------------------------
 * CARA PASANG (sekali saja):
 * 1. Buka https://sheets.google.com, buat spreadsheet baru
 *    (boleh dikosongkan, sheet "Kehadiran" akan dibuat otomatis).
 * 2. Menu Extensions > Apps Script.
 * 3. Hapus semua kode default di editor, tempel SELURUH isi file ini.
 * 4. Klik ikon Save (💾).
 * 5. Klik Deploy > New deployment.
 *    - Klik ikon gerigi di "Select type" > pilih "Web app".
 *    - Description: bebas, mis. "Backend Kehadiran".
 *    - Execute as: Me (akun kamu).
 *    - Who has access: Anyone.
 *    - Klik Deploy.
 * 6. Google akan minta izin akses — klik "Authorize access", pilih akun
 *    kamu. Kalau muncul peringatan "Google hasn't verified this app",
 *    klik "Advanced" lalu "Go to (nama project) (unsafe)" — ini AMAN
 *    karena scriptnya punya kamu sendiri, bukan punya orang lain.
 * 7. Setelah deploy selesai, salin "Web app URL" yang muncul
 *    (bentuknya https://script.google.com/macros/s/xxxxx/exec).
 * 8. Tempel URL itu ke config.js pada bagian sheet.webAppUrl.
 * 9. Setiap ada tamu baru di-scan di web undangan, baris baru otomatis
 *    muncul di sheet "Kehadiran" pada spreadsheet ini — bisa dibuka
 *    dari HP/laptop mana pun.
 *
 * Kalau nanti kamu ubah kode script ini, ULANGI langkah Deploy dengan
 * memilih "New deployment" lagi (deployment lama tidak auto-update).
 * ========================================================================
 */

const SHEET_NAME = "Kehadiran";
const HEADER_ROW = ["Kode Tiket", "Nama Tamu", "Waktu Check-in (server)", "Waktu Check-in (perangkat)"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER_ROW);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADER_ROW.length).setFontWeight("bold");
  }
  return sheet;
}

/**
 * GET — dipakai web undangan untuk mengambil daftar kehadiran terbaru
 * (supaya beberapa HP/laptop yang scan bisa saling lihat data yang sama).
 * Mendukung JSONP lewat parameter ?callback=... supaya tidak diblokir CORS.
 */
function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1).map(function (r) {
    return { code: String(r[0] || ""), name: String(r[1] || ""), time: String(r[2] || "") };
  });

  const payload = JSON.stringify({ ok: true, count: rows.length, rows: rows });

  if (e && e.parameter && e.parameter.callback) {
    return ContentService
      .createTextOutput(e.parameter.callback + "(" + payload + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST — dipakai web undangan untuk mencatat satu kehadiran baru.
 * Body JSON: { code, name, time }
 * Kode tiket dipakai sebagai kunci unik supaya tidak tercatat dobel.
 */
function doPost(e) {
  const sheet = getSheet_();
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: "Payload tidak valid" });
  }

  const code = String(body.code || "").trim();
  const name = String(body.name || "").trim();
  const deviceTime = String(body.time || "");

  if (!code) {
    return jsonOut_({ ok: false, error: "Kode tiket kosong" });
  }

  const values = sheet.getDataRange().getValues();
  const isDuplicate = values.slice(1).some(function (r) {
    return String(r[0]) === code;
  });

  if (isDuplicate) {
    return jsonOut_({ ok: true, duplicate: true, code: code, name: name });
  }

  sheet.appendRow([code, name, new Date().toISOString(), deviceTime]);
  return jsonOut_({ ok: true, duplicate: false, code: code, name: name });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
