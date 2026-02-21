const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const NUMBER = '5551998971877@c.us'; // seu número teste

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'railway-test'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

client.on('qr', qr => {
  console.log('📱 Scan QR');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('🤖 READY — sending manual message');

  try {
    await client.sendMessage(NUMBER, '🚀 TESTE MANUAL RAILWAY');
    console.log('✅ SENT SUCCESSFULLY');
  } catch (err) {
    console.error('❌ SEND ERROR:', err);
  }
});

client.initialize();
