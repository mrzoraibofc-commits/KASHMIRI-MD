const { cmd } = require('../inconnuboy');
// Import DB functions directly (not relying on injected isSudo which is a boolean)
const { addSudo, removeSudo, getSudoList, isSudo: isSudoDB } = require('../lib/database');
const { getLang } = require('../lib/lang');

const NEWSLETTER = {
    forwardingScore: 999, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363403408693274@newsletter',
        newsletterName: 'SHINIGAMI MD', serverMessageId: 143
    }
};

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// ── SUDOADD ──────────────────────────────────────────────────────
cmd({
    pattern: 'sudoadd', desc: 'Grant sudo access',
    category: 'owner', react: '👑'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, args, config: cfg }) => {
    try {
        // isSudo here is a boolean passed from the handler
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

        let target;
        if (m.quoted) target = m.quoted.sender.replace(/[^0-9]/g, '');
        else if (args[0]) target = args[0].replace(/[^0-9]/g, '');
        else return reply('📖 *Usage:* .sudoadd <number> or reply to a message');

        if (!target || target.length < 7) return reply('❌ *Invalid number.*');

        // Use the DB function directly
        const alreadySudo = await isSudoDB(botNumber, target);
        if (alreadySudo) return reply(`⚠️ *+${target} is already sudo.*`);

        const success = await addSudo(botNumber, target);
        if (!success) return reply('❌ *Failed. Try again.*');

        await conn.sendMessage(from, {
            text: t(cfg, 'SUDO_ADDED', target),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) { reply('❌ ' + e.message); }
});

// ── SUDODEL ──────────────────────────────────────────────────────
cmd({
    pattern: 'sudodel', alias: ['sudorm', 'sudoremove'],
    desc: 'Revoke sudo access', category: 'owner', react: '🗑️'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, args, config: cfg }) => {
    try {
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

        let target;
        if (m.quoted) target = m.quoted.sender.replace(/[^0-9]/g, '');
        else if (args[0]) target = args[0].replace(/[^0-9]/g, '');
        else return reply('📖 *Usage:* .sudodel <number> or reply to a message');

        if (!target || target.length < 7) return reply('❌ *Invalid number.*');

        const isSudoUser = await isSudoDB(botNumber, target);
        if (!isSudoUser) return reply(`⚠️ *+${target} is not sudo.*`);

        const success = await removeSudo(botNumber, target);
        if (!success) return reply('❌ *Failed. Try again.*');

        await conn.sendMessage(from, {
            text: t(cfg, 'SUDO_REMOVED', target),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) { reply('❌ ' + e.message); }
});

// ── SUDOLIST ─────────────────────────────────────────────────────
cmd({
    pattern: 'sudolist', alias: ['sudos', 'listsudo'],
    desc: 'List all sudo users', category: 'owner', react: '📋'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, config: cfg }) => {
    try {
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

        const list = await getSudoList(botNumber);
        const cleanBot = botNumber.replace(/[^0-9]/g, '');

        let status;
        if (!list || list.length === 0) {
            status = t(cfg, 'SUDO_EMPTY');
        } else {
            const formatted = list.map((num, i) => `  ${i + 1}. +${num}`).join('\n');
            status = t(cfg, 'SUDO_LIST', `*Session: +${cleanBot}*\n\n${formatted}`);
        }

        await conn.sendMessage(from, {
            text: status,
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) { reply('❌ ' + e.message); }
});
