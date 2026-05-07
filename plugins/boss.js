const { cmd } = require('../command');

cmd({
    pattern: "profile",
    alias: ["about", "team", "info", "boss"], // ⬅️ COMMA FIXED
    desc: "Show Boss Tech Info",
    category: "main",
    react: "👑",
    filename: __filename
},
async (conn, mek, msg, { from, sender, pushname, reply }) => {
    try {
        // ============ SIMPLE VERIFIED CONTEXT ============
        const verifiedContext = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net", // ⬅️ FIXED
                remoteJid: "status@broadcast"
            },
            message: {
                extendedTextMessage: {
                    text: "BOSS-MD PREMIUM"
                }
            }
        };

        // ============ MAIN MENU ============
        const menu = `
╔═★💎 𝐁𝐎𝐒𝐒 𝐓𝐄𝐂𝐇 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 💎★═╗
║
║ ┏━ 🌟 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌟 ━┓
║ ┃   👋 𝗛𝗲𝘆: ${pushname || 'USER'}
║ ┃   🚀 Premium WhatsApp Bot
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
║
╠═★👑 𝐎𝐖𝐍𝐄𝐑 👑★═╣
║
║ ┏━ 🔥 𝐂𝐎𝐑𝐄 𝐋𝐄𝐀𝐃𝐄𝐑 🔥 ━┓
║ ┃   ✪ 𝐍𝐚𝐦𝐞    : 𝗕𝗢𝗦𝗦
║ ┃   ✦ 𝐑𝐨𝐥𝐞    : CEO & Founder
║ ┃   ❖ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩: wa.me/923076411099
║ ┃   ▸ 𝐄𝐦𝐚𝐢𝐥   : bosstech476@gmail.com
║ ┃   ✧ 𝐂𝐨𝐮𝐧𝐭𝐫𝐲: Pakistan 🇵🇰
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
║
╠═★🤝 𝐂𝐎-𝐅𝐎𝐔𝐍𝐃𝐄𝐑 🤝★═╣
║
║ ┏━ ⚡ 𝐓𝐄𝐂𝐇𝐍𝐈𝐂𝐀𝐋 𝐏𝐀𝐑𝐓𝐍𝐄𝐑 ⚡ ━┓
║ ┃   ✪ 𝐍𝐚𝐦𝐞    : 𝗤𝗔𝗗𝗘𝗘𝗥
║ ┃   ✦ 𝐑𝐨𝐥𝐞    : Technical Partner
║ ┃   ❖ 𝐄𝐱𝐩𝐞𝐫𝐭  : Bot Development & AI
║ ┃   🌐 Country : Pakistan 🇵🇰
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
║
╠═★👥 𝐓𝐄𝐀𝐌 👥★═╣
║
║ ┏═ 🌟 𝐂𝐎𝐑𝐄 𝐓𝐄𝐀𝐌 🌟 ━┓
║ ┃   ✪ 𝐋𝐄𝐆𝐄𝐍𝐃     - Lead Developer
║ ┃   ✪ 𝐀𝐍𝐘𝐀𝐄𝐓 𝐊𝐈𝐍𝐆 - UI/UX Designer
║ ┃   ✪ 𝐀𝐑𝐒𝐋𝐀𝐍     - Backend Expert
║ ┃   ✪ 𝐐𝐀𝐃𝐄𝐄𝐑     - API Specialist
║ ┃   ✪ 𝐁𝐀𝐃𝐒𝐇𝐀𝐇 𝐊𝐇𝐀𝐍 - 𝐌𝐄𝐌𝐄𝐑 (318-3202012)
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
║
╠═★📊 𝐒𝐓𝐀𝐓𝐒 📊★═╣
║
║ ┏━ 📈 𝐌𝐄𝐓𝐑𝐈𝐂𝐒 📈 ━┓
║ ┃   ✪ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞    : BOSS-md AI BOT
║ ┃   ✦ 𝐄𝐝𝐢𝐭𝐢𝐨𝐧     : 𝟱.𝟬 𝗨𝗟𝗧𝗜𝗠𝗔𝗧𝗘 ⚡
║ ┃   ❖ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬   : 300+ Premium Features
║ ┃   ▸ 𝐔𝐬𝐞𝐫𝐬      : 10K+ Active Users
║ ┃   ✧ 𝐆𝐫𝐨𝐮𝐩𝐬     : 500+ Communities
║ ┃   ⚡ 𝐋𝐚𝐮𝐧𝐜𝐡𝐞𝐝  : 2024
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
║
╠═★🌐 𝐒𝐎𝐂𝐈𝐀𝐋 🌐★═╣
║
║ ┏━ 🔗 𝐋𝐈𝐍𝐊𝐒 🔗 ━┓
║ ┃   ✪ 𝐆𝐢𝐭𝐇𝐮𝐛  : github.com/bosstech
║ ┃   ✦ 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 : youtube.com/@bosstech
║ ┃   ❖ 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 : t.me/boss_tech
║ ┃   ▸ 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐂𝐡𝐚𝐧𝐧𝐞𝐥:
║ ┃     https://whatsapp.com/channel/0029VbC210i2P59dHYVlXW1K
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
║
╚═★🌠 𝐁𝐎𝐒𝐒 𝐓𝐄𝐂𝐇 𝐕𝐈𝐏 🌠★═╝

╔══════════════════════════════════╗
║  👑 Next-Gen WhatsApp AI Bot     ║
║  ✦ 300+ Commands ✦ 10K+ Users    ║
║  ════════════════════════════════ ║
║  ✦ © 2025 彡★ BOSS-MD ★彡         ║
╚══════════════════════════════════╝
`;

        // ============ NEW WORKING IMAGE URL ============
        const imageUrl = 'https://files.catbox.moe/we1p37.jpg'; // Ye working hai?

        try {
            // REACTION PEHLE
            await conn.sendMessage(from, {
                react: { text: "👑", key: mek.key }
            });

            // TRY TO SEND WITH IMAGE
            try {
                await conn.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: menu,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        externalAdReply: {
                            title: "👑 BOSS TECH PROFILE",
                            body: "🚀 Premium WhatsApp Bot",
                            mediaType: 1,
                            thumbnailUrl: imageUrl,
                            sourceUrl: "https://whatsapp.com/channel/0029VbC210i2P59dHYVlXW1K"
                        }
                    }
                }, { quoted: mek });
            } catch (imgErr) {
                // IF IMAGE FAILS, SEND TEXT ONLY
                await conn.sendMessage(from, {
                    text: menu,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: mek });
            }

            // SUCCESS REACTION
            setTimeout(async () => {
                await conn.sendMessage(from, {
                    react: { text: "✅", key: mek.key }
                }).catch(() => {});
            }, 1000);

        } catch (error) {
            console.log("Send error:", error);
            // FINAL FALLBACK
            await conn.sendMessage(from, {
                text: `👑 *BOSS TECH*\n\nContact: wa.me/923076411099`
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Profile Command Error:", e);
        await conn.sendMessage(from, {
            text: `👑 *BOSS TECH*\n\nContact: wa.me/923076411099`
        }, { quoted: mek });
    }
});
