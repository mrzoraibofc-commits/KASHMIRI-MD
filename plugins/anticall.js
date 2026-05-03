
const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "anti-call", alias: ["anticall"], react: "📵",
  desc: "Enable or disable anti-call", category: "owner", filename: __filename
}, async (conn, mek, m, { from, args, isOwner, reply, config: cfg }) => {
  if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));
  const status = args[0]?.toLowerCase();
  if (status === 'on') {
    if (cfg) cfg.ANTI_CALL = 'true';
    return reply('✅ *Anti-Call ON*');
  } else if (status === 'off') {
    if (cfg) cfg.ANTI_CALL = 'false';
    return reply('❌ *Anti-Call OFF*');
  } else {
    return reply(t(cfg, 'SETTINGS_ANTICALL_STATUS', cfg?.ANTI_CALL || 'false'));
  }
});
