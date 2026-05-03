const { cmd } = require("../inconnuboy");
const yts = require("yt-search");
const axios = require("axios");
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// --- Helper Functions ---

function normalizeYouTubeUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/);
  return match ? `https://youtube.com/watch?v=${match[1]}` : null;
}

async function fetchVideoData(url) {
  try {
    const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    return data.status && data.result ? data.result.mp4 : null;
  } catch (e) { return null; }
}

async function fetchAudioData(url) {
  try {
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    return data.status && data.data ? data.data.url : null;
  } catch (e) { return null; }
}

// --- MAIN DOWNLOAD COMMAND ---

cmd(
  {
    pattern: "dl",
    alias: ["download", "play"],
    react: "📥",
    desc: "Download YouTube Video or Audio with selection.",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply, prefix, config: cfg }) => {
    try {
      if (!q) return reply(`❓ Usage: \`${prefix}dl <name/link>\``);

      await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

      let ytdata;
      const url = normalizeYouTubeUrl(q);
      if (url) {
        const results = await yts({ videoId: url.split('v=')[1] });
        ytdata = results;
      } else {
        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found!");
        ytdata = search.videos[0];
      }

      const selectText = t(cfg, 'PLAY_SELECT');
      const caption = `🎥 *YT DOWNLOADER* 🎥

📌 *Title:* ${ytdata.title}
⏱️ *Duration:* ${ytdata.timestamp}
👁️ *Views:* ${ytdata.views.toLocaleString()}
🔗 *Link:* ${ytdata.url}

${selectText}

> © Mᴀᴅᴇ ʙʏ Iɴᴄᴏɴɴᴜ Bᴏʏ`;

      const sentMsg = await conn.sendMessage(from, { image: { url: ytdata.thumbnail || ytdata.image }, caption }, { quoted: mek });
      const messageID = sentMsg.key.id;

      conn.ev.on("messages.upsert", async function playListener(msgData) {
        const receivedMsg = msgData.messages[0];
        if (!receivedMsg?.message) return;

        const text = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
        const isReply = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

        if (!isReply) return;

        // Remove listener immediately to avoid duplicates
        conn.ev.off("messages.upsert", playListener);

        await conn.sendMessage(from, { react: { text: "⏳", key: receivedMsg.key } });

          if (text === "1") {
            const videoUrl = await fetchVideoData(ytdata.url);
            if (!videoUrl) return reply("❌ Video download failed!");
            await conn.sendMessage(from, {
              video: { url: videoUrl },
              caption: `✅ *${ytdata.title}*\n\n> © Mᴀᴅᴇ ʙʏ Iɴᴄᴏɴɴᴜ Bᴏʏ`
            }, { quoted: receivedMsg });
          } else if (text === "2") {
            const audioUrl = await fetchAudioData(ytdata.url);
            if (!audioUrl) return reply("❌ Audio download failed!");
            await conn.sendMessage(from, {
              audio: { url: audioUrl },
              mimetype: "audio/mpeg"
            }, { quoted: receivedMsg });
          } else {
            reply("❌ Invalid choice! Please reply with 1 or 2.");
          }

          await conn.sendMessage(from, { react: { text: "✅", key: receivedMsg.key } });
      });
    } catch (e) {
      console.error(e);
      reply("⚠️ Error occurred!");
    }
  }
);
