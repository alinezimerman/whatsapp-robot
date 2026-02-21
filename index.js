const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');

// 🔐 SUPABASE
const supabase = createClient(
  'https://bxrimrpkbizyqcxcfssy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cmltcnBrYml6eXFjeGNmc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQwNjg0MCwiZXhwIjoyMDg1OTgyODQwfQ.5q-n9n2PwTtUE9i8kJm0WF2Tdp4fpSsbpmylMMH872E'
);

// 🤖 WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  }
});

// QR
client.on('qr', qr => {
  console.log('📱 Scan QR');
  qrcode.generate(qr, { small: true });
});

// READY
client.on('ready', () => {
  console.log('🤖 WhatsApp READY');
  startPolling();
});

// POLLING
function startPolling() {
  setInterval(async () => {
    console.log('🔍 Checking messages...');

    const { data: messages } = await supabase
      .from('Messages')
      .select('*')
      .eq('status', 'scheduled')
      .limit(5);

    if (!messages || messages.length === 0) {
      console.log('📭 No messages');
      return;
    }

    for (const msg of messages) {
      try {
        const clean = msg.phone.replace(/\D/g, '');
        const chatId = `${clean}@c.us`;

        console.log('📤 Sending to:', chatId);

        const chat = await client.getChatById(chatId);
        await chat.sendMessage(msg.text);

        console.log('✅ Sent');

        await supabase
          .from('Messages')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', msg.id);

      } catch (err) {
        console.log('❌ Error:', err.message);
      }
    }
  }, 5000);
}

client.initialize();