const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzFezXPUk7JWy-3xVrOcgEW_E7SmFMjs8MgJv6SO4lHwkghDNeZXx4gB_7zHJP-U2WN/exec";

const textarea = document.getElementById('shopeeData');
const rowCounter = document.getElementById('rowCounter');
let currentDownloadUrl = "";

function updateRowCounter() {
  let lines = textarea.value.split('\n').filter(line => line.trim() !== '');
  rowCounter.innerText = `📊 ${lines.length.toLocaleString()} baris data`;
}

textarea.addEventListener('input', updateRowCounter);

function processData() {
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
  
  btn.disabled = true;
  btnSpinner.style.display = 'block';
  btnText.innerText = 'Sedang Memproses & Sinkronisasi...';
  
  logDiv.style.display = 'block';
  logDiv.innerText = '[' + new Date().toLocaleTimeString() + '] 🔄 Menghubungkan ke Google Drive & Memproses data...';
  
  fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify({ shopeeData: shopeeData })
  })
  .then(response => response.text())
  .then(result => {
    try {
      const res = JSON.parse(result);
      if (res.status === 'success') {
        logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ✔️ ' + res.message;
        logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] 🔔 Silakan cek sheet Nota Masuk, Nota Selesai, TRX, dan Laporan.';
        textarea.value = '';
        rowCounter.innerText = '📊 0 baris data';
        
        currentDownloadUrl = res.downloadUrl || "";
        showCustomAlert(res.message, currentDownloadUrl);

      } else {
        logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ Error: ' + res.message;
        showCustomAlert('Terjadi Kesalahan: ' + res.message, '');
      }
    } catch(e) {
      logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ Gagal memproses respon server.';
    }
    
    btn.disabled = false;
    btnSpinner.style.display = 'none';
    btnText.innerText = '⚡ Tarik & Proses Data Sekarang';
  })
  .catch(error => {
    logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ System Error: ' + error.message;
    
    btn.disabled = false;
    btnSpinner.style.display = 'none';
    btnText.innerText = '⚡ Tarik & Proses Data Sekarang';
  });
}

function showCustomAlert(message, downloadUrl) {
  document.getElementById('customAlertMessage').innerText = message;
  const downloadBtn = document.getElementById('downloadBtn');
  const progressBar = document.getElementById('downloadProgressBar');
  const downloadBtnText = document.getElementById('downloadBtnText');
  
  // Reset state tombol download
  progressBar.style.width = '0%';
  downloadBtnText.innerText = '📥 Download Laporan Excel';
  downloadBtn.disabled = false;
  
  if (downloadUrl) {
    downloadBtn.style.display = 'flex';
  } else {
    downloadBtn.style.display = 'none';
  }
  
  document.getElementById('customAlertModal').style.display = 'flex';
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

  // Matikan interaksi sementara proses berjalan
  downloadBtn.disabled = true;
  closeModalBtn.style.opacity = '0.5';
  closeModalBtn.style.pointerEvents = 'none';

  let progress = 0;
  
  // Jalankan animasi progress bar halus dari 0% ke 100% (total waktu ~1.5 detik)
  const interval = setInterval(() => {
    progress += 2;
    if (progress <= 100) {
      progressBar.style.width = progress + '%';
      downloadBtnText.innerText = `⏳ Menyiapkan File... (${progress}%)`;
    } else {
      clearInterval(interval);
      downloadBtnText.innerText = `✅ Berhasil Diunduh!`;
      
      // Buka link download (Chrome akan otomatis nanganin download di pojok kanan atas)
      window.open(currentDownloadUrl, '_blank');

      // Tutup modal secara otomatis setelah sebentar
      setTimeout(() => {
        closeModalBtn.style.opacity = '1';
        closeModalBtn.style.pointerEvents = 'auto';
        closeCustomAlert();
      }, 600);
    }
  }, 25);
}

function closeCustomAlert() {
  document.getElementById('customAlertModal').style.display = 'none';
}
