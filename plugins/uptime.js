const config = require('../config');
const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const os = require('os');

const NEWSLETTER = {
    forwardingScore: 999, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363403408693274@newsletter',
        newsletterName: 'SHINIGAMI-MD', serverMessageId: 143
    }
};

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: 'uptime', alias: ['runtime', 'status', 'host'],
    desc: 'Check bot status', category: 'main',
    react: '👑', filename: __filename
},
async (conn, mek, m, { from, reply, config: cfg }) => {
    try {
        const getUptime = () => {
            let sec = process.uptime();
            let h = Math.floor(sec / 3600);
            let mn = Math.floor((sec % 3600) / 60);
            let s = Math.floor(sec % 60);
            return `${h}H ${mn}M ${s}S`;
        };

        let platform = 'LINUX VPS / PANEL';
        if (process.env.HEROKU_APP_NAME) platform = 'HEROKU CLOUD';
        else if (process.env.KOYEB_PROJECT_ID) platform = 'KOYEB PAAS';
        else if (process.env.RENDER_SERVICE_ID) platform = 'RENDER CLOUD';
        else if (process.env.REPL_ID) platform = 'REPLIT';

        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        const status = `╭━━━〔 *UPTIME* 〕━━━┈⊷\n┃\n┃ 👑 *STATUS:* ONLINE\n┃ 👑 *${t(cfg, 'UPTIME_MSG', getUptime())}*\n┃ 👑 *HOST:* ${platform}\n┃ 👑 *RAM:* ${ram}MB / ${totalRam}GB\n┃ 👑 *PLATFORM:* ${os.platform().toUpperCase()}\n┃\n╰━━━━━━━━━━━━━━━┈⊷\n\n*POWERED BY DR-MD* 👑`;

        await conn.sendMessage(from, {
            image: { url: cfg?.BOT_IMAGE || config.IMAGE_PATH || 'https://files.catbox.moe/xoac4l.jpg' },
            caption: status,
            contextInfo: NEWSLETTER
        }, { quoted: m });

    } catch (e) {
        reply(`❌ ERROR: ${e.message.toUpperCase()}`);
    }
});
