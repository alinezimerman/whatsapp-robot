const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Starting bot...');

// ENV DEBUG
console.log('ENV CHECK:', {
  SUPABASE_URL: process.env.SUPABASE_URL ? 'OK' : 'MISSING',
  SUPABASE_KEY: process.env.SUPABASE_KEY ? 'OK' : 'MISSING',
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', qr => {
  console.log('📱 Scan QR');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('🤖 WhatsApp READY');

  try {
    const { data, error } = await supabase
      .from('Messages')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Supabase error:', error);
    } else {
      console.log('📦 Supabase rows:', data);
    }
  } catch (err) {
    console.log('🔥 CRASH:', err);
  }
});

client.initialize();