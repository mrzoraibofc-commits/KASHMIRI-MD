const { cmd } = require('../inconnuboy');

cmd({
  pattern: "ping", alias: ["speed", "p"], react: "⚡",
  category: "info", desc: "Check bot ping", filename: __filename
}, async (conn, mek, m, { from, reply, config: cfg }) => {
  try {
    const start = Date.now();
    await conn.sendPresenceUpdate('composing', from);
    const ping = Date.now() - start;

    const uptime = (() => {
      let sec = process.uptime();
      return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m ${Math.floor(sec % 60)}s`;
    })();

    const mode = (cfg?.WORK_TYPE || 'public').toLowerCase();

    await conn.sendMessage(from, {
      text: `⚡ *Ping:* ${ping}ms\n🕐 *Uptime:* ${uptime}\n🌐 *Mode:* ${mode}`
    }, { quoted: mek });

  } catch (err) {
    reply('❌ Ping error: ' + err.message);
  }
});
