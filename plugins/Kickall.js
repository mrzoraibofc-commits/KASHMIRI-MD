const { cmd } = require('../inconnuboy');
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

// ================================================================
// 🔄 KICKALL — Kick members one by one
// ================================================================
cmd({
    pattern: 'kickall',
    desc: 'Kick all members from the group one by one',
    category: 'owner',
    react: '🔄'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, isGroup, config: cfg }) => {
    try {
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));

        // Check bot is admin
        const groupMetadata = await conn.groupMetadata(from);
        const botJid = conn.user.id;
        const botClean = botJid.replace(/[^0-9]/g, '');
        const botAdmin = groupMetadata.participants.find(p => p.id.replace(/[^0-9]/g, '') === botClean);

        if (!botAdmin || !['admin', 'superadmin'].includes(botAdmin.admin)) {
            return reply(t(cfg, 'KICKALL_NO_PERM'));
        }

        const ownerClean = (conn.user.id || '').replace(/[^0-9]/g, '');
        const members = groupMetadata.participants.filter(p => {
            const num = p.id.replace(/[^0-9]/g, '');
            // Don't kick bot itself, owner, or admins
            if (num === ownerClean) return false;
            if (num === botClean) return false;
            if (p.admin === 'admin' || p.admin === 'superadmin') return false;
            return true;
        });

        if (members.length === 0) {
            return reply('⚠️ *No members to kick.*');
        }

        await conn.sendMessage(from, {
            text: t(cfg, 'KICKALL_START'),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

        let kicked = 0;
        for (const member of members) {
            try {
                await conn.groupParticipantsUpdate(from, [member.id], 'remove');
                kicked++;
                // Small delay to avoid spam ban
                await new Promise(r => setTimeout(r, 500));
            } catch (e) {
                console.error(`Failed to kick ${member.id}:`, e.message);
            }
        }

        await conn.sendMessage(from, {
            text: t(cfg, 'KICKALL_DONE', kicked),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) {
        console.error('KICKALL ERROR:', e);
        reply(t(cfg, 'ERROR') + e.message);
    }
});

// ================================================================
// ⚡ KICKALL2 — Kick all members instantly (batch)
// ================================================================
cmd({
    pattern: 'kickall2',
    desc: 'Kick all members from the group instantly (all at once)',
    category: 'owner',
    react: '⚡'
},
async (conn, mek, m, { from, reply, isOwner, isSudo, botNumber, isGroup, config: cfg }) => {
    try {
        if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));

        // Check bot is admin
        const groupMetadata = await conn.groupMetadata(from);
        const botJid = conn.user.id;
        const botClean = botJid.replace(/[^0-9]/g, '');
        const botAdmin = groupMetadata.participants.find(p => p.id.replace(/[^0-9]/g, '') === botClean);

        if (!botAdmin || !['admin', 'superadmin'].includes(botAdmin.admin)) {
            return reply(t(cfg, 'KICKALL_NO_PERM'));
        }

        const ownerClean = (conn.user.id || '').replace(/[^0-9]/g, '');
        const members = groupMetadata.participants.filter(p => {
            const num = p.id.replace(/[^0-9]/g, '');
            if (num === ownerClean) return false;
            if (num === botClean) return false;
            if (p.admin === 'admin' || p.admin === 'superadmin') return false;
            return true;
        });

        if (members.length === 0) {
            return reply('⚠️ *No members to kick.*');
        }

        await conn.sendMessage(from, {
            text: t(cfg, 'KICKALL2_START'),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

        // Kick all at once
        const memberIds = members.map(p => p.id);
        try {
            await conn.groupParticipantsUpdate(from, memberIds, 'remove');
        } catch (e) {
            console.error('KICKALL2 batch error:', e.message);
            // Fallback: try in chunks of 5
            for (let i = 0; i < memberIds.length; i += 5) {
                const chunk = memberIds.slice(i, i + 5);
                try {
                    await conn.groupParticipantsUpdate(from, chunk, 'remove');
                } catch (err) {
                    console.error(`Chunk kick failed:`, err.message);
                }
            }
        }

        await conn.sendMessage(from, {
            text: t(cfg, 'KICKALL_DONE', memberIds.length),
            contextInfo: NEWSLETTER
        }, { quoted: mek });

    } catch (e) {
        console.error('KICKALL2 ERROR:', e);
        reply(t(cfg, 'ERROR') + e.message);
    }
});
