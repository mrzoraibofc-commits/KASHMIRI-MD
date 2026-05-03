const { cmd } = require('../inconnuboy')
const { fetchGif, gifToSticker } = require('../lib/sticker-utils')
const { getLang } = require('../lib/lang')

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: "attp",
    alias: ["attptext", "textsticker", "namesticker", "stickername", "at", "att", "atp"],
    react: "✨",
    desc: "Convert text into animated sticker",
    category: "sticker",
    use: ".attp <text>",
    filename: __filename
},
async (conn, mek, m, { args, reply, config: cfg }) => {
    try {
        if (!args[0]) return reply(t(cfg, 'ATTP_USAGE'));

        reply(t(cfg, 'ATTP_CREATING'));

        const text = encodeURIComponent(args.join(" "))
        const gifBuffer = await fetchGif(
            `https://api-fix.onrender.com/api/maker/attp?text=${text}`
        )

        const sticker = await gifToSticker(gifBuffer)

        await conn.sendMessage(
            m.chat,
            { sticker },
            { quoted: mek }
        )
    } catch (e) {
        console.log("ATTP ERROR:", e)
        reply(t(cfg, 'ATTP_ERROR'));
    }
})
