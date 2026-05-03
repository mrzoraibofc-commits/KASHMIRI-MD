const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "unblock", alias: ["unb","unblk"], react: "🥰",
  category: "owner", desc: "Unblock user (reply or inbox)", filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, config: cfg }) => {
  try {
    if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));
    let jid = m.quoted ? m.quoted.sender : from.endsWith('@s.whatsapp.net') ? from : null;
    if (!jid) return reply('❌ Reply to a message or use in inbox!');
    await conn.updateBlockStatus(jid, 'unblock');
    reply(t(cfg, 'UNBLOCK_SUCCESS'));
  } catch (e) { reply(t(cfg, 'ERROR') + e.message); }
});
