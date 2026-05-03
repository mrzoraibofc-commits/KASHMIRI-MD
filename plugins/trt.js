const { cmd } = require('../inconnuboy')
const axios = require('axios')
const { getLang } = require('../lib/lang')

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: "trt",
    alias: ["translate"],
    react: "🥺",
    desc: "Translate text between languages",
    category: "other",
    use: ".trt <lang> <text>",
    filename: __filename
},
async (conn, mek, m, { q, reply, config: cfg }) => {
    try {
        if (!q) return reply(t(cfg, 'TRT_GUIDE'));

        const parts = q.trim().split(/\s+/)
        if (parts.length < 2) return reply(t(cfg, 'TRT_BAD_FORMAT'));

        const lang = parts[0].toLowerCase()
        const text = parts.slice(1).join(" ")

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`
        const res = await axios.get(url)

        if (!res.data?.responseData?.translatedText) {
            return reply(t(cfg, 'TRT_FAILED'));
        }

        const translated = res.data.responseData.translatedText

        reply(
`*✅ TRANSLATION COMPLETE ☺️*

*━━━━━━━━━━━━━━━*
${translated}
*━━━━━━━━━━━━━━━*

*© Mᴀᴅᴇ ʙʏ Iɴᴄᴏɴɴᴜ Bᴏʏ*`
        )
    } catch (e) {
        console.log("TRT ERROR:", e)
        reply(t(cfg, 'TRT_ERROR'));
    }
})
