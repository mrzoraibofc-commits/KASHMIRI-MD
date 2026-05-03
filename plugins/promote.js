
const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const { sleep } = require('../lib/functions');

const NEWSLETTER = {
    forwardingScore: 999, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363403408693274@newsletter',
        newsletterName: 'SHINIGAMI MD', serverMessageId: 143
    }
};

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: 'promote', alias: ['makeadmin'],
    react: '⬆️', desc: 'Promote a member to admin',
    category: 'group', filename: __filename
}, async (conn, mek, m, { from, args, isGroup, reply, isCreator, isAdmins, config: cfg }) => {
    try {
        if (!isGroup) return reply('⚠️ *Groups only.*');
        if (!isAdmins && !isCreator) return reply(t(cfg, 'KICK_NO_PERM'));

        let targetJid;
        if (m.quoted) {
            targetJid = m.quoted.sender;
        } else if (args.length) {
            const num = args.join('').replace(/[^0-9]/g, '');
            if (!num) return reply('⚠️ *Invalid number.*');
            targetJid = num + '@s.whatsapp.net';
        } else {
            return reply('⚠️ *Reply to a user or give a number.*');
        }

        await sleep(500);
        await conn.groupParticipantsUpdate(from, [targetJid], 'promote');
        const num = targetJid.split('@')[0];

        await conn.sendMessage(from, {
            text: t(cfg, 'PROMOTED', num),
            mentions: [targetJid],
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) {
        reply('❌ *Error: Could not promote.*');
    }
});
