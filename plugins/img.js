const { cmd } = require('../inconnuboy');
const axios = require('axios');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "img",
  alias: ["image", "pic", "photo", "gimage"],
  react: "📸",
  category: "media",
  desc: "Search and send 5 random images from Google",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, config: cfg }) => {
  try {
    if (!q) return reply(t(cfg, 'IMG_USAGE'));

    const API_URL = `https:///movanest.xyz/v2/googleimage?query=${encodeURIComponent(q)}`;
    const res = await axios.get(API_URL, { timeout: 60000 });

    if (!res.data || !res.data.status || !res.data.results || res.data.results.length === 0) {
      return reply(t(cfg, 'IMG_NOT_FOUND'));
    }

    const uniqueImages = [...new Set(res.data.results)];
    const shuffled = uniqueImages.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    for (let i = 0; i < selected.length; i++) {
      try {
        await conn.sendMessage(from, {
          image: { url: selected[i] },
          caption: `*📸 Image Result for:* ${q} (${i+1}/${selected.length})`
        }, { quoted: mek });
        await new Promise(r => setTimeout(r, 700));
      } catch (err) {
        console.log("IMAGE SEND ERROR:", err.message);
      }
    }
  } catch (err) {
    console.error("IMAGE COMMAND ERROR:", err.message);
    reply(t(cfg, 'NOT_FOUND'));
  }
});
