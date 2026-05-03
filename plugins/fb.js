const { cmd } = require('../inconnuboy');
const axios = require('axios');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "fb",
  react: "☺️",
  alias: ["facebook", "fbdl"],
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, config: cfg }) => {
  try {
    if (!q) return reply(t(cfg, 'FB_USAGE'));

    const apiUrl = `https://movanest.xyz/v2/fbdown?url=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (data.status !== true) return reply(t(cfg, 'FB_ERROR'));

    if (!Array.isArray(data.results) || data.results.length === 0) {
      return reply(t(cfg, 'FB_NOT_FOUND'));
    }

    const result = data.results[0];
    const videoUrl = result.hdQualityLink ? result.hdQualityLink : result.normalQualityLink;

    if (!videoUrl) return reply(t(cfg, 'FB_LINK_ONLY'));

    const caption = `*👑 FB VIDEO 👑*
*👑 TIME :❯ ${result.duration}*
*👑 CREATER :❯ ${data.creator}*
*© Mᴀᴅᴇ ʙʏ Iɴᴄᴏɴɴᴜ Bᴏʏ`;

    await conn.sendMessage(
      from,
      { video: { url: videoUrl }, mimetype: "video/mp4", caption },
      { quoted: mek }
    );
  } catch (err) {
    console.log(err);
    reply(t(cfg, 'FB_ERROR'));
  }
});
