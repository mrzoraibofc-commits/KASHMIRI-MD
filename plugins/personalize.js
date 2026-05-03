/**
 * plugins/personalize.js
 * New commands: setbotname, setimage, setmenu, setlang
 */

const { cmd } = require('../inconnuboy');
const { updateUserConfig } = require('../lib/database');
const { getLang } = require('../lib/lang');

// Helper to get current lang from config
const t = (config, key, ...args) => getLang(config.BOT_LANG || 'en', key, ...args);

// Helper to update config
const updateConfig = async (key, value, botNumber, config, reply) => {
    try {
        config[key] = value;
        const newConfig = { ...config };
        newConfig[key] = value;
        await updateUserConfig(botNumber, newConfig);
        return true;
    } catch (e) {
        console.error(e);
        reply(t(config, 'SETTINGS_DB_ERROR'));
        return false;
    }
};

// ──────────────────────────────────────────────────────────────────
// 1. SETBOTNAME — Change the bot's display name
// ──────────────────────────────────────────────────────────────────
cmd({
    pattern: "setbotname",
    alias: ["botname"],
    desc: "Change the bot name",
    category: "settings",
    react: "✏️"
},
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));

    const newName = args.join(' ').trim();
    if (!newName) return reply(t(config, 'SETBOTNAME_USAGE'));

    const ok = await updateConfig('BOT_NAME', newName, botNumber, config, reply);
    if (ok) reply(t(config, 'SETBOTNAME_SUCCESS', newName));
});

// ──────────────────────────────────────────────────────────────────
// 2. SETIMAGE — Change the bot's profile/menu image
// ──────────────────────────────────────────────────────────────────
cmd({
    pattern: "setimage",
    alias: ["botimage", "setpic"],
    desc: "Change the bot image (send image or reply to image)",
    category: "settings",
    react: "🖼️"
},
async (conn, mek, m, { isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));

    try {
        // Check if message has image or quoted image
        const msg = m.messages ? m.messages[0] : m;
        const quoted = msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        let imageUrl = null;

        // Direct image message
        if (msg?.message?.imageMessage) {
            const buffer = await conn.downloadMediaMessage(msg);
            // Save to catbox or use base64 — for now store URL if provided via caption
            // Or check if there's a URL in the args
        }

        // Check for URL in args
        const urlArg = m.body?.split(' ').slice(1).join(' ')?.trim();
        if (urlArg && (urlArg.startsWith('http://') || urlArg.startsWith('https://'))) {
            imageUrl = urlArg;
        }

        // Check quoted message for image URL
        if (!imageUrl && quoted?.imageMessage) {
            // Store a note that image came from reply
            imageUrl = '__quoted_image__';
        }

        // If message itself is an image and has a URL arg
        if (!imageUrl) {
            return reply(t(config, 'SETIMAGE_USAGE'));
        }

        const ok = await updateConfig('BOT_IMAGE', imageUrl, botNumber, config, reply);
        if (ok) reply(t(config, 'SETIMAGE_SUCCESS'));

    } catch (e) {
        console.error(e);
        reply(t(config, 'ERROR') + e.message);
    }
});

// ──────────────────────────────────────────────────────────────────
// 3. SETMENU — Change the menu display style
// ──────────────────────────────────────────────────────────────────
cmd({
    pattern: "setmenu",
    alias: ["menustyle"],
    desc: "Change the menu style (1, 2 or 3)",
    category: "settings",
    react: "📋"
},
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));

    const currentStyle = config.MENU_STYLE || '1';

    const styleChoice = args[0]?.trim();
    if (!styleChoice) return reply(t(config, 'SETMENU_USAGE', currentStyle));

    const validStyles = ['1', '2', '3'];
    if (!validStyles.includes(styleChoice)) {
        return reply(t(config, 'SETMENU_INVALID'));
    }

    const styleNames = {
        '1': t(config, 'MENU_TITLE') === '👑 *MENU DU BOT* 👑' ? 'Classique' : 'Classic',
        '2': t(config, 'MENU_TITLE') === '👑 *MENU DU BOT* 👑' ? 'Minimal' : 'Minimal',
        '3': t(config, 'MENU_TITLE') === '👑 *MENU DU BOT* 👑' ? 'Détaillé' : 'Detailed'
    };

    const ok = await updateConfig('MENU_STYLE', styleChoice, botNumber, config, reply);
    if (ok) reply(t(config, 'SETMENU_SUCCESS', styleNames[styleChoice]));
});

// ──────────────────────────────────────────────────────────────────
// 4. SETLANG — Change the bot language
// ──────────────────────────────────────────────────────────────────
cmd({
    pattern: "setlang",
    alias: ["lang", "language"],
    desc: "Change bot language (en or fr)",
    category: "settings",
    react: "🌍"
},
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));

    const lang = args[0]?.toLowerCase()?.trim();
    if (!lang) return reply(t(config, 'SETLANG_USAGE'));

    const validLangs = ['en', 'fr'];
    if (!validLangs.includes(lang)) {
        return reply(t(config, 'SETLANG_INVALID'));
    }

    const ok = await updateConfig('BOT_LANG', lang, botNumber, config, reply);
    if (ok) {
        if (lang === 'fr') reply(getLang('fr', 'SETLANG_SUCCESS_FR'));
        else reply(getLang('en', 'SETLANG_SUCCESS_EN'));
    }
});
