const { cmd } = require('../inconnuboy');
const axios = require('axios');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

function getGoogleTTSUrl(text, lang = 'en') {
    const encoded = encodeURIComponent(text.substring(0, 200));
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;
}

cmd({
    pattern: "tts",
    react: "☺️",
    desc: "Convert text to voice",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { from, q, args, reply, config: cfg }) => {
    try {
        await conn.sendMessage(from, { react: { text: "☺️", key: m.key } });

        if (!q) return reply(t(cfg, 'TTS_USAGE'));

        let lang = "en";
        let text = q;

        if (args[0] === "ur" || args[0] === "urdu") {
            lang = "ur";
            text = args.slice(1).join(" ");
        }

        if (!text) return reply(t(cfg, 'TTS_EMPTY'));

        const audioUrl = getGoogleTTSUrl(text, lang);
        const res = await axios.get(audioUrl, {
            responseType: "arraybuffer",
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const audioBuffer = Buffer.from(res.data);
        await conn.sendMessage(
            from,
            { audio: audioBuffer, mimetype: "audio/mp4", ptt: false },
            { quoted: mek }
        );
    } catch (e) {
        console.log("TTS ERROR:", e.message);
        await conn.sendMessage(from, { react: { text: "😔", key: m.key } });
        reply(t(cfg, 'TTS_ERROR'));
    }
});
