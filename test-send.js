const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// The number you want to send a message to, in WhatsApp format
const TARGET_NUMBER = '5551998971877@c.us';

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  console.log('📱 Scan this QR with WhatsApp');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('🤖 WhatsApp is READY');

  try {
    console.log('🔍 Verifying target number...');
    const numberId = await client.getNumberId(TARGET_NUMBER);
    
    if (numberId) {
      console.log('🧪 Sending direct test...');
      await client.sendMessage(numberId._serialized, 'DIRECT TEST 🚀');
      console.log('✅ Message sent successfully');
    } else {
      console.log('❌ Number not found on WhatsApp');
    }
  } catch (err) {
    console.error('❌ Send error:', err);
  }
});

client.initialize();
