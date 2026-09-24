const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzFezXPUk7JWy-3xVrOcgEW_E7SmFMjs8MgJv6SO4lHwkghDNeZXx4gB_7zHJP-U2WN/exec";

let currentDownloadUrl = "";

// ==========================================
// 🛡️ DATABASE & VERIFIKASI OPERATOR SHIFT
// ==========================================
const operatorsProfile = {
  "IRGI": { id: "GND-001", name: "IRGI" },
  "BUDI": { id: "GND-002", name: "BUDI" },
  "SITI": { id: "GND-003", name: "SITI" }
  // Silakan tambahkan operator lain sesuai jadwal rotasi mingguan di sini
};

// Fungsi Mengatur Tampilan Header (Inisial Avatar & ID)
function setOperatorProfile(namaOperator) {
  const profile = operatorsProfile[namaOperator] || { id: "GND-999", name: namaOperator };
  
  const elName = document.getElementById('operatorName');
  const elId = document.getElementById('operatorId');
  const elAvatarBox = document.getElementById('operatorAvatarBox');

  if (elName) elName.innerText = profile.name;
  if (elId) elId.innerText = `ID: ${profile.id}`;
  
  if (elAvatarBox) {
    const initials = profile.name.slice(0, 2).toUpperCase();
    elAvatarBox.innerText = initials;
  }
}

// Fungsi Verifikasi Login dengan Animasi Sukses
function verifyOperatorLogin() {
  const inputEl = document.getElementById('inputOperatorKey');
  if (!inputEl) return;
  
  const inputVal = inputEl.value.trim().toUpperCase();
  const errorMsg = document.getElementById('loginErrorMsg');
  const alertBox = document.getElementById('loginAlertBox');
  const modal = document.getElementById('loginModal');
  
  let matchedName = null;
  for (let key in operatorsProfile) {
    if (key === inputVal || operatorsProfile[key].id === inputVal) {
      matchedName = key;
      break;
    }
  }

  if (matchedName) {
    // Simpan status login ke localStorage
    localStorage.setItem('gudang_active_operator', matchedName);
    
    // Tampilkan animasi alert sukses turun ke bawah
    if (alertBox) alertBox.style.top = '0px';
    
    // Terapkan profil operator ke header
    setOperatorProfile(matchedName);
    
    // Jeda sejenak untuk memperlihatkan animasi sukses, lalu tutup modal & izinkan akses sistem booting/utama
    setTimeout(() => {
      if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
      }
    }, 1000);

  } else {
    // Jika tidak valid / tidak sesuai jadwal
    if (errorMsg) {
      errorMsg.innerText = "❌ Nama atau ID tidak terdaftar dalam jadwal shift minggu ini!";
      errorMsg.style.display = 'block';
    }
  }
}
// Fungsi untuk menghitung jumlah baris & mendeteksi jenis transaksi secara otomatis berdasarkan pola
function updateRowCounter() {
  const textarea = document.getElementById('shopeeData');
  const rowCounter = document.getElementById('rowCounter');
  if (!textarea || !rowCounter) return;

  let text = textarea.value;
  let lines = text.split('\n').filter(line => line.trim() !== '');
  let totalLines = lines.length;

  if (totalLines === 0) {
    rowCounter.innerText = `📊 0 baris data`;
    return;
  }

  let shopeeCount = 0;
  let tiktokCount = 0;

  lines.forEach(rawLine => {
    let line = rawLine.trim();
    let upperLine = line.toUpperCase();

    // Pola Shopee: 14 karakter, diawali 6 digit angka (tanggal) + 8 karakter alfanumerik (Contoh: 260922N6CJPBGB)
    const shopeePattern = /^\d{6}[A-Z0-9]{8}$/i;

    // Pola TikTok Resi: Diawali prefiks kurir seperti JY, TG, GTL, atau mengandung kata tiktok
    const isTiktok = upperLine.startsWith('JY') || 
                     upperLine.startsWith('TG') || 
                     upperLine.startsWith('GTL') || 
                     upperLine.includes('TIKTOK');

    if (shopeePattern.test(line)) {
      shopeeCount++;
    } else if (isTiktok) {
      tiktokCount++;
    }
  });

  // Jika ada data yang terdeteksi polanya, tampilkan rincian di badge
  if (shopeeCount > 0 || tiktokCount > 0) {
    rowCounter.innerHTML = `📊 ${totalLines.toLocaleString()} baris <span style="font-size: 10px; opacity: 0.85; margin-left: 4px; font-weight: normal;">(Shopee: ${shopeeCount} | TikTok: ${tiktokCount})</span>`;
  } else {
    rowCounter.innerText = `📊 ${totalLines.toLocaleString()} baris data`;
  }
}

// Inisialisasi event listener dengan aman (menangani kondisi DOM yang sudah siap)
function initAppListeners() {
  const textarea = document.getElementById('shopeeData');
  if (textarea) {
    textarea.addEventListener('input', updateRowCounter);
    textarea.addEventListener('keyup', updateRowCounter);
    textarea.addEventListener('paste', () => {
      setTimeout(updateRowCounter, 100);
    });
  }
}

// Cek status DOM agar event listener langsung terpasang tanpa menunggu DOMContentLoaded yang sudah lewat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppListeners);
} else {
  initAppListeners();
}

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

  // ==========================================
  // 🔍 VALIDASI KEYWORD
  // ==========================================
  const lowerData = shopeeData.toLowerCase();
  const hasValidIndicator = lowerData.includes('shopee') || 
                            lowerData.includes('tiktok') || 
                            lowerData.includes('pesanan') || 
                            lowerData.includes('order') || 
                            lowerData.includes('no.') ||
                            shopeeData.split('\n').length > 1; 

  if (!hasValidIndicator) {
    showToast("⚠️ Peringatan: Format data terlihat tidak valid. Pastikan Anda mempaste laporan resmi Shopee/TikTok.", "warning");
  }
  // ==========================================
  
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
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        const formattedSyncTime = `${now.toLocaleDateString('id-ID', dateOptions)} - ${now.toLocaleTimeString('id-ID', timeOptions)} WIB`;
        
        // Simpan ke localStorage agar aman saat halaman di-refresh
        localStorage.setItem('gudang_last_sync', formattedSyncTime);
        updateLastSyncDisplay(formattedSyncTime);
        
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

        playSuccessSound();
        addCumulativeTotal(messageLines.length);
        
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
let rotatorInterval = null;

function initTextFadeRotator() {
  const textEl = document.getElementById('rotating-text');
  if (!textEl) return;

  if (rotatorInterval) clearInterval(rotatorInterval);

  textEl.innerText = fadeTexts[fadeIndex];

  rotatorInterval = setInterval(() => {
    textEl.style.opacity = 0;

    setTimeout(() => {
      fadeIndex = (fadeIndex + 1) % fadeTexts.length;
      textEl.innerText = fadeTexts[fadeIndex];
      textEl.style.opacity = 1;
    }, 800); 

  }, 5000); 
}

// ==========================================
// 🌐 MONITORING STATUS JARINGAN & TOAST NOTIFIKASI ESTETIK
// ==========================================
function showToast(message, type = "warning") {
  let toastContainer = document.getElementById('custom-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'custom-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  
  let bgColor = '#1e293b';
  let borderColor = '#334155';
  let icon = '⚠️';
  
  if (type === 'error') {
    bgColor = '#7f1d1d';
    borderColor = '#991b1b';
    icon = '❌';
  } else if (type === 'success') {
    bgColor = '#065f46';
    borderColor = '#047857';
    icon = '✅';
  } else if (type === 'warning') {
    bgColor = '#78350f';
    borderColor = '#92400e';
    icon = '⚠️';
  }

  toast.style.cssText = `
    background: ${bgColor};
    border: 1px solid ${borderColor};
    color: #f8fafc;
    padding: 14px 18px;
    border-radius: 10px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    max-width: 420px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-15px) scale(0.98);
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  
  toast.innerHTML = `
    <span style="font-size: 18px; flex-shrink: 0;">${icon}</span>
    <div style="flex: 1; line-height: 1.4; word-break: break-word;">${message}</div>
  `;
  
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  }, 20);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-15px) scale(0.98)';
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 4500);
}

function updateNetworkStatus() {
  const netStatusEl = document.getElementById('net-status-text');
  
  if (navigator.onLine) {
    if (netStatusEl) {
      netStatusEl.innerText = "Online";
      netStatusEl.style.color = "#22c55e";
    }
    showToast("Koneksi internet kembali terhubung! Database siap disinkronkan.", "success");
  } else {
    if (netStatusEl) {
      netStatusEl.innerText = "Offline (Terputus)";
      netStatusEl.style.color = "#ef4444";
    }
    showToast("PERHATIAN: Koneksi internet terputus! Sinkronisasi database tertunda.", "warning");
  }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

window.addEventListener('DOMContentLoaded', () => {
  const netStatusEl = document.getElementById('net-status-text');
  if (netStatusEl) {
    if (navigator.onLine) {
      netStatusEl.innerText = "Online";
      netStatusEl.style.color = "#22c55e";
    } else {
      netStatusEl.innerText = "Offline (Terputus)";
      netStatusEl.style.color = "#ef4444";
    }
  }
});
// ==========================================
// ⏱️ MANAJEMEN WAKTU SINKRONISASI TERAKHIR (LAST SYNC)
// ==========================================
function updateLastSyncDisplay(timeString) {
  const lastSyncEl = document.getElementById('last-sync-text');
  if (lastSyncEl) {
    if (timeString) {
      lastSyncEl.innerText = timeString;
      lastSyncEl.style.color = "#38bdf8";
    } else {
      lastSyncEl.innerText = "Belum ada";
      lastSyncEl.style.color = "#e2e8f0";
    }
  }
}

function initLastSync() {
  const savedLastSync = localStorage.getItem('gudang_last_sync');
  if (savedLastSync) {
    updateLastSyncDisplay(savedLastSync);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLastSync);
} else {
  initLastSync();
}

// ==========================================
// 📖 KONTROL MODAL PANDUAN FORMAT
// ==========================================
function openGuideModal() {
  const modal = document.getElementById('guideModal');
  if (modal) modal.style.display = 'flex';
}

function closeGuideModal() {
  const modal = document.getElementById('guideModal');
  if (modal) modal.style.display = 'none';
}

// Fungsi otomatis mengambil data dari Clipboard komputer
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    const textarea = document.getElementById('shopeeData');
    
    if (textarea) {
      textarea.value = text;
      textarea.focus();
      
      if (typeof updateRowCounter === 'function') {
        updateRowCounter();
      }
      
      console.log("[SYSTEM] Berhasil menempelkan data dari clipboard.");
    }
  } catch (err) {
    alert("Gagal membaca clipboard secara otomatis. Pastikan browser diizinkan mengakses clipboard atau gunakan shortcut manual (Ctrl + V).");
    console.error("Clipboard error: ", err);
  }
}
// ==========================================
// FITUR TAMBAHAN: AUDIO SUKSES & TOTAL AKUMULATOR
// ==========================================
function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.1); // G5

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.log("Audio not supported or restricted by browser policy.", e);
  }
}

function getCumulativeTotal() {
  return parseInt(localStorage.getItem('gudang_total_alltime') || '0', 10);
}

function addCumulativeTotal(amount) {
  let currentTotal = getCumulativeTotal();
  let newTotal = currentTotal + amount;
  localStorage.setItem('gudang_total_alltime', newTotal);
  renderCumulativeCounter();
}

function renderCumulativeCounter() {
  const badge = document.getElementById('dailyCounterBadge');
  if (badge) {
    badge.innerText = `📦 Total: ${getCumulativeTotal().toLocaleString()} paket`;
  }
}

// ==========================================
// 🚀 PENGECEKAN STATUS LOGIN & INISIALISASI UTAMA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderCumulativeCounter();
  
  // Cek apakah operator sudah pernah login di browser ini
  const savedOperator = localStorage.getItem('gudang_active_operator');
  const modal = document.getElementById('loginModal');

  if (savedOperator && operatorsProfile[savedOperator]) {
    // Jika sudah login, sembunyikan modal dan set profil
    if (modal) modal.style.display = 'none';
    setOperatorProfile(savedOperator);
  } else {
    // Jika belum login, pastikan modal verifikasi terbuka menutupi layar
    if (modal) modal.style.display = 'flex';
  }
});
