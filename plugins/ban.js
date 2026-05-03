const { cmd } = require('../inconnuboy');
// Import DB functions directly to avoid confusion with injected isSudo boolean
const { banUser, unbanUser, getBanList, isBanned: isBannedDB, isSudo: isSudoDB } = require('../lib/database');
const { getLang } = require('../lib/lang');

const NEWSLETTER = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363403408693274@newsletter',
        newsletterName: 'SHINIGAMI MD',
        serverMessageId: 143
    }
};

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// ── BAN ──────────────────────────────────────────────────────────
cmd({
    pattern: 'ban',
    desc: 'Ban a user from using the bot',
    category: 'owner',
    react: '🔨'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, args, config: cfg }) => {
    try {
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

        let target;
        if (m.quoted) target = m.quoted.sender.replace(/[^0-9]/g, '');
        else if (args[0]) target = args[0].replace(/[^0-9]/g, '');
        else return reply(t(cfg, 'BAN_NO_TARGET'));

        if (!target || target.length < 7) return reply(t(cfg, 'BAN_NO_TARGET'));

        const cleanBot = botNumber.replace(/[^0-9]/g, '');
        if (target === cleanBot) return reply('❌ *You cannot ban the bot itself.*');

        const alreadyBanned = await isBannedDB(botNumber, target);
        if (alreadyBanned) return reply(t(cfg, 'BAN_ALREADY'));

        const success = await banUser(botNumber, target);
        if (!success) return reply('❌ *Failed to ban user. Please try again.*');

        await conn.sendMessage(from, {
            text: t(cfg, 'BAN_SUCCESS', target),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) {
        console.error('BAN ERROR:', e);
        reply('❌ ' + e.message);
    }
});

// ── UNBAN ────────────────────────────────────────────────────────
cmd({
    pattern: 'unban',
    desc: 'Lift a ban from a user',
    category: 'owner',
    react: '✅'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, args, config: cfg }) => {
    try {
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

        let target;
        if (m.quoted) target = m.quoted.sender.replace(/[^0-9]/g, '');
        else if (args[0]) target = args[0].replace(/[^0-9]/g, '');
        else return reply(t(cfg, 'BAN_NO_TARGET'));

        if (!target || target.length < 7) return reply(t(cfg, 'BAN_NO_TARGET'));

        const isBannedUser = await isBannedDB(botNumber, target);
        if (!isBannedUser) return reply(`⚠️ *+${target} is not banned.*`);

        const success = await unbanUser(botNumber, target);
        if (!success) return reply('❌ *Failed to unban user. Please try again.*');

        await conn.sendMessage(from, {
            text: t(cfg, 'UNBAN_SUCCESS', target),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) {
        console.error('UNBAN ERROR:', e);
        reply('❌ ' + e.message);
    }
});

// ── BANLIST ──────────────────────────────────────────────────────
cmd({
    pattern: 'banlist',
    alias: ['bans', 'listban'],
    desc: 'List all banned users',
    category: 'owner',
    react: '📋'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, config: cfg }) => {
    try {
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

        const list = await getBanList(botNumber);
        const cleanBot = botNumber.replace(/[^0-9]/g, '');

        let status;
        if (!list || list.length === 0) {
            status = `📋 *BAN LIST — +${cleanBot}*\n\n_${t(cfg, 'NOT_FOUND')}_`;
        } else {
            const formatted = list.map((entry, i) => `  ${i + 1}. +${entry.number || entry.bannedNumber}`).join('\n');
            status = `🔨 *BAN LIST — +${cleanBot}*\n\n*Total: ${list.length}*\n\n${formatted}`;
        }

        await conn.sendMessage(from, {
            text: status,
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) {
        console.error('BANLIST ERROR:', e);
        reply('❌ ' + e.message);
    }
});
