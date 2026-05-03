/**
 * plugins/group-cmds.js
 * Commandes de groupe : leave, join, setpp, setname, setdesc, link
 */

const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const config = require('../config');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function isUserAdmin(conn, chatId, userId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const normalize = (id) => id ? id.replace(/:[0-9]+/g, '').replace(/@(lid|s\.whatsapp\.net|c\.us|g\.us)/g, '').replace(/[^\d]/g, '') : '';
        const normalizedUser = normalize(userId);
        for (let p of metadata.participants || []) {
            for (let pid of [p.id, p.lid, p.phoneNumber, p.jid].filter(Boolean)) {
                if (normalize(pid) === normalizedUser) {
                    return p.admin === 'admin' || p.admin === 'superadmin';
                }
            }
        }
        return false;
    } catch { return false; }
}

function isOwner(conn, sender) {
    const ownerNum = (config.OWNER_NUMBER || '').replace(/[^\d]/g, '');
    const senderNum = (sender || '').replace(/[^\d@s.whatsapp.net]/g, '').split('@')[0];
    return ownerNum === senderNum;
}

// ─────────────────────────────────────────────────────────────────────────────
// .leave — Owner only: quitter un groupe
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'leave',
    alias: ['quitter', 'quittregroupe'],
    desc: 'Leave the current group (Owner only)',
    category: 'group',
    react: '🚪',
    use: '.leave',
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, config: cfg, isGroup }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));
        if (!isOwner(conn, sender)) return reply(t(cfg, 'OWNER_ONLY'));

        await reply(t(cfg, 'LEAVE_MSG'));
        await new Promise(r => setTimeout(r, 1000));
        await conn.groupLeave(from);
    } catch (e) {
        console.error('LEAVE ERROR:', e);
        reply('❌ ' + e.message);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .join — Owner only: rejoindre un groupe via lien
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'join',
    alias: ['joindre'],
    desc: 'Join a group via invite link (Owner only)',
    category: 'group',
    react: '🔗',
    use: '.join <invite link>',
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply, config: cfg }) => {
    try {
        if (!isOwner(conn, sender)) return reply(t(cfg, 'OWNER_ONLY'));
        if (!args[0]) return reply(t(cfg, 'JOIN_USAGE'));

        const link = args[0].trim();

        // Extraire le code du lien
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
        if (!match) return reply(t(cfg, 'JOIN_INVALID'));

        const inviteCode = match[1];
        await conn.groupAcceptInvite(inviteCode);
        await reply(t(cfg, 'JOIN_SUCCESS'));
    } catch (e) {
        console.error('JOIN ERROR:', e);
        if (e.message?.includes('not-authorized') || e.message?.includes('401')) {
            return reply(t(cfg, 'JOIN_EXPIRED'));
        }
        reply('❌ ' + e.message);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .setpp — Changer la photo de profil du groupe (reply à une image)
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'setpp',
    alias: ['setgrouppp', 'setgroupicon', 'setprofil'],
    desc: 'Change the group profile picture (reply to an image)',
    category: 'group',
    react: '🖼️',
    use: '.setpp (reply to image)',
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, config: cfg, isGroup }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));

        const senderIsAdmin = await isUserAdmin(conn, from, sender);
        if (!senderIsAdmin && !isOwner(conn, sender)) return reply(t(cfg, 'ADMIN_ONLY'));

        // Chercher l'image : reply ou message courant
        let imageBuffer = null;

        const targets = [];
        if (mek.quoted) targets.push(mek.quoted);
        targets.push(mek);

        for (const target of targets) {
            if (!target || !target.message) continue;
            const msg = target.message;
            const imgMsg = msg.imageMessage || msg.message?.imageMessage;
            if (imgMsg) {
                try {
                    imageBuffer = await conn.downloadMediaMessage(target);
                    if (imageBuffer && imageBuffer.length > 0) break;
                } catch (dlErr) {
                    console.error('setpp download error:', dlErr.message);
                }
            }
        }

        if (!imageBuffer) return reply(t(cfg, 'SETPP_USAGE'));

        await conn.updateProfilePicture(from, imageBuffer);
        await reply(t(cfg, 'SETPP_SUCCESS'));
    } catch (e) {
        console.error('SETPP ERROR:', e);
        if (e.message?.includes('not-authorized') || e.message?.includes('forbidden')) {
            return reply(t(cfg, 'SETPP_NO_PERM'));
        }
        reply('❌ ' + e.message);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .setname — Changer le nom du groupe
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'setname',
    alias: ['setgroupname', 'renamegroup', 'nomgroupe'],
    desc: 'Change the group name',
    category: 'group',
    react: '✏️',
    use: '.setname <new name>',
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply, config: cfg, isGroup }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));

        const senderIsAdmin = await isUserAdmin(conn, from, sender);
        if (!senderIsAdmin && !isOwner(conn, sender)) return reply(t(cfg, 'ADMIN_ONLY'));

        const newName = args.join(' ').trim();
        if (!newName) return reply(t(cfg, 'SETNAME_USAGE'));

        await conn.groupUpdateSubject(from, newName);
        await reply(t(cfg, 'SETNAME_SUCCESS', newName));
    } catch (e) {
        console.error('SETNAME ERROR:', e);
        reply('❌ ' + e.message);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .setdesc — Changer la description du groupe
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'setdesc',
    alias: ['setgroupdesc', 'groupdesc', 'description'],
    desc: 'Change the group description',
    category: 'group',
    react: '📝',
    use: '.setdesc <new description>',
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply, config: cfg, isGroup }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));

        const senderIsAdmin = await isUserAdmin(conn, from, sender);
        if (!senderIsAdmin && !isOwner(conn, sender)) return reply(t(cfg, 'ADMIN_ONLY'));

        const newDesc = args.join(' ').trim();
        if (!newDesc) return reply(t(cfg, 'SETDESC_USAGE'));

        await conn.groupUpdateDescription(from, newDesc);
        await reply(t(cfg, 'SETDESC_SUCCESS'));
    } catch (e) {
        console.error('SETDESC ERROR:', e);
        reply('❌ ' + e.message);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .link — Révoquer et obtenir le nouveau lien d'invitation du groupe
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'link',
    alias: ['invitelink', 'grouplink', 'lien'],
    desc: 'Revoke and get new group invite link',
    category: 'group',
    react: '🔗',
    use: '.link',
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, config: cfg, isGroup }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'GROUPS_ONLY'));

        const senderIsAdmin = await isUserAdmin(conn, from, sender);
        if (!senderIsAdmin && !isOwner(conn, sender)) return reply(t(cfg, 'ADMIN_ONLY'));

        // Révoquer l'ancien lien et générer un nouveau
        const newCode = await conn.groupRevokeInvite(from);
        const inviteLink = `https://chat.whatsapp.com/${newCode}`;

        await reply(t(cfg, 'LINK_SUCCESS', inviteLink));
    } catch (e) {
        console.error('LINK ERROR:', e);
        reply('❌ ' + e.message);
    }
});
