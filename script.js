const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzukrX8QXwYKbgXIwyskJMHtuNS509kL5fTgK_WAxgQ7x4FoCAxHuumM-Dc02XA8zIY/exec";

let currentDownloadUrl = "";
const SCRIPT_URL_REKAPAN = "https://script.google.com/macros/s/AKfycbzLud58sY-o4azbshEww7-JSXCLoZ2sbmALaS2z6aRhmT-Q_vvXCzlDn4NqzBCedZpS/exec";

// ==========================================
// 🎨 SCRIPT PENGATUR TOGGLE TEMA DARK / LIGHT
// ==========================================
function toggleDarkLightMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gudang_theme', newTheme);
    updateThemeButtonUI(newTheme);
}

function updateThemeButtonUI(theme) {
    const thumbEl = document.getElementById('themeSwitchThumb');
    
    if (theme === 'light') {
        if (thumbEl) {
            thumbEl.style.transform = 'translateX(26px)';
            thumbEl.style.background = '#f59e0b';
            thumbEl.innerText = '☀️';
        }
    } else {
        if (thumbEl) {
            thumbEl.style.transform = 'translateX(0px)';
            thumbEl.style.background = '#38bdf8';
            thumbEl.innerText = '🌙';
        }
    }
}

// Otomatis terapkan tema terakhir saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('gudang_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButtonUI(savedTheme);
});

// ==========================================
// 🛡️ DATABASE & VERIFIKASI OPERATOR SHIFT
// ==========================================
const operatorsProfile = {
  "IRGI": { 
    id: "GDN-001", 
    name: "IRGI", 
    photo: "https://raw.githubusercontent.com/Nov-dev02/Gudang-Web-App/main/img/IRGI.jpg" 
  },
  "NOVAN": { 
    id: "GDN-002", 
    name: "NOVAN", 
    photo: "" 
  },
  "DWI": { 
    id: "GDN-003", 
    name: "DWI", 
    photo: "" 
  },
  "ERIKA": { 
    id: "GDN-004", 
    name: "ERIKA", 
    photo: "" 
  }
};

function setOperatorProfile(namaOperator) {
    const cleanName = namaOperator ? namaOperator.toUpperCase() : "";
    const profile = operatorsProfile[cleanName] || { id: "GDN-999", name: namaOperator, photo: "" };
    
    const elName = document.getElementById('operatorName');
    const elId = document.getElementById('operatorId');
    const elAvatarBox = document.getElementById('operatorAvatarBox');
    
    if (elName) elName.innerText = profile.name;
    if (elId) elId.innerText = `ID: ${profile.id}`;
    
    if (elAvatarBox) {
        if (profile.photo && profile.photo.trim() !== "") {
            elAvatarBox.innerHTML = `<img src="${profile.photo}" alt="${profile.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 3px;">`;
            elAvatarBox.style.background = 'transparent';
        } else {
            const initials = profile.name.slice(0, 2).toUpperCase();
            elAvatarBox.innerHTML = initials;
            elAvatarBox.style.background = 'rgba(56, 189, 248, 0.3)';
        }
    }
}

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
    const sessionData = {
      name: matchedName,
      loginTime: new Date().getTime()
    };
    localStorage.setItem('gudang_active_operator', JSON.stringify(sessionData));
    
    if (alertBox) alertBox.style.top = '0px';
    setOperatorProfile(matchedName);
    
    setTimeout(() => {
      if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { 
          modal.style.display = 'none'; 
          
          const operatorKey = matchedName.toUpperCase();
          const welcomeAudio = new Audio(`https://raw.githubusercontent.com/Nov-dev02/Gudang-Web-App/main/audio/${operatorKey}.mp3?v=99`);
          welcomeAudio.volume = 0.9;
          welcomeAudio.play().catch(err => console.log("Audio play blocked/error:", err));

        }, 300);
      }
    }, 1000);

  } else {
    if (errorMsg) {
      errorMsg.innerText = "❌ Nama atau ID tidak terdaftar dalam jadwal shift minggu ini!";
      errorMsg.style.display = 'block';
    }
  }
}

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

    const shopeePattern = /^\d{6}[A-Z0-9]{8}$/i;
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

  if (shopeeCount > 0 || tiktokCount > 0) {
    rowCounter.innerHTML = `📊 ${totalLines.toLocaleString()} baris <span style="font-size: 10px; opacity: 0.85; margin-left: 4px; font-weight: normal;">(Shopee: ${shopeeCount} | TikTok: ${tiktokCount})</span>`;
  } else {
    rowCounter.innerText = `📊 ${totalLines.toLocaleString()} baris data`;
  }
}

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
  const logTextSpan = document.getElementById('logText');
  
  if (!shopeeData) {
    showCustomAlert('Silakan paste data Shopee & TikTok terlebih dahulu ya! 😊', '');
    return;
  }

  if (btn) btn.disabled = true;
  if (btnSpinner) btnSpinner.style.display = 'block';
  if (btnText) btnText.innerHTML = `
    <div style="display: inline-flex; align-items: center; gap: 8px;">
      <div class="modern-spinner"></div>
      <span>[ ••• ] Sedang Memproses & Sinkronisasi<span class="bouncing-dots"><span>.</span><span>.</span><span>.</span></span></span>
    </div>
  `;
  
  if (logDiv) logDiv.style.display = 'block';
  if (logTextSpan) logTextSpan.innerText = '[' + new Date().toLocaleTimeString() + '] 🔄 Menghubungkan ke Cloud Database Google Drive...';
  if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
  
  await new Promise(resolve => setTimeout(resolve, 600));
  
  if (logTextSpan) logTextSpan.innerText += '\n[' + new Date().toLocaleTimeString() + '] 🔍 Memvalidasi format data Shopee & TikTok Shop...';
  if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 700));
    if (logTextSpan) logTextSpan.innerText += '\n[' + new Date().toLocaleTimeString() + '] ⚡ Mengirim payload ke database... (Mohon tunggu sebentar)';
    if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ shopeeData: shopeeData }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server merespons dengan status error HTTP: ${response.status}`);
    }

    const result = await response.text();
    let res = JSON.parse(result);

    if (res.status === 'success') {
      await new Promise(resolve => setTimeout(resolve, 400));
      if (logTextSpan) logTextSpan.innerText += '\n[' + new Date().toLocaleTimeString() + '] ✔️ Menerima respon sukses dari server pusat.';
      if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;

      const now = new Date();
      const formattedSyncTime = `${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB`;
      
      localStorage.setItem('gudang_last_sync', formattedSyncTime);
      updateLastSyncDisplay(formattedSyncTime);
      
      const messageLines = res.message ? res.message.split('\n') : [];
      for (let i = 0; i < messageLines.length; i++) {
        if (messageLines[i].trim() !== '') {
          await new Promise(resolve => setTimeout(resolve, 200));
          if (logTextSpan) logTextSpan.innerText += '\n[' + new Date().toLocaleTimeString() + ']   ▪ ' + messageLines[i];
          if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
        }
      }
      
      textarea.value = '';
      if (rowCounter) rowCounter.innerText = '📊 0 baris data';

      playSuccessSound();
      addCumulativeTotal(messageLines.length);
      
      currentDownloadUrl = res.downloadUrl || res.fileUrl || res.spreadsheetUrl || "";
      window.globalServerResponse = res;
      
      setTimeout(() => {
        const modalKonfirmasi = document.getElementById('modalKonfirmasi');
        if (modalKonfirmasi) {
          modalKonfirmasi.style.display = 'flex';
        } else {
          showCustomAlert(res.message || "Transaksi selesai.", currentDownloadUrl);
        }
      }, 1200);

    } else {
      if (logTextSpan) logTextSpan.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ Error: ' + res.message;
      if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
      setTimeout(() => { showCustomAlert('Terjadi Kesalahan: ' + res.message, ''); }, 800);
    }

  } catch (error) {
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = "Batas waktu tunggu habis (> 2 menit). Proses server terlalu lama atau koneksi terputus.";
    }
    if (logTextSpan) logTextSpan.innerText += '\n[' + new Date().toLocaleTimeString() + '] ❌ System Error: ' + errorMessage;
    if (logDiv) logDiv.scrollTop = logDiv.scrollHeight;
    setTimeout(() => { showCustomAlert('Terjadi Kesalahan: ' + errorMessage, ''); }, 800);
  }
  
  if (btn) btn.disabled = false;
  if (btnSpinner) btnSpinner.style.display = 'none';
  if (btnText) btnText.innerText = '⚡ Tarik & Proses Data Sekarang (Ctrl + Enter)';
}

function showCustomAlert(message, downloadUrl) {
  currentDownloadUrl = downloadUrl || "";
  const msgEl = document.getElementById('customAlertMessage');
  if (msgEl) msgEl.innerText = message;
  const downloadBtn = document.getElementById('downloadBtn');
  const progressBar = document.getElementById('downloadProgressBar');
  const downloadBtnText = document.getElementById('downloadBtnText');
  
  if (progressBar) progressBar.style.width = '0%';
  if (downloadBtnText) downloadBtnText.innerText = '📥 Download Laporan Excel';
  if (downloadBtn) downloadBtn.disabled = false;
  
  if (downloadBtn) {
    downloadBtn.style.display = (downloadUrl && downloadUrl.trim() !== "") ? 'flex' : 'none';
  }
  
  const modal = document.getElementById('customAlertModal');
  if (modal) modal.style.display = 'flex';
}

async function downloadExcelWithProgress(serverResponse) {
  if (serverResponse) {
    window.globalServerResponse = serverResponse;
  }

  const targetUrl = currentDownloadUrl || (window.globalServerResponse && window.globalServerResponse.downloadUrl) || "";
  if (!targetUrl) {
    alert("URL download belum tersedia dari server.");
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

  let progress = 10;
  if (progressBar) progressBar.style.width = progress + '%';
  if (downloadBtnText) downloadBtnText.innerText = `⏳ Menyiapkan Unduhan... (${progress}%)`;

  try {
    progress = 40;
    if (progressBar) progressBar.style.width = progress + '%';
    if (downloadBtnText) downloadBtnText.innerText = `⏳ Mengambil Berkas... (${progress}%)`;

    const response = await fetch(targetUrl);
    const blobData = await response.blob();

    progress = 80;
    if (progressBar) progressBar.style.width = progress + '%';
    if (downloadBtnText) downloadBtnText.innerText = `⏳ Merakit Berkas... (${progress}%)`;

    const months = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
    const now = new Date();
    const day = ("0" + now.getDate()).slice(-2);
    const dynamicFileName = "TRANSAKSI GUDANG " + day + " " + months[now.getMonth()] + " " + now.getFullYear() + ".xlsx";

    const blobUrl = window.URL.createObjectURL(blobData);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = dynamicFileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    progress = 100;
    if (progressBar) progressBar.style.width = progress + '%';
    if (downloadBtnText) downloadBtnText.innerText = `✅ Berhasil Diunduh!`;

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      if (closeModalBtn) {
        closeModalBtn.style.opacity = '1';
        closeModalBtn.style.pointerEvents = 'auto';
      }
      closeCustomAlert();
    }, 600);

  } catch (err) {
    console.error("Gagal mendownload file:", err);
    alert("Terjadi kesalahan saat mengunduh file Excel.");
    if (downloadBtn) downloadBtn.disabled = false;
    if (closeModalBtn) {
      closeModalBtn.style.opacity = '1';
      closeModalBtn.style.pointerEvents = 'auto';
    }
  }
}

function closeCustomAlert() {
  const modal = document.getElementById('customAlertModal');
  if (modal) modal.style.display = 'none';
}

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

function updateLastSyncDisplay(timeString) {
  const lastSyncEl = document.getElementById('last-sync-text');
  if (lastSyncEl) {
    if (timeString) { lastSyncEl.innerText = timeString; lastSyncEl.style.color = "#38bdf8"; }
    else { lastSyncEl.innerText = "Belum ada"; lastSyncEl.style.color = "#e2e8f0"; }
  }
}

function initLastSync() {
  const savedLastSync = localStorage.getItem('gudang_last_sync');
  if (savedLastSync) updateLastSyncDisplay(savedLastSync);
}

document.addEventListener('DOMContentLoaded', initLastSync);

function openGuideModal() { const modal = document.getElementById('guideModal'); if (modal) modal.style.display = 'flex'; }
function closeGuideModal() { const modal = document.getElementById('guideModal'); if (modal) modal.style.display = 'none'; }

function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
}

function getCumulativeTotal() { return parseInt(localStorage.getItem('gudang_total_alltime') || '0', 10); }
function addCumulativeTotal(amount) {
  let newTotal = getCumulativeTotal() + amount;
  localStorage.setItem('gudang_total_alltime', newTotal);
  renderCumulativeCounter();
}
function renderCumulativeCounter() {
  const badge = document.getElementById('dailyCounterBadge');
  if (badge) badge.innerText = `📦 Total: ${getCumulativeTotal().toLocaleString()} paket`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCumulativeCounter();
  
  const savedSession = localStorage.getItem('gudang_active_operator');
  const modal = document.getElementById('loginModal');
  
  if (savedSession) {
    try {
      let operatorName = "", loginTime = 0;
      if (savedSession.startsWith('{')) {
        const session = JSON.parse(savedSession);
        operatorName = session.name ? session.name.toUpperCase() : "";
        loginTime = session.loginTime || 0;
      } else {
        operatorName = savedSession.toUpperCase();
        loginTime = new Date().getTime();
      }
      
      const currentTime = new Date().getTime();
      const oneWeekMilliseconds = 7 * 24 * 60 * 60 * 1000;
      
      if ((currentTime - loginTime) < oneWeekMilliseconds && operatorsProfile[operatorName]) {
        setOperatorProfile(operatorName);
        if (modal) modal.style.display = 'none';
      } else {
        localStorage.removeItem('gudang_active_operator');
        if (modal) modal.style.display = 'flex';
      }
    } catch (e) {
      localStorage.removeItem('gudang_active_operator');
      if (modal) modal.style.display = 'flex';
    }
  } else {
    if (modal) modal.style.display = 'flex';
  }
});

function pilihYaPending() {
  document.getElementById('modalKonfirmasi').style.display = 'none';
  document.getElementById('modalInputPending').style.display = 'flex';
  const inputEl = document.getElementById('inputNoTrx');
  if (inputEl) inputEl.focus();
}

function selesaiDanDownload() {
  const modalInput = document.getElementById('modalInputPending');
  if (modalInput) modalInput.style.display = 'none';
  
  const msg = (window.globalServerResponse && window.globalServerResponse.message) 
    ? window.globalServerResponse.message 
    : "✅ Transaksi selesai dan laporan berhasil diproses!";
    
  const url = currentDownloadUrl || (window.globalServerResponse && (window.globalServerResponse.downloadUrl || window.globalServerResponse.fileUrl || window.globalServerResponse.spreadsheetUrl)) || "";
  
  showCustomAlert(msg, url);
}

async function kirimAksiPendingCancel(actionType) {
  const inputEl = document.getElementById('inputNoTrx');
  const noTransaksi = inputEl ? inputEl.value.trim() : '';
  
  if (!noTransaksi) {
    alert("Harap masukkan atau scan Nomor Transaksi terlebih dahulu!");
    return;
  }

  const btnId = actionType === 'pending' ? 'btnSetPending' : 'btnSetCancel';
  const btn = document.getElementById(btnId);
  const actionLabel = actionType === 'pending' ? 'Pending' : 'Cancel';

  const toast = document.getElementById('glassToast');
  const spinnerContainer = document.getElementById('toastIconContainer');
  const toastTitle = document.getElementById('toastTitle');
  const toastDesc = document.getElementById('toastDesc');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `Memproses<span class="bouncing-dots"><span>.</span><span>.</span><span>.</span></span>`;
  }

  if (spinnerContainer) {
    spinnerContainer.innerHTML = '<div class="gradient-spinner"></div>';
    spinnerContainer.className = 'toast-icon-wrapper';
  }
  if (toastTitle) toastTitle.textContent = `Memproses data (${actionLabel})...`;
  if (toastDesc) toastDesc.innerHTML = `Sabar ya gais, lagi proses ${actionLabel.toLowerCase()} data gudang<span class="bouncing-dots"><span>.</span><span>.</span><span>.</span></span>`;
  if (toast) toast.classList.add('show');

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: actionType,
        noTransaksi: noTransaksi
      })
    });

    const text = await response.text();
    const res = JSON.parse(text);

    if (res.status === 'success') {
      window.globalServerResponse = res;
      const foundUrl = res.downloadUrl || res.fileUrl || res.spreadsheetUrl;
      if (foundUrl) {
        currentDownloadUrl = foundUrl;
      }

      const listLog = document.getElementById('listLogPending');
      if (listLog) {
        if (listLog.children.length === 1 && listLog.children[0].style.color === 'rgb(100, 116, 139)') {
          listLog.innerHTML = ''; 
        }
        const badgeColor = actionType === 'pending' ? '#f59e0b' : '#ef4444';
        listLog.innerHTML += `<li><b style="color:${badgeColor}">[${actionType.toUpperCase()}]</b> TRX: ${noTransaksi}</li>`;
      }

      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
      }

      if (spinnerContainer) {
        spinnerContainer.innerHTML = '<span class="checkmark">✓</span>';
        spinnerContainer.className = 'toast-icon-wrapper success';
      }
      if (toastTitle) toastTitle.textContent = 'Berhasil diproses!';
      if (toastDesc) toastDesc.textContent = res.message || `Status gudang berhasil di-${actionLabel.toLowerCase()}.`;

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Set ${actionLabel}`;
      }

      setTimeout(() => {
        if (toast) toast.classList.remove('show');
        showCustomAlert(res.message || `Transaksi ${noTransaksi} berhasil diproses.`, foundUrl);
      }, 1500);

    } else { 
      throw new Error(res.message || "Gagal memproses data.");
    }

  } catch (error) { 
    alert("Terjadi kesalahan: " + error.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `Set ${actionLabel}`;
    }
    if (toast) toast.classList.remove('show');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const inputTrx = document.getElementById('inputNoTrx');
  if (inputTrx) {
    inputTrx.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        kirimAksiPendingCancel('pending');
      }
    });
  }

  const inputLogin = document.getElementById('inputOperatorKey');
  if (inputLogin) {
    inputLogin.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyOperatorLogin();
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const gate = document.getElementById('tap-to-enter-gate');
    
    if (gate) {
        gate.addEventListener('click', () => {
            const welcomeAudio = new Audio(`https://raw.githubusercontent.com/Nov-dev02/Gudang-Web-App/main/audio/Welcome.mp3?v=${new Date().getTime()}`);
            welcomeAudio.volume = 0.9;
            welcomeAudio.play().catch(err => console.log("Audio welcome error:", err));

            gate.style.opacity = '0';
            setTimeout(() => {
                gate.style.display = 'none';
            }, 500);
        }, { once: true });
    }
});

async function ambilDanPasteRekapan(btn) {
  const originalText = btn ? btn.innerHTML : '⚡ Sync';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Loading...';
  }

  try {
    const response = await fetch(SCRIPT_URL_REKAPAN);
    const res = await response.json();
    
    if (res.error) {
      alert("⚠ Error: " + res.error);
      return;
    }
    
    if (!res.transactions || res.transactions.length === 0) {
      alert("⚠️ Tidak ada No Transaksi yang ditemukan di Kolom H sheet 'ALL' spreadsheet TRANSAKSI JUNI!");
      return;
    }
    
    const teksGabungan = res.transactions.join('\n');
    const textarea = document.querySelector('textarea'); 
    if (textarea) {
      textarea.value = teksGabungan;
      textarea.dispatchEvent(new Event('input'));
    } else {
      alert("⚠️ Kotak teks (textarea) tidak ditemukan di halaman ini!");
    }
    
  } catch (err) {
    alert("❌ Gagal mengambil data rekapan: " + err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}
