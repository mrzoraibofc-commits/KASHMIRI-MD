const { cmd } = require('../inconnuboy');
const config = require('../config');
const { getLang } = require('../lib/lang');
const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "autobio", alias: ["bioauto","setautobio"], react: "😎",
  category: "owner", desc: "Auto bio on/off", filename: __filename
}, async (conn, mek, m, { from, q, reply, isOwner, config: cfg }) => {
  try {
    if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));
    const state = q?.toLowerCase();
    if (!state || !['on','off'].includes(state)) {
      return reply(t(cfg, 'AUTOBIO_STATUS', global.autoBio ? 'ON ✅' : 'OFF ❌'));
    }
    global.autoBio = state === 'on';
    if (global.autoBio) updateBio(conn, cfg);
    return reply(t(cfg, 'SETTINGS_UPDATED', 'Auto Bio', state.toUpperCase()));
  } catch (e) { reply(t(cfg, 'ERROR') + e.message); }
});

async function updateBio(conn, cfg) {
  if (!global.autoBio) return;
  try {
    const uptime = clockString(process.uptime() * 1000);
    const botName = cfg?.BOT_NAME || config.BOT_NAME || 'BOT';
    await conn.updateProfileStatus(`👑 ${botName} ACTIVE (${uptime}) 👑`);
  } catch (err) { console.log('❌ BIO UPDATE FAILED:', err.message); }
  setTimeout(() => updateBio(conn, cfg), 60 * 1000);
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  let str = '';
  if (d) str += `${d}D `;
  if (h) str += `${h}H `;
  if (m) str += `${m}M `;
  if (s) str += `${s}S`;
  return str.trim();
}
