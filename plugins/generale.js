const { cmd } = require('../inconnuboy');
const config = require('../config');
const os = require('os');
const { getLang } = require('../lib/lang');

cmd({
  pattern: "Uptime", alias: ["speed2"],
  desc: "Check latency and resources", category: "general", react: "👑"
}, async (conn, mek, m, { from, reply, config: cfg }) => {
  try {
    const start = Date.now();
    const msg = await conn.sendMessage(from, { text: '*T E S T I N G....*' }, { quoted: mek });
    const latency = Date.now() - start;
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedMem = (totalMem - freeMem).toFixed(0);
    const botName = cfg?.BOT_NAME || config.BOT_NAME || 'BOT';
    const pingMsg = `*👑 ${botName} UPTIME 👑* ⚡\n\n*⚡ SPEED : ${latency}ms*\n*💾 RAM : ${usedMem}MB / ${totalMem}MB*`;
    await conn.sendMessage(from, { text: pingMsg, edit: msg.key });
  } catch (e) { reply('❌ ' + e.message); }
});

cmd({
  pattern: "owner", desc: "Contact the creator", category: "general", react: "👑"
}, async (conn, mek, m, { from }) => {
  const ownerNumber = config.OWNER_NUMBER;
  const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Owner\nORG:Bot;\n' +
    `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` + 'END:VCARD';
  await conn.sendMessage(from, {
    contacts: { displayName: 'Bot Owner', contacts: [{ vcard }] }
  }, { quoted: mek });
});
