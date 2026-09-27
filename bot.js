const mineflayer = require('mineflayer');
const express = require('express');
const { SocksClient } = require('socks');
const config = require('./config.json');

// --- WEBSHARE PROXY DETAILS ---
const PROXY_HOST = '45.38.107.97';
const PROXY_PORT = 6014;
const PROXY_USER = 'wmexdmhl';
const PROXY_PASS = '83taok1zi5rx';
// ------------------------------

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('BlockSMP AFK Bot Online!');
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

function createBot() {
  console.log('Connecting to BlockSMP server...');

  const options = {
    proxy: {
      host: PROXY_HOST,
      port: parseInt(PROXY_PORT),
      type: 5
    },
    destination: {
      host: config.serverHost,
      port: parseInt(config.serverPort)
    },
    command: 'connect'
  };

  if (PROXY_USER && PROXY_PASS) {
    options.proxy.userId = PROXY_USER;
    options.proxy.password = PROXY_PASS;
  }

  SocksClient.createConnection(options, (err, info) => {
    if (err) {
      console.log('Proxy Connection Error:', err.message);
      setTimeout(createBot, 5000);
      return;
    }

    console.log('Proxy connected! Launching bot...');

    const bot = mineflayer.createBot({
      stream: info.socket,
      host: config.serverHost,
      port: config.serverPort,
      username: config.botUsername,
      version: '1.20.1'
    });

    bot.on('spawn', () => {
      console.log(`Bot (${config.botUsername}) successfully joined ${config.serverHost}!`);

      // AuthMe Login / Password Send
      setTimeout(() => {
        console.log('Sending login password...');
        bot.chat(`/login ${config.password}`);
      }, 3000);

      // Anti-AFK Jumps
      setInterval(() => {
        if (bot && bot.entity) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }
      }, 30000);
    });

    // GUI/Window handle agar AuthMe/Sign GUI pop-up ho
    bot.on('windowOpen', async (window) => {
      console.log('Auth Window/GUI detected!');
      setTimeout(() => {
        bot.chat(config.password);
        bot.chat(`/login ${config.password}`);
      }, 1000);
    });

    bot.on('messagestr', (message) => {
      console.log('[Server Chat]:', message);
      if (message.toLowerCase().includes('login') || message.toLowerCase().includes('password')) {
        bot.chat(`/login ${config.password}`);
      }
    });

    bot.on('kicked', (reason) => {
      console.log('Bot Kicked:', reason);
    });

    bot.on('end', (reason) => {
      console.log('Bot disconnected:', reason);
      setTimeout(createBot, 5000);
    });

    bot.on('error', (err) => {
      console.log('Bot Error:', err.message);
    });
  });
}

createBot();
