const { cmd } = require('../inconnuboy')
const yts = require('yt-search')
const { getLang } = require('../lib/lang')

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: "yts",
    alias: ["ytsearch"],
    react: "☺️",
    desc: "Search videos on YouTube",
    category: "search",
    use: ".yts <video name>",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, config: cfg }) => {
    try {
        if (!q) return reply(t(cfg, 'YTS_USAGE'));

        const search = await yts(q)
        const videos = search.videos.slice(0, 10)

        if (videos.length === 0) return reply(t(cfg, 'YTS_NOT_FOUND'));

        let text = "*📺 YOUTUBE SEARCH RESULTS 📺*\n\n"
        for (let i = 0; i < videos.length; i++) {
            const v = videos[i]
            text += `*${i + 1}. ${v.title}*\n⏱️ ${v.timestamp}\n👁️ ${v.views} views\n🔗 ${v.url}\n\n`
        }
        text += "> SHINIGAMI-MD*"

        await conn.sendMessage(from, { text }, { quoted: mek })
    } catch (e) {
        console.log("YTS ERROR:", e)
        reply(t(cfg, 'YTS_ERROR'));
    }
})
