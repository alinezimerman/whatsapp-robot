const { Client, LocalAuth } = require('whatsapp-web.js');
const { createClient } = require('@supabase/supabase-js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Starting bot...');

// =====================
// ENV
// =====================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// =====================
// WHATSAPP CLIENT
// =====================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// =====================
// QR
// =====================
client.on('qr', qr => {
  console.log('📱 Scan QR');
  qrcode.generate(qr, { small: true });
});

// =====================
// READY
// =====================
client.on('ready', () => {
  console.log('🤖 WhatsApp READY');
  startPolling();
});

// =====================
// POLLING LOOP
// =====================
function startPolling() {
  console.log('🔁 Polling started');

  setInterval(async () => {
    try {
      console.log('🔍 Checking messages...');

      const { data: messages, error } = await supabase
        .from('Messages')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        console.log('❌ Supabase error:', error);
        return;
      }

      if (!messages.length) {
        console.log('📭 No messages');
        return;
      }

      console.log(`📦 Found ${messages.length} message(s)`);

      for (const msg of messages) {
        try {
          const cleanPhone = msg.phone.replace(/\D/g, '');
          const chatId = `${cleanPhone}@c.us`;

          console.log(`📤 Sending to: ${chatId}`);

          await client.sendMessage(chatId, msg.text);

          await supabase
            .from('Messages')
            .update({ status: 'sent', sent_at: new Date() })
            .eq('id', msg.id);

          console.log('✅ Sent');
        } catch (err) {
          console.log('❌ Send error:', err.message);
        }
      }
    } catch (err) {
      console.log('❌ Loop error:', err.message);
    }
  }, 10000); // every 10 seconds
}

// =====================
client.initialize();