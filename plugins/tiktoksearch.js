const axios = require("axios");
const { cmd } = require("../inconnuboy");

// =============================================================
// 📌 TIKTOK DOWNLOADER COMMAND
// =============================================================
cmd({
  pattern: "tiktok",
  alias: ["ts", "ttsearch", "tt", "ttdl"],
  desc: "Download TikTok videos via link or search",
  react: "🎵",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, prefix, q }) => {

  try {
    // 1. Check Input
    if (!q) return reply(`*AP NE TIKTOK VIDEO DOWNLOAD KARNI HAI TO LINK DEIN 🤔*\n\n*TIKTOK ❮LINK/QUERY❯*\n\n*POWERED BY KAMRAN-MD 👑*`);

    await m.react("📥");

    // 2. Fetch from TikWM API
    const apiUrl = `https://tikwm.com/api/`;
    const response = await axios.post(apiUrl, new URLSearchParams({
        url: q,  // Agar link hai to link, varna search query
        count: 1,
        cursor: 0,
        hd: 1
    }));

    const data = response.data;

    // Check if video found
    if (!data || !data.data) {
        // Agar link nahi hai to ho sakta hai user search kar raha ho
        const searchRes = await axios.get(`https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(q)}`);
        if (!searchRes.data.data || !searchRes.data.data.videos) {
            return reply("*SORRY G, VIDEO NAHI MILI! 😔*");
        }
        var videoData = searchRes.data.data.videos[0]; // Pehli video utha li
    } else {
        var videoData = data.data; // Direct link wala data
    }

    // 3. Design Caption
    let caption = `╭━━━〔 *TIKTOK DOWNLOADER* 〕━━━┈⊷
┃
┃ *TITLE:* ${videoData.title ? videoData.title.toUpperCase().slice(0, 50) : "TIKTOK VIDEO"}
┃ *AUTHOR:* ${videoData.author.nickname.toUpperCase()}
┃ *VIEWS:* ${videoData.play_count || "N/A"}
┃ *LIKES:* ${videoData.digg_count || "N/A"}
┃
╰━━━━━━━━━━━━━━━┈⊷

*© Mᴀᴅᴇ ʙʏ Iɴᴄᴏɴɴᴜ Bᴏʏ`;

    // 4. Send Video
    await conn.sendMessage(from, { 
      video: { url: videoData.play || videoData.hdplay }, 
      caption: caption,
      fileName: `tiktok.mp4` 
    }, { quoted: m });

    await m.react("✅");

  } catch (e) {
    console.error("TikTok Error:", e);
    reply("❌ *API DOWN HAI YA LINK SAHI NAHI HAI!*");
    await m.react("❌");
  }
});
