const { cmd } = require('../inconnuboy');
const { setAntideleteStatus, getAntideleteStatus } = require('../data/Antidelete');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: "antidelete",
    alias: ["antidel"],
    desc: "Turn Antidelete on/off",
    category: "owner",
    react: "🛡️"
},
async(conn, mek, m, { args, isOwner, reply, from, config: cfg }) => {
    if (!isOwner && !isSudo) return reply(t(cfg, 'ANTIDELETE_OWNER_ONLY'));
    const mode = args[0]?.toLowerCase();

    if (mode === 'on' || mode === 'enable') {
        await setAntideleteStatus(from, true);
        await reply(t(cfg, 'ANTIDELETE_ON'));
    } else if (mode === 'off' || mode === 'disable') {
        await setAntideleteStatus(from, false);
        await reply(t(cfg, 'ANTIDELETE_OFF'));
    } else {
        const current = await getAntideleteStatus(from);
        await reply(t(cfg, 'ANTIDELETE_STATUS', current));
    }
});
