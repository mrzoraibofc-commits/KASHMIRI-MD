/**
 * plugins/menu.js
 * Menu — 2 styles (V1 classic borders, V2 minimal stars)
 */

const { cmd, commands } = require('../inconnuboy');
const config = require('../config');
const process = require('process');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

const uptime = () => {
    let sec = process.uptime();
    let h = Math.floor(sec / 3600);
    let mn = Math.floor((sec % 3600) / 60);
    let s = Math.floor(sec % 60);
    return `${h}H ${mn}M ${s}S`;
};

// ─────────────────────────────────────────────────────────────────
// STYLE 1 : Minimal (━━ border with ✦ stars)  ← anciennement Style 2
// ─────────────────────────────────────────────────────────────────
const menuStyle1 = (cfg, sender, prefix, mode, ping, cmdCount) => {
    const botName = cfg?.BOT_NAME || config.BOT_NAME || 'BOT';
    return `╭━━━━━━━━━━━━━╮
│ ✦ *Bᴏᴛ* : ${botName}
│ ✦ *Usᴇʀ* : @${sender}
│ ✦ *Pʀᴇғɪx* : ${prefix}
│ ✦ *Uᴘᴛɪᴍᴇ* : ${uptime()}
│ ✦ *Cᴏᴍᴍᴀɴᴅs* : ${cmdCount}
╰──────────────╯

╭─  *👑 OWNER*
│ • sᴇᴛᴘʀᴇғɪx       
│ • ᴜɴʙʟᴏᴄᴋ 
│ • ʙʟᴏᴄᴋ    
│ • sᴇᴛᴛɪɴɢs
│ • ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ   
│ • ᴍᴏᴅᴇ
│ • ʀᴇᴀᴄᴛsᴛᴀᴛᴜs     
│ • ᴀᴜᴛᴏʀᴇᴀᴄᴛ
│ • ᴀɴᴛɪᴄᴀʟʟ
│ • ᴀᴜᴛᴏᴠɪᴇᴡsᴛᴀᴛᴜs       
│ • sᴜᴅᴏᴀᴅᴅ    
│ • sᴜᴅᴏᴅᴇʟ
│ • ᴀɴᴛɪᴅᴇʟᴇᴛᴇ      
│ • ʙᴀɴ  
│ • ᴜɴʙᴀɴ
╰───────────────⭓

╭─  *🌐 GENERAL*
│ • ᴀʟɪᴠᴇ            
│ • ᴘɪɴɢ
│ • ᴜᴘᴛɪᴍᴇ           
│ • ᴍᴇɴᴜ
│ • sᴇᴛʙᴏᴛɴᴀᴍᴇ       
│ • sᴇᴛɪᴍᴀɢᴇ
│ • sᴇᴛʟᴀɴɢ          
│ • ᴀᴜᴛᴏᴛʏᴘɪɴɢ
│ • ᴀᴜᴛᴏᴠᴏɪᴄᴇ        
│ • ᴀᴜᴛᴏʀᴇᴀᴅ
│ • ᴍᴇɴᴛɪᴏɴʀᴇᴘʟʏ    
│ • ᴡᴇʟᴄᴏᴍᴇ
│ • ɢᴏᴏᴅʙʏᴇ
│ • ʀᴇᴘᴏ
╰───────────────⭓

╭─  *👥 GROUP*
│ • ᴛᴀɢᴀʟʟ          
│ • ᴏɴʟɪɴᴇ
│ • ᴋɪᴄᴋ             
│ • ᴘʀᴏᴍᴏᴛᴇ
│ • ᴅᴇᴍᴏᴛᴇ           
│ • ᴍᴜᴛᴇ
│ • ᴜɴᴍᴜᴛᴇ
│ • ᴀɴᴛɪʟɪɴᴋ
│ • ᴋɪᴄᴋᴀʟʟ
│ • ᴋɪᴄᴋᴀʟʟ2
│ • ʀᴇsᴇᴛɢᴏᴏᴅʙʏᴇ
│ • ʀᴇsᴇᴛᴡᴇʟᴄᴏᴍᴇ
│ • sᴇᴛɢᴏᴏᴅʙʏᴇ
│ • sᴇᴛᴡᴇʟᴄᴏᴍᴇ
│ • sᴇᴛᴘᴘ
│ • sᴇᴛɴᴀᴍᴇ
│ • sᴇᴛᴅᴇsᴄ
│ • ʟɪɴᴋ
│ • ʟᴇᴀᴠᴇ
│ • ᴊᴏɪɴ
╰───────────────⭓

╭─  *🛠️ TOOLS*
│ • ᴀɪ 
│ • ɢᴘᴛ         
│ • ɪᴍɢ
│ • ᴛʀᴛ              
│ • ᴛᴛs
│ • ᴀᴛᴛᴘ             
│ • ss
│ • ᴛɪᴋᴛᴏᴋ           
│ • ғʙ
│ • ᴠɪᴅᴇᴏ 
│ • ᴅʟ       
│ • sᴏɴɢ3
│ • ʏᴛs              
│ • ᴀᴘᴋ
│ • ᴛᴏᴜʀʟ            
│ • ᴛᴇᴍᴘᴍᴀɪʟ
│ • ᴛɪᴍᴇ
│ • ɢᴇᴛᴘᴘ
│ • ᴛᴀᴋᴇ
│ • sᴛɪᴄᴋᴇʀ
│ • ᴛʟɢ
╰───────────────⭓

╭─  *🎉 FUN*
│ • ᴅᴀɴᴄᴇ
│ • ᴋɪʟʟ
│ • sʟᴀᴘ
│ • ᴋɪss
│ • ʙɪᴛᴇ
│ • ᴘᴏᴋᴇ
│ • ᴄʀɪɴɢᴇ
│ • sᴍɪʟᴇ
│ • ᴡɪɴᴋ
│ • ʜᴀᴘᴘʏ
│ • ɢʟᴏᴍᴘ
│ • ʜᴀɴᴅʜᴏʟᴅ
│ • ʜɪɢʜғɪᴠᴇ
│ • ɴᴏᴍ
│ • ᴡᴀᴠᴇ
│ • ʙᴏɴᴋ
│ • ʏᴇᴇᴛ
│ • ʙʟᴜsʜ
│ • ʟɪᴄᴋ
│ • ᴘᴀᴛ
│ • sᴍᴜɢ
│ • ʜᴜɢ
│ • ʙᴜʟʟʏ
│ • ᴀᴡᴏᴏ
│ • ᴄʀʏ
│ • ᴄᴜᴅᴅʟᴇ
╰───────────────⭓`;
};

// ─────────────────────────────────────────────────────────────────
// STYLE 2 : Classic (border style ╭─◇)  ← anciennement Style 1
// ─────────────────────────────────────────────────────────────────
const menuStyle2 = (cfg, sender, prefix, mode, ping, cmdCount) => {
    const botName = cfg?.BOT_NAME || config.BOT_NAME || 'BOT';
    return `╭─────────────────◇
│  ʙᴏᴛ ɴᴀᴍᴇ: ${botName}
│  ᴜsᴇʀ: @${sender}
│  ᴘʀᴇғɪx: ${prefix}
│  ᴜᴘᴛɪᴍᴇ: ${uptime()}
│  ᴄᴏᴍᴍᴀɴᴅs: ${cmdCount}
╰──────────────────◇

╭───  *👑 OWNER*
│    sᴇᴛᴘʀᴇғɪx
│    ʙʟᴏᴄᴋ
│    ᴜɴʙʟᴏᴄᴋ
│    sᴇᴛᴛɪɴɢs
│    ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ [on/off]
│    sᴇᴛᴇᴍᴏᴊɪs
│    ᴍᴏᴅᴇ [public/private]
│    ʀᴇᴀᴄᴛsᴛᴀᴛᴜs [on/off]
│    ᴀᴜᴛᴏʀᴇᴀᴄᴛ [on/off]
│    ᴀɴᴛɪᴄᴀʟʟ [on/off]
│    ᴀᴜᴛᴏᴠɪᴇᴡsᴛᴀᴛᴜs [on/off]
│    sᴜᴅᴏᴀᴅᴅ 
│    sᴜᴅᴏᴅᴇʟ
│    sᴜᴅᴏʟɪsᴛ 
│    ᴀɴᴛɪᴅᴇʟᴇᴛᴇ [on/off]
│    ʙᴀɴ 
│    ᴜɴʙᴀɴ 
│    ʙᴀɴʟɪsᴛ
╰───────────────⊷

╭───  *🌐 GENERAL*
│    ᴀʟɪᴠᴇ
│    ᴘɪɴɢ
│    ᴜᴘᴛɪᴍᴇ
│    ᴍᴇɴᴜ
│    ᴏᴡɴᴇʀ
│    sᴇᴛʙᴏᴛɴᴀᴍᴇ
│    sᴇᴛɪᴍᴀɢᴇ
│    sᴇᴛʟᴀɴɢ
│    ᴀᴜᴛᴏᴛʏᴘɪɴɢ [on/off]
│    ᴀᴜᴛᴏᴠᴏɪᴄᴇ [on/off]
│    ᴀᴜᴛᴏʀᴇᴀᴅ [on/off]
│    ᴍᴇɴᴛɪᴏɴʀᴇᴘʟʏ [on/off]
│    ᴡᴇʟᴄᴏᴍᴇ [on/off]
│    ɢᴏᴏᴅʙʏᴇ [on/off]
│    ʀᴇᴘᴏ
╰───────────────⊷

╭───  *👥 GROUP*
│    ᴛᴀɢᴀʟʟ
│    ᴏɴʟɪɴᴇ
│    ᴋɪᴄᴋ
│    ᴘʀᴏᴍᴏᴛᴇ
│    ᴅᴇᴍᴏᴛᴇ
│    ᴍᴜᴛᴇ 
│    ᴜɴᴍᴜᴛᴇ
│    ᴀɴᴛɪʟɪɴᴋ
│    ᴋɪᴄᴋᴀʟʟ
│    ᴋɪᴄᴋᴀʟʟ2
│    ʀᴇsᴇᴛɢᴏᴏᴅʙʏᴇ
│    ʀᴇsᴇᴛᴡᴇʟᴄᴏᴍᴇ
│    sᴇᴛɢᴏᴏᴅʙʏᴇ
│    sᴇᴛᴡᴇʟᴄᴏᴍᴇ
│    sᴇᴛᴘᴘ
│    sᴇᴛɴᴀᴍᴇ
│    sᴇᴛᴅᴇsᴄ
│    ʟɪɴᴋ
│    ʟᴇᴀᴠᴇ
│    ᴊᴏɪɴ
╰───────────────⊷

╭───  *🛠️ TOOLS*
│    ᴀɪ 
│    ɢᴘᴛ
│    ɪᴍɢ
│    ᴛʀᴛ
│    ᴛᴛs
│    ᴀᴛᴛᴘ
│    ss
│    ᴛɪᴋᴛᴏᴋ
│    ғʙ
│    ᴠɪᴅᴇᴏ 
│    ᴅʟ
│    sᴏɴɢ3
│    ʏᴛs
│    ᴀᴘᴋ
│    ᴛᴏᴜʀʟ
│    ᴛᴇᴍᴘᴍᴀɪʟ
│    ᴛɪᴍᴇ
│    ɢᴇᴛᴘᴘ
│    ᴛᴀᴋᴇ
│    sᴛɪᴄᴋᴇʀ
│    ᴛʟɢ
╰───────────────⊷

╭───  *🎉 FUN*
│    ᴅᴀɴᴄᴇ
│    ᴋɪʟʟ
│    sʟᴀᴘ
│    ᴋɪss
│    ʙɪᴛᴇ
│    ᴘᴏᴋᴇ
│    ᴄʀɪɴɢᴇ
│    sᴍɪʟᴇ
│    ᴡɪɴᴋ
│    ʜᴀᴘᴘʏ
│    ɢʟᴏᴍᴘ
│    ʜᴀɴᴅʜᴏʟᴅ
│    ʜɪɢʜғɪᴠᴇ
│    ɴᴏᴍ
│    ᴡᴀᴠᴇ
│    ʙᴏɴᴋ
│    ʏᴇᴇᴛ
│    ʙʟᴜsʜ
│    ʟɪᴄᴋ
│    ᴘᴀᴛ
│    sᴍᴜɢ
│    ʜᴜɢ
│    ʙᴜʟʟʏ
│    ᴀᴡᴏᴏ
│    ᴄʀʏ
│    ᴄᴜᴅᴅʟᴇ
╰───────────────⊷`;
};

// ─────────────────────────────────────────────────────────────────
// CMD
// ─────────────────────────────────────────────────────────────────
cmd({
    pattern: "menu",
    alias: ["help", "allmenu", "list"],
    react: "👑",
    category: "menu",
    desc: "Show bot menu",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, config: cfg }) => {
    try {
        const senderTag = (m.sender || sender || 'unknown@s.whatsapp.net').split('@')[0];
        const prefix = cfg?.PREFIX || config.PREFIX || '.';
        const mode = (cfg?.WORK_TYPE || config.WORK_TYPE || 'public').toUpperCase();
        const menuStyle = cfg?.MENU_STYLE || '1';
        const imageUrl = cfg?.BOT_IMAGE || config.IMAGE_PATH || config.BOT_IMAGE;
        const cmdCount = commands.length;

        const start = Date.now();
        await conn.sendPresenceUpdate('composing', from);
        const ping = Date.now() - start;

        let menuText;
        if (menuStyle === '2') menuText = menuStyle2(cfg, senderTag, prefix, mode, ping, cmdCount);
        else menuText = menuStyle1(cfg, senderTag, prefix, mode, ping, cmdCount);

        const msgOptions = { contextInfo: { mentionedJid: [m.sender || sender] } };

        if (imageUrl) {
            await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: menuText,
                ...msgOptions
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                text: menuText,
                ...msgOptions
            }, { quoted: mek });
        }

    } catch (err) {
        console.log("MENU ERROR:", err);
        reply("❌ Menu error: " + err.message);
    }
});
