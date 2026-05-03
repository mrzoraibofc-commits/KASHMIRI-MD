const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');

const NEWSLETTER = {
    forwardingScore: 999, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363403408693274@newsletter',
        newsletterName: 'SHINIGAMI MD', serverMessageId: 143
    }
};

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

async function checkAdminStatus(conn, chatId, senderId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const botId = conn.user?.id || '';
        const botLid = conn.user?.lid || '';
        const botNum = botId.split(':')[0].split('@')[0];
        const botLidNum = botLid.split(':')[0].split('@')[0];
        const senderNum = senderId.split(':')[0].split('@')[0];

        let isBotAdmin = false, isSenderAdmin = false;

        for (const p of metadata.participants) {
            if (p.admin !== 'admin' && p.admin !== 'superadmin') continue;
            const pId = (p.id || '').split('@')[0];
            const pLid = (p.lid || '').split(':')[0].split('@')[0];
            const pPhone = (p.phoneNumber || '').split('@')[0];

            if (botNum === pId || botNum === pPhone || botLidNum === pLid) isBotAdmin = true;
            if (senderNum === pId || senderNum === pPhone || senderNum === pLid) isSenderAdmin = true;
        }
        return { isBotAdmin, isSenderAdmin };
    } catch {
        return { isBotAdmin: false, isSenderAdmin: false };
    }
}

cmd({
    pattern: 'unmute', alias: ['groupunmute'],
    react: '🔊', desc: 'Unmute the group',
    category: 'group', filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, config: cfg }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));

        const senderId = mek.key.participant || mek.key.remoteJid;
        if (!senderId) return reply('❌ *Could not identify sender.*');

        const { isBotAdmin, isSenderAdmin } = await checkAdminStatus(conn, from, senderId);
        if (!isSenderAdmin) return reply(t(cfg, 'MUTE_NO_PERM_SENDER'));
        if (!isBotAdmin) return reply(t(cfg, 'MUTE_NO_PERM_BOT'));

        await conn.groupSettingUpdate(from, 'not_announcement');

        await conn.sendMessage(from, {
            text: t(cfg, 'UNMUTE_SUCCESS'),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) {
        reply('❌ *Failed to unmute. Please try again.*');
    }
});
