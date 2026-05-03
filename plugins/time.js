
const { cmd } = require('../inconnuboy')
const { getLang } = require('../lib/lang')

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: "time",
    react: "☺️",
    desc: "Check current Pakistan time",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { reply, config: cfg }) => {
    try {
        const now = new Date()
        const time = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Karachi"
        })

        reply(t(cfg, 'TIME_PAKISTAN', time));
    } catch (e) {
        console.log("TIME ERROR:", e)
        reply(t(cfg, 'TIME_ERROR'));
    }
})
