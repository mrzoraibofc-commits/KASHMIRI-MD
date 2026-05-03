const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "block", alias: ["b","blk","blok","bye"], react: "🤐",
  category: "owner", desc: "Block user (reply or inbox)", filename: __filename
}, async (conn, mek, m, { from, reply, isOwner, config: cfg }) => {
  try {
    if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));
    let jid = m.quoted ? m.quoted.sender : from.endsWith('@s.whatsapp.net') ? from : null;
    if (!jid) return reply(t(cfg, 'BLOCK_SUCCESS').replace('✅', '❌ ') + ' Reply to a message or use in inbox!');
    await reply(t(cfg, 'BLOCK_SUCCESS'));
    setTimeout(async () => { await conn.updateBlockStatus(jid, 'block'); }, 1500);
  } catch (e) { reply(t(cfg, 'ERROR') + e.message); }
});
