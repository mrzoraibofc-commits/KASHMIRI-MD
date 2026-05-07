const { cmd } = require('../command');
const config = require("../config");

// Initialize warnings globally
if (!global.warnings) {
    global.warnings = {};
}

cmd({
    'on': "body"
}, async (conn, m, store, {
    from,
    body,
    sender,
    isGroup,
    isAdmins,
    isBotAdmins,
    reply
}) => {
    try {
        // ==== CHECKS ====
        if (!isGroup) return;                    // Sirf groups mein
        if (isAdmins) return;                    // Admins ko check nahi karna
        if (!isBotAdmins) {                       // Bot admin nahi hai to
            console.log("⚠️ Bot is not admin, anti-link won't work");
            return;
        }

        // ==== ANTI-LINK ENABLED CHECK (DIRECT FROM CONFIG) ====
        const antiLinkEnabled = config.ANTI_LINK === 'true' || config.ANTI_LINK === true;
        if (!antiLinkEnabled) return;

        // ==== LINK DETECTION PATTERNS ====
        const linkPatterns = [
            // WhatsApp links
            /(chat\.whatsapp\.com|wa\.me|whatsapp\.com|api\.whatsapp\.com|call\.whatsapp\.com|open\.whatsapp\.com|wa\.link|whatsapp\.link)/gi,
            /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me|whatsapp\.com|api\.whatsapp\.com)\/\S+/gi,
            
            // Telegram links
            /(t\.me|telegram\.me|telegram\.dog|telegram\.org)/gi,
            /(https?:\/\/)?(www\.)?(t\.me|telegram\.me|telegram\.dog)\/\S+/gi,
            
            // Social media links
            /(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|instagram\.com|instagr\.am|twitter\.com|x\.com|youtube\.com|youtu\.be|tiktok\.com|vm\.tiktok\.com|snapchat\.com|discord\.com|discord\.gg|reddit\.com|linkedin\.com|pinterest\.com|twitch\.tv|medium\.com|quora\.com|spotify\.com)/gi,
            
            // Generic domain links
            /(https?:\/\/)?(www\.)?[a-zA-Z0-9\-]+\.(com|org|net|edu|gov|mil|biz|info|io|co|uk|us|ru|cn|xyz|online|site|tech|store|blog|app|me|tv|fm|gg|cc|ws|pw|top|win|bid|loan|date|review|trade|webcam|download|stream|racing|party|country|science|gq|ml|tk|cf|ga|link|live|news|video|today|chat|group|world|space|press|host|website|agency|work|cloud|help|support|email|media|network|solutions|consulting|international|center|company|info|technology|directory|gallery)\b/gi,
            
            // URLs with protocols
            /(https?:\/\/|ftp:\/\/|http:\/\/|www\.)[^\s]+/gi,
            
            // Shortened URLs
            /(bit\.ly|tinyurl\.com|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly|shorte\.st|bc\.vc|t\.co|lnkd\.in|db\.tt|qr\.ae|cur\.lv|bitly\.com|tiny\.cc|tr\.im|v\.gd|cli\.gs|url\.ie|short\.to|post\.ly|social\.ms|x\.co|wp\.me|fb\.me|ig\.me|youtu\.be|trib\.al|flic\.kr|pin\.it|amzn\.to|a\.co|bbc\.in|nyti\.ms|reut\.rs|for\.tv|4sq\.com|wp\.com|wp\.link|wp\.me|lnkd\.in)/gi
        ];

        // Get message text
        let messageText = '';
        
        if (m.message?.conversation) {
            messageText = m.message.conversation;
        } else if (m.message?.extendedTextMessage?.text) {
            messageText = m.message.extendedTextMessage.text;
        } else if (m.message?.imageMessage?.caption) {
            messageText = m.message.imageMessage.caption;
        } else if (m.message?.videoMessage?.caption) {
            messageText = m.message.videoMessage.caption;
        } else if (m.message?.documentMessage?.caption) {
            messageText = m.message.documentMessage.caption;
        } else {
            return;
        }

        if (!messageText) return;

        // Check for links
        let containsLink = false;
        
        for (const pattern of linkPatterns) {
            pattern.lastIndex = 0; // Reset regex
            if (pattern.test(messageText)) {
                containsLink = true;
                break;
            }
        }

        if (containsLink) {
            console.log(`🔗 Link detected from ${sender}`);
            
            // ==== DELETE MESSAGE ====
            try {
                await conn.sendMessage(from, {
                    delete: m.key
                });
                console.log(`✅ Message deleted`);
            } catch (error) {
                console.error("❌ Failed to delete:", error);
            }

            // ==== CHECK IF GROUP LINK ====
            const isGroupLink = /(chat\.whatsapp\.com|wa\.me|whatsapp\.com\/invite|whatsapp\.com\/channel)/gi.test(messageText);
            
            // ==== ANTI-LINK KICK CHECK ====
            const antiLinkKick = config.ANTI_LINK_KICK === 'true' || config.ANTI_LINK_KICK === true;
            
            if (antiLinkKick && isGroupLink) {
                try {
                    await conn.sendMessage(from, {
                        text: `@${sender.split('@')[0]} *has been removed for sending a group link!*`,
                        mentions: [sender]
                    });
                    await conn.groupParticipantsUpdate(from, [sender], "remove");
                    console.log(`✅ User removed for group link`);
                    return;
                } catch (error) {
                    console.error("❌ Failed to remove:", error);
                }
            }

            // ==== WARNING SYSTEM ====
            const warnLimit = parseInt(config.WARN_LIMIT) || 3;
            
            if (!global.warnings[sender]) {
                global.warnings[sender] = 1;
            } else {
                global.warnings[sender] += 1;
            }
            
            const warningCount = global.warnings[sender];

            // Send warning message
            try {
                let warningMsg = '';
                
                if (warningCount < warnLimit) {
                    warningMsg = `╔════════════════════╗
║  ⚠️ *WARNING* ⚠️   ║
╠════════════════════╣
║  👤 *User:* @${sender.split('@')[0]}
║  📊 *Warning:* ${warningCount}/${warnLimit}
║  🔗 *Reason:* Link Detected
║  ⚡ *Action:* Message Deleted
║  
║  ❗ *Sending links is not allowed!*
╚════════════════════╝`;
                } else {
                    warningMsg = `╔════════════════════╗
║  ⛔ *REMOVED* ⛔   ║
╠════════════════════╣
║  👤 *User:* @${sender.split('@')[0]}
║  📊 *Warnings:* ${warningCount}/${warnLimit}
║  🔗 *Reason:* Link Detected
║  
║  ❌ *Warning limit exceeded!*
║  🚫 *User has been removed*
╚════════════════════╝`;
                }

                await conn.sendMessage(from, {
                    text: warningMsg,
                    mentions: [sender]
                });
                
            } catch (error) {
                console.error("❌ Failed to send warning:", error);
            }

            // ==== REMOVE USER IF LIMIT EXCEEDED ====
            if (warningCount >= warnLimit) {
                try {
                    await conn.groupParticipantsUpdate(from, [sender], "remove");
                    console.log(`✅ User removed (warning limit)`);
                    delete global.warnings[sender];
                } catch (error) {
                    console.error("❌ Failed to remove user:", error);
                    await conn.sendMessage(from, {
                        text: `❌ *Failed to remove @${sender.split('@')[0]}. Make sure I'm admin!*`,
                        mentions: [sender]
                    });
                }
            }
        }
        
    } catch (error) {
        console.error("❌ Anti-link error:", error);
    }
});