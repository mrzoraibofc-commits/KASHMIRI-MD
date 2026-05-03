const { cmd } = require('../inconnuboy');
const axios = require('axios');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
  pattern: "ai",
  alias: ["gpt", "ask", "chatgpt"],
  react: "🤖",
  category: "ai",
  desc: "Chat with AI",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, config: cfg }) => {
  try {
    if (!q) return reply(t(cfg, 'AI_USAGE'));

    await conn.sendPresenceUpdate('composing', from);

    // ✅ YOUR API
    const API_URL = `https://bilal-md-ai-d1191ad3f31f.herokuapp.com/api/ask?q=${encodeURIComponent(q)}`;
    const res = await axios.get(API_URL, { timeout: 60000 });

    if (res.data && res.data.reply) {
      await reply(res.data.reply);
    } else {
      await reply(t(cfg, 'AI_NO_RESPONSE'));
    }
  } catch (err) {
    console.log("AI COMMAND ERROR:", err.message);
    reply(t(cfg, 'AI_ERROR'));
  }
});
