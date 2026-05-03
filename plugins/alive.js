/**
 * plugins/alive.js
 * Ping & Alive — EN/FR language system
 */

const { cmd } = require('../inconnuboy');
const config = require('../config');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// ── PING ─────────────────────────────────────────────────────────
cmd({
    pattern: "ping",
    alias: ["p", "speed"],
    desc: "Check bot latency",
    category: "general",
    react: "⚡"
},
async (conn, mek, m, { from, reply, config: cfg }) => {
    try {
        const start = Date.now();
        const uptime = (() => {
            let sec = process.uptime();
            let h = Math.floor(sec / 3600);
            let mn = Math.floor((sec % 3600) / 60);
            let s = Math.floor(sec % 60);
            return `${h}H ${mn}M ${s}S`;
        })();

        await conn.sendPresenceUpdate('composing', from);
        const ping = Date.now() - start;
        const mode = (cfg?.WORK_TYPE || config.WORK_TYPE || 'public').toUpperCase();

        const msg = t(cfg, 'PING_RESULT', ping, uptime, mode);
        await conn.sendMessage(from, { text: msg }, { quoted: mek });
    } catch (e) {
        reply(t(null, 'ERROR') + e.message);
    }
});

// ── ALIVE ────────────────────────────────────────────────────────
cmd({
    pattern: "alive",
    desc: "Check if bot is alive",
    category: "general",
    react: "👑"
},
async (conn, mek, m, { from, reply, config: cfg }) => {
    try {
        const botName = cfg?.BOT_NAME || config.BOT_NAME || 'BOT';
        const imageUrl = cfg?.BOT_IMAGE || config.IMAGE_PATH;
        const caption = `*${botName}* ✅\n\n` + t(cfg, 'ALIVE_MSG');

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: caption
        }, { quoted: mek });
    } catch (e) {
        reply(t(null, 'ERROR') + e.message);
    }
});
