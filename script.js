const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzFezXPUk7JWy-3xVrOcgEW_E7SmFMjs8MgJv6SO4lHwkghDNeZXx4gB_7zHJP-U2WN/exec";

const textarea = document.getElementById('shopeeData');
const rowCounter = document.getElementById('rowCounter');
let currentDownloadUrl = "";

function updateRowCounter() {
  let lines = textarea.value.split('\n').filter(line => line.trim() !== '');
  rowCounter.innerText = `📊 ${lines.length.toLocaleString()} baris data`;
}

textarea.addEventListener('input', updateRowCounter);

async function processData() {
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
  logDiv.scrollTop = logDiv.scrollHeight;
  
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({ shopeeData: shopeeData })
    });
    
    const result = await response.text();
    
    try {
      const res = JSON.parse(result);
      if (res.status === 'success') {
        await new Promise(resolve => setTimeout(resolve, 300));
        logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ✔️ ';
        
        // PECAH TEKS PESAN PER BARIS AGAR MUNCULNYA BERTAHAP ALGERIAN/TERMINAL STYLE
        const messageLines = res.message.split('\n');
        for (let i = 0; i < messageLines.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 180)); // Jeda 180ms tiap baris
          logDiv.innerText += messageLines[i] + (i < messageLines.length - 1 ? '\n' : '');
          logDiv.scrollTop = logDiv.scrollHeight; // Auto scroll ke baris terbaru
        }
        
        // Jeda sebentar sebelum baris penutup
        await new Promise(resolve => setTimeout(resolve, 300));
        logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] 🔔 Silakan cek sheet Nota Masuk, Nota Selesai, TRX, dan Laporan.';
        logDiv.scrollTop = logDiv.scrollHeight;
        
        textarea.value = '';
        rowCounter.innerText = '📊 0 baris data';
        
        currentDownloadUrl = res.downloadUrl || "";
        
        // Jeda agak panjang (800ms) sebelum popup modal muncul supaya kamu sempat baca log-nya dulu
        setTimeout(() => {
          showCustomAlert(res.message, currentDownloadUrl);
        }, 800);

      } else {
        logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ Error: ' + res.message;
        logDiv.scrollTop = logDiv.scrollHeight;
        setTimeout(() => {
          showCustomAlert('Terjadi Kesalahan: ' + res.message, '');
        }, 500);
      }
    } catch(e) {
      logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ Gagal memproses respon server.';
      logDiv.scrollTop = logDiv.scrollHeight;
    }
  } catch (error) {
    logDiv.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ System Error: ' + error.message;
    logDiv.scrollTop = logDiv.scrollHeight;
  }
  
  btn.disabled = false;
  btnSpinner.style.display = 'none';
  btnText.innerText = '⚡ Tarik & Proses Data Sekarang';
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
  
  const interval = setInterval(() => {
    progress += 2;
    if (progress <= 100) {
      progressBar.style.width = progress + '%';
      downloadBtnText.innerText = `⏳ Menyiapkan File... (${progress}%)`;
    } else {
      clearInterval(interval);
      downloadBtnText.innerText = `✅ Berhasil Diunduh!`;
      
      window.open(currentDownloadUrl, '_blank');

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
