// Import script Firebase SDK untuk Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Inisialisasi Firebase di background Service Worker
firebase.initializeApp({
  apiKey: "API_KEY_KAMU_DARI_FIREBASE",
  projectId: "PROJECT_ID_KAMU",
  messagingSenderId: "SENDER_ID_KAMU",
  appId: "APP_ID_KAMU"
});

const messaging = firebase.messaging();

// Menangani pesan masuk saat aplikasi tertutup/di background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Menerima pesan background: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // Sesuaikan ikon aplikasi kamu
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
