wconst WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzFezXPUk7JWy-3xVrOcgEW_E7SmFMjs8MgJv6SO4lHwkghDNeZXx4gB_7zHJP-U2WN/exec";

let currentDownloadUrl = "";

// Fungsi untuk menghitung jumlah baris data dengan aman
function updateRowCounter() {
  const textarea = document.getElementById('shopeeData');
  const rowCounter = document.getElementById('rowCounter');
  if (!textarea || !rowCounter) return;

  let lines = textarea.value.split('\n').filter(line => line.trim() !== '');
  rowCounter.innerText = `📊 ${lines.length.toLocaleString()} baris data`;
}

// Daftarkan event listener setelah DOM siap agar elemen terdeteksi sempurna
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('shopeeData');
  if (textarea) {
    textarea.addEventListener('input', updateRowCounter);
    textarea.addEventListener('keyup', updateRowCounter);
    textarea.addEventListener('paste', () => {
      // Beri jeda sepersekian detik agar teks hasil paste di HP selesai dimuat
      setTimeout(updateRowCounter, 100);
    });
  }
  
  // Jalankan rotator teks secara aman
  initTextFadeRotator();
});

async function processData() {
  const textarea = document.getElementById('shopeeData');
  const rowCounter = document.getElementById('rowCounter');
  
  if (!textarea) return;
  const shopeeData = textarea.value.trim();
  
  const btn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const logDiv = document.getElementById('log');
  
  if (!shopeeData) {
    showCustomAlert('Silakan paste data Shopee & TikTok terlebih dahulu ya! 😊', '');
    return;
  }
  
  if (WEB_APP_URL.includes("MASUKKAN_URL")) {
    alert('Harap isi URL Web App Apps Script di dalam file script.js terlebih dahulu!');
    return;
  }
  
  if (btn) btn.disabled = true;
  if (btnSpinner) btnSpinner.style.display = 'block';
  if (btnText) btnText.innerText = 'Sedang Memproses & Sinkronisasi...';
  
  // TAHAP 1: Log awal koneksi
  if (logDiv) {
    logDiv.style.display = 'block';
    logDiv.innerText = '[' + new Date().toLocaleTimeString() + '] 🔄 Menghubungkan ke Google Drive...';
    logDiv.scrollTop = logDiv.scrollHeight;
  }
  
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (logDiv) {
    logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] 🔍 Memvalidasi format data Shopee & TikTok Shop...';
    logDiv.scrollTop = logDiv.scrollHeight;
  }
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (logDiv) {
      logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ⚡ Mengirim payload ke database...';
      logDiv.scrollTop = logDiv.scrollHeight;
    }

    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({ shopeeData: shopeeData })
    });
    
    const result = await response.text();
    
    try {
      const res = JSON.parse(result);
      if (res.status === 'success') {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (logDiv) {
          logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ✔️ Menerima respon sukses dari server.';
          logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        // TAHAP 2: Pecah pesan dari server dan cetak SATU PER SATU secara bertahap
        const messageLines = res.message.split('\n');
        for (let i = 0; i < messageLines.length; i++) {
          if (messageLines[i].trim() !== '') {
            await new Promise(resolve => setTimeout(resolve, 250));
            if (logDiv) {
              logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + ']   ▪️ ' + messageLines[i];
              logDiv.scrollTop = logDiv.scrollHeight;
            }
          }
        }
        
        // TAHAP 3: Baris penutup log
        await new Promise(resolve => setTimeout(resolve, 400));
        if (logDiv) {
          logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] 🔔 Silakan cek sheet Nota Masuk, Nota Selesai, TRX, dan Laporan.';
          logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        textarea.value = '';
        if (rowCounter) rowCounter.innerText = '📊 0 baris data';
        
        currentDownloadUrl = res.downloadUrl || "";
        
        setTimeout(() => {
          showCustomAlert(res.message, currentDownloadUrl);
        }, 1200);

      } else {
        if (logDiv) {
          logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ Error: ' + res.message;
          logDiv.scrollTop = logDiv.scrollHeight;
        }
        setTimeout(() => {
          showCustomAlert('Terjadi Kesalahan: ' + res.message, '');
        }, 800);
      }
    } catch(e) {
      if (logDiv) {
        logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ Gagal memproses respon server.';
        logDiv.scrollTop = logDiv.scrollHeight;
      }
    }
  } catch (error) {
    if (logDiv) {
      logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ System Error: ' + error.message;
      logDiv.scrollTop = logDiv.scrollHeight;
    }
  }
  
  if (btn) btn.disabled = false;
  if (btnSpinner) btnSpinner.style.display = 'none';
  if (btnText) btnText.innerText = '⚡ Tarik & Proses Data Sekarang (Ctrl + Enter)';
}

function showCustomAlert(message, downloadUrl) {
  const msgEl = document.getElementById('customAlertMessage');
  if (msgEl) msgEl.innerText = message;
  
  const downloadBtn = document.getElementById('downloadBtn');
  const progressBar = document.getElementById('downloadProgressBar');
  const downloadBtnText = document.getElementById('downloadBtnText');
  
  if (progressBar) progressBar.style.width = '0%';
  if (downloadBtnText) downloadBtnText.innerText = '📥 Download Laporan Excel';
  if (downloadBtn) downloadBtn.disabled = false;
  
  if (downloadBtn) {
    if (downloadUrl) {
      downloadBtn.style.display = 'flex';
    } else {
      downloadBtn.style.display = 'none';
    }
  }
  
  const modal = document.getElementById('customAlertModal');
  if (modal) modal.style.display = 'flex';
}

function downloadExcelWithProgress() {
  if (!currentDownloadUrl) {
    closeCustomAlert();
    return;
  }

  const downloadBtn = document.getElementById('downloadBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const progressBar = document.getElementById('downloadProgressBar');
  const downloadBtnText = document.getElementById('downloadBtnText');

  if (downloadBtn) downloadBtn.disabled = true;
  if (closeModalBtn) {
    closeModalBtn.style.opacity = '0.5';
    closeModalBtn.style.pointerEvents = 'none';
  }

  let progress = 0;
  
  const interval = setInterval(() => {
    progress += 2;
    if (progress <= 100) {
      if (progressBar) progressBar.style.width = progress + '%';
      if (downloadBtnText) downloadBtnText.innerText = `⏳ Menyiapkan File... (${progress}%)`;
    } else {
      clearInterval(interval);
      if (downloadBtnText) downloadBtnText.innerText = `✅ Berhasil Diunduh!`;
      
      window.open(currentDownloadUrl, '_blank');

      setTimeout(() => {
        if (closeModalBtn) {
          closeModalBtn.style.opacity = '1';
          closeModalBtn.style.pointerEvents = 'auto';
        }
        closeCustomAlert();
      }, 600);
    }
  }, 25);
}

function closeCustomAlert() {
  const modal = document.getElementById('customAlertModal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// 🔄 LOGIKA ANIMASI FADE-IN / FADE-OUT TEKS ROTATOR (SMOOTH)
// ==========================================
const fadeTexts = [
  "📦 SISTEM MANAJEMEN GUDANG ONLINE",
  "📑 Scan Resi atau No Transaksi dengan Cepat & Akurat",
  "⚡ Fitur Auto-Expand Baris & Konversi TikTok Aktif",
  "⚡ Pemrosesan & Sinkronisasi Transaksi Super Cepat",
  "🔥 Operasional Gudang Siap Berjalan Maksimal!",
  "💻 Database Cloud Teroptimasi & Aman",
];

let fadeIndex = 0;

function initTextFadeRotator() {
  const textEl = document.getElementById('rotating-text');
  if (!textEl) return;

  textEl.innerText = fadeTexts[fadeIndex];

  setInterval(() => {
    // Tahap 1: Efek pudar perlahan (Fade Out)
    textEl.style.opacity = 0;

    // Tahap 2: Tunggu 800ms (sinkron dengan CSS), lalu ganti teks dan munculkan kembali
    setTimeout(() => {
      fadeIndex = (fadeIndex + 1) % fadeTexts.length;
      textEl.innerText = fadeTexts[fadeIndex];
      textEl.style.opacity = 1;
    }, 800); // Disesuaikan dengan durasi transisi CSS

  }, 5000); // Teks tampil anteng dan dibaca lebih santai selama 5 detik sebelum berganti
}

