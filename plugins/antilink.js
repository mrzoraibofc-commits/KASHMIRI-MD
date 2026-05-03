/**
 * plugins/antilink.js — FIXED VERSION
 * Détecte et supprime TOUS les types de liens dans les groupes.
 * Modes: delete (défaut), warn (3 avertissements puis kick), kick (kick immédiat)
 * État stocké par groupe en mémoire (persiste pendant la session).
 */

const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const config = require('../config');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// ─── STORAGE ──────────────────────────────────────────────────────────────────
// Map: groupId → { enabled: bool, mode: 'delete'|'warn'|'kick' }
const antilinkSettings = new Map();

// Compteur d'avertissements : userId → count
const warningCount = {};

// ─── REGEX — Détecte TOUS les types de liens ──────────────────────────────────
const LINK_REGEX = /(?:https?:\/\/|www\.)[^\s<>]+|(?:wa\.me|whatsapp\.com|t\.me|telegram\.me|discord\.gg|discord\.com\/invite|bit\.ly|tinyurl\.com|goo\.gl|shorturl\.at)\/[^\s<>]*|(?:[a-z0-9-]+\.(?:com|org|net|co|io|xyz|online|site|app|dev|me|biz|info|shop|store|blog|ai|gov|edu|pk|fr|de|uk|ca|us|ru|in|br|au|id|ng|gh|ke|za|gg|ly|fm|tv)(?:\/[^\s<>]*)?)/gi;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

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

async function isBotAdmin(conn, chatId) {
    try {
        const metadata = await conn.groupMetadata(chatId);
        const botId = conn.user?.id || '';
        const botLid = conn.user?.lid || '';
        const normalize = (id) => id ? id.replace(/:[0-9]+/g, '').replace(/@(lid|s\.whatsapp\.net|c\.us|g\.us)/g, '').replace(/[^\d]/g, '') : '';
        const normBot = normalize(botId);
        const normLid = normalize(botLid);
        for (let p of metadata.participants || []) {
            if (p.admin === 'admin' || p.admin === 'superadmin') {
                for (let pid of [p.id, p.lid, p.phoneNumber].filter(Boolean)) {
                    const n = normalize(pid);
                    if (n === normBot || (normLid && n === normLid)) return true;
                }
            }
        }
        return false;
    } catch { return false; }
}

function isOwnerCheck(conn, sender) {
    const ownerNum = (config.OWNER_NUMBER || '').replace(/[^\d]/g, '');
    const senderNum = (sender || '').split('@')[0].replace(/[^\d]/g, '');
    return ownerNum === senderNum;
}

function containsLink(text) {
    if (!text || text.trim() === '') return false;
    LINK_REGEX.lastIndex = 0;
    return LINK_REGEX.test(text);
}

// ─── DÉTECTION AUTOMATIQUE (on body) ─────────────────────────────────────────

cmd({
    on: 'body',
    dontAddCommandList: true
},
async (conn, mek, m, { from, body, sender, isGroup }) => {
    try {
        if (!isGroup) return;

        const settings = antilinkSettings.get(from);
        if (!settings || !settings.enabled) return;

        if (!body || !containsLink(body)) return;

        const senderIsAdmin = await isUserAdmin(conn, from, sender);
        if (senderIsAdmin || isOwnerCheck(conn, sender)) return;

        const botIsAdmin = await isBotAdmin(conn, from);
        if (!botIsAdmin) return;

        const userNum = sender.split('@')[0];
        const mode = settings.mode || 'delete';

        console.log(`[ANTILINK] Lien détecté de @${userNum} — mode: ${mode}`);

        // 1. Supprimer le message
        try {
            await conn.sendMessage(from, { delete: mek.key });
        } catch (delErr) {
            console.error('[ANTILINK] Suppression échouée:', delErr.message);
        }

        // 2. Action selon le mode
        if (mode === 'warn') {
            warningCount[sender] = (warningCount[sender] || 0) + 1;
            const count = warningCount[sender];

            if (count >= 3) {
                await conn.sendMessage(from, {
                    text: `🚫 @${userNum} *a atteint 3/3 avertissements et a été expulsé !*`,
                    mentions: [sender]
                });
                await conn.groupParticipantsUpdate(from, [sender], 'remove').catch(e => console.error('[ANTILINK] Kick échoué:', e.message));
                delete warningCount[sender];
            } else {
                await conn.sendMessage(from, {
                    text: `⚠️ @${userNum} *a envoyé un lien interdit !*\n📊 Avertissement : *${count}/3*\n_Les liens sont strictement interdits dans ce groupe._`,
                    mentions: [sender]
                });
            }

        } else if (mode === 'kick') {
            await conn.sendMessage(from, {
                text: `🚫 @${userNum} *a envoyé un lien et a été expulsé !*`,
                mentions: [sender]
            });
            await conn.groupParticipantsUpdate(from, [sender], 'remove').catch(e => console.error('[ANTILINK] Kick échoué:', e.message));

        } else {
            // Mode: delete seulement
            await conn.sendMessage(from, {
                text: `🚫 *Les liens ne sont pas autorisés dans ce groupe !*\n@${userNum} — Ton message a été supprimé.`,
                mentions: [sender]
            });
        }

    } catch (error) {
        console.error('[ANTILINK] Erreur handler:', error);
    }
});

// ─── COMMANDE ANTILINK ────────────────────────────────────────────────────────

cmd({
    pattern: 'antilink',
    alias: ['alink', 'blocklink'],
    desc: 'Toggle and configure anti-link system',
    category: 'group',
    react: '🔗',
    use: '.antilink on/off/warn/kick/delete/status',
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply, isGroup, config: cfg }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'ANTILINK_GROUP_ONLY'));

        const senderIsAdmin = await isUserAdmin(conn, from, sender);
        if (!senderIsAdmin && !isOwnerCheck(conn, sender)) return reply(t(cfg, 'ANTILINK_ADMIN_ONLY'));

        const current = antilinkSettings.get(from) || { enabled: false, mode: 'delete' };
        const action = (args[0] || 'status').toLowerCase();

        switch (action) {
            case 'on':
                antilinkSettings.set(from, { ...current, enabled: true });
                return reply(`✅ *Anti-link ACTIVÉ !*\n📌 Mode actuel : *${current.mode || 'delete'}*\n_Utilisez .antilink warn/kick/delete pour changer le mode._`);

            case 'off':
                antilinkSettings.set(from, { ...current, enabled: false });
                return reply(`❌ *Anti-link DÉSACTIVÉ.*\n_Les liens sont maintenant autorisés._`);

            case 'warn':
            case 'kick':
            case 'delete':
                antilinkSettings.set(from, { enabled: true, mode: action });
                const modeDesc = {
                    warn: '⚠️ 3 avertissements puis kick',
                    kick: '🚫 Kick immédiat',
                    delete: '🗑️ Suppression du message seulement'
                };
                return reply(`✅ *Anti-link ACTIVÉ — Mode: ${action.toUpperCase()}*\n📌 ${modeDesc[action]}`);

            default:
                const s = antilinkSettings.get(from) || { enabled: false, mode: 'delete' };
                return reply(
                    `📌 *Status Anti-link:*\n\n` +
                    `• État : ${s.enabled ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ'}\n` +
                    `• Mode : *${s.mode || 'delete'}*\n\n` +
                    `*Commandes :*\n` +
                    `.antilink on/off\n` +
                    `.antilink warn — 3 warnings puis kick\n` +
                    `.antilink kick — kick immédiat\n` +
                    `.antilink delete — suppression seulement`
                );
        }

    } catch (error) {
        console.error('[ANTILINK CMD] Erreur:', error);
        reply('❌ Erreur: ' + error.message);
    }
});
