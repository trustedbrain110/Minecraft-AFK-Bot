const mineflayer = require('mineflayer');
const express = require('express');
const config = require('./config.json');

// Render / UptimeRobot Keep-Alive Web Server
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('AFK Bot Online Hai!');
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

// Bot Setup
function createBot() {
  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    version: false
  });

  bot.on('spawn', () => {
    console.log('Bot server me join ho gaya hai!');

    // Spawn hone ke 2 second baad auto-register aur login command bhejega
    setTimeout(() => {
      bot.chat('/register brain12345 brain12345');
      bot.chat('/login brain12345');
    }, 2000);

    // Anti-AFK Jump Loop (Har 30 seconds baad)
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 30000);
  });

  // Chat message listener (Agar server /login maange toh auto answer kare)
  bot.on('message', (message) => {
    const msg = message.toString().toLowerCase();
    if (msg.includes('/login')) {
      bot.chat('/login brain12345');
    } else if (msg.includes('/register')) {
      bot.chat('/register brain12345 brain12345');
    }
  });

  bot.on('end', () => {
    console.log('Bot disconnect hua, 5 seconds me reconnect ho raha hai...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.log('Bot Error:', err);
  });
}

createBot();
