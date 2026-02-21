// =============================
// 📦 IMPORTS
// =============================
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');

// =============================
// 🔑 SUPABASE CONFIG
// =============================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// =============================
// 🤖 WHATSAPP CLIENT (Railway safe)
// =============================
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session' // persists login
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Railway Chrome fix
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

// =============================
// 📱 QR CODE
// =============================
client.on('qr', qr => {
  console.log('📱 Scan this QR with WhatsApp');
  qrcode.generate(qr, { small: true });
});

// =============================
// ✅ READY EVENT
// =============================
client.on('ready', () => {
  console.log('🤖 WhatsApp is READY');
  startPolling();
});

// =============================
// 📤 SEND FUNCTION
// =============================
async function sendWhatsApp(phone, text) {
  try {
    // Clean phone
    const clean = phone.replace(/\D/g, '');
    const chatId = `${clean}@c.us`;

    console.log(`📤 Sending to: ${chatId}`);

    await client.sendMessage(chatId, text);

    console.log('✅ Sent successfully');
    return true;
  } catch (err) {
    console.log('❌ Send error:', err.message);
    return false;
  }
}

// =============================
// 🔁 POLLING LOOP
// =============================
function startPolling() {
  setInterval(async () => {
    try {
      console.log('🔍 Checking messages...');

      const { data: messages, error } = await supabase
        const { data, error } = await supabase
  	.from('messages')
 	 .select('*');

	console.log('📦 EVERYTHING:', data);

      if (error) {
        console.log('❌ Supabase error:', error.message);
        return;
      }

      if (!messages || messages.length === 0) {
        console.log('📭 No messages');
        return;
      }

      console.log(`📦 Found ${messages.length} message(s)`);

      for (const msg of messages) {
        const success = await sendWhatsApp(msg.phone, msg.text);

        if (success) {
          await supabase
            .from('Messages')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', msg.id);
        }
      }

    } catch (err) {
      console.log('💥 Polling error:', err.message);
    }
  }, 5000); // check every 5s
}

// =============================
// 🚀 START
// =============================
client.initialize();