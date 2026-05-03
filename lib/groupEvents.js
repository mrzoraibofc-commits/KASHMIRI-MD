
/**
 * lib/groupEvents.js
 * Group participant events — Welcome / Goodbye styled
 */

const config = require('../config');
const { getLang } = require('./lang');

const NEWSLETTER = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363426106687970@newsletter',
        newsletterName: 'MUZAMIL-XMD',
        serverMessageId: 143
    }
};

/**
 * Main group events handler
 */
async function groupEvents(conn, update, userCfg) {
    try {
        const { id, participants, action } = update;
        const cfg = userCfg || {};
        const lang = cfg.BOT_LANG || 'en';
        const t = (key, ...args) => getLang(lang, key, ...args);

        for (const participant of participants) {
            try {
                let groupMeta = null;
                try { groupMeta = await conn.groupMetadata(id); } catch (_) {}

                const groupName  = groupMeta ? groupMeta.subject : 'Group';
                const memberCount = groupMeta ? groupMeta.participants.length : '?';
                const adminCount  = groupMeta
                    ? groupMeta.participants.filter(p => p.admin).length
                    : '?';
                const userTag   = participant.split('@')[0];
                const now       = new Date();
                const dateStr   = now.toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                const botName = cfg.BOT_NAME || config.BOT_NAME || 'BOT';

                // ── WELCOME ──────────────────────────────────────────────
                if (action === 'add') {
                    const welcomeVal = cfg.WELCOME ?? config.WELCOME_ENABLE ?? 'true';
                    const welcomeEnabled = String(welcomeVal) === 'true';
                    if (!welcomeEnabled) continue;

                    const defaultWelcome =
`╭───────────────⭓ 
│ BOT : ${botName}
│ DEV : MUZAMIL KHAN
│ ᴠᴇʀꜱɪᴏɴ : 2.0.0
╰───────────────⭓

╭─  *WELCOME*
│ • user : @${userTag}
│ • group : ${groupName}
│ • members : ${memberCount}
│ • admin : ${adminCount}
│ • date : ${dateStr}
╰───────────────⭓`;

                    let welcomeMsg = cfg.WELCOME_MSG || config.WELCOME_MSG || defaultWelcome;
                    // Replace tags
                    welcomeMsg = welcomeMsg
                        .replace(/\{user\}/gi, `@${userTag}`)
                        .replace(/\{group\}/gi, groupName)
                        .replace(/\{members\}/gi, memberCount)
                        .replace(/\{date\}/gi, dateStr);

                    const img = cfg.WELCOME_IMAGE || config.WELCOME_IMAGE || cfg.IMAGE_PATH || config.IMAGE_PATH || null;

                    if (img) {
                        await conn.sendMessage(id, { image: { url: img }, caption: welcomeMsg, mentions: [participant], contextInfo: NEWSLETTER });
                    } else {
                        await conn.sendMessage(id, { text: welcomeMsg, mentions: [participant], contextInfo: NEWSLETTER });
                    }
                }

                // ── GOODBYE ──────────────────────────────────────────────
                else if (action === 'remove') {
                    const goodbyeVal = cfg.GOODBYE ?? config.GOODBYE_ENABLE ?? 'true';
                    const goodbyeEnabled = String(goodbyeVal) === 'true';
                    if (!goodbyeEnabled) continue;

                    const defaultGoodbye =
`╭───────────────⭓ 
│ BOT : ${botName}
│ DEV : MUZAMIL KHAN
│ ᴠᴇʀꜱɪᴏɴ : 2.0.0
╰───────────────⭓

╭─  *GOODBYE*
│ • user : @${userTag}
│ • group : ${groupName}
│ • members : ${memberCount}
│ • admin : ${adminCount}
│ • date : ${dateStr}
╰───────────────⭓`;

                    let goodbyeMsg = cfg.GOODBYE_MSG || config.GOODBYE_MSG || defaultGoodbye;
                    // Replace tags
                    goodbyeMsg = goodbyeMsg
                        .replace(/\{user\}/gi, `@${userTag}`)
                        .replace(/\{group\}/gi, groupName)
                        .replace(/\{members\}/gi, memberCount)
                        .replace(/\{date\}/gi, dateStr);

                    const img = cfg.GOODBYE_IMAGE || config.GOODBYE_IMAGE || cfg.IMAGE_PATH || config.IMAGE_PATH || null;

                    if (img) {
                        await conn.sendMessage(id, { image: { url: img }, caption: goodbyeMsg, mentions: [participant], contextInfo: NEWSLETTER });
                    } else {
                        await conn.sendMessage(id, { text: goodbyeMsg, mentions: [participant], contextInfo: NEWSLETTER });
                    }
                }

                // ── PROMOTE ──────────────────────────────────────────────
                else if (action === 'promote') {
                    await conn.sendMessage(id, {
                        text: t('PROMOTED', userTag),
                        mentions: [participant],
                        contextInfo: NEWSLETTER
                    });
                }

                // ── DEMOTE ───────────────────────────────────────────────
                else if (action === 'demote') {
                    await conn.sendMessage(id, {
                        text: t('DEMOTED', userTag),
                        mentions: [participant],
                        contextInfo: NEWSLETTER
                    });
                }

            } catch (innerErr) {
                console.error(`❌ groupEvents inner error for ${participant}:`, innerErr.message);
            }
        }
    } catch (err) {
        console.error('❌ groupEvents error:', err.message);
    }
}

module.exports = { groupEvents };
