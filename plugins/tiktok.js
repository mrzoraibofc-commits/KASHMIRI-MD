const { cmd } = require('../inconnuboy');
const axios = require('axios');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "tiktok",
  react: "☺️",
  alias: ["ttdl", "tt", "tiktokvideo", "ttvideo"],
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, config: cfg }) => {
  try {
    if (!q) return reply(t(cfg, 'TIKTOK_USAGE'));

    const apiUrl = `https://www.movanest.xyz/v2/tiktok?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (data.status !== true || !data.results) return reply(t(cfg, 'TIKTOK_ERROR'));

    const res = data.results;
    if (!res.no_watermark) return reply(t(cfg, 'TIKTOK_NOT_FOUND'));

    await reply(
      `*👑 TIKTOK VIDEO 👑*\n\n*👑 VIDEO NAME 👑\n` +
      `${res.title || "No title"}\n\n*👑 BY :❯ SHINIGAMI-MD*`
    );

    await conn.sendMessage(
      from,
      { video: { url: res.no_watermark }, mimetype: "video/mp4" },
      { quoted: mek }
    );
  } catch (err) {
    console.log("TIKTOK CMD ERROR:", err);
    reply(t(cfg, 'TIKTOK_ERROR'));
  }
});
