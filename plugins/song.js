const { cmd } = require('../inconnuboy');
const axios = require('axios');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "song3",
  react: "😇",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, config: cfg }) => {
  try {
    if (!q) return reply(t(cfg, 'SONG_USAGE'));

    let ytUrl = q;

    if (!q.startsWith("http")) {
      const searchApi = `https://www.movanest.xyz/v2/ytsearch?query=${encodeURIComponent(q)}`;
      const searchRes = await axios.get(searchApi);
      const searchData = searchRes.data;

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        return reply(t(cfg, 'SONG_NOT_FOUND'));
      }

      ytUrl = searchData.results[0].url;
    }

    const apiUrl = `https://www.movanest.xyz/v2/ytmp3?url=${encodeURIComponent(ytUrl)}`;
    const { data } = await axios.get(apiUrl);

    if (data.status !== true || !data.results) {
      return reply(t(cfg, 'SONG_NOT_FOUND'));
    }

    const meta = data.results.metadata;
    const dl = data.results.download;

    if (!dl?.url) return reply(t(cfg, 'SONG_LINK_ONLY'));

    await reply(
      `*👑 AUDIO INFO 👑*\n\n` +
      `*👑 AUDIO NAME 👑* \n${meta.title}\n\n` +
      `*👑 CHANNEL 👑* \n ${meta.author.name}\n\n` +
      `*👑 TIME 👑* \n ${meta.duration.timestamp}\n\n*© Mᴀᴅᴇ ʙʏ Iɴᴄᴏɴɴᴜ Bᴏʏ*`
    );

    await conn.sendMessage(
      from,
      { audio: { url: dl.url }, mimetype: "audio/mpeg" },
      { quoted: mek }
    );
  } catch (err) {
    console.log("SONG CMD ERROR:", err);
    reply(t(cfg, 'SONG_ERROR'));
  }
});
