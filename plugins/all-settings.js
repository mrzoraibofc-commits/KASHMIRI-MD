
/**
 * plugins/all-settings.js
 * All bot settings — EN/FR language system
 */

const { cmd } = require('../inconnuboy');
const { updateUserConfig } = require('../lib/database');
const { getLang } = require('../lib/lang');

const t = (config, key, ...args) => getLang(config.BOT_LANG || 'en', key, ...args);

const updateConfig = async (key, value, botNumber, config, reply) => {
    try {
        config[key] = value;
        const newConfig = { ...config };
        newConfig[key] = value;
        await updateUserConfig(botNumber, newConfig);
        reply(t(config, 'SETTINGS_UPDATED', key, value));
        return true;
    } catch (e) {
        console.error(e);
        reply(t(config, 'SETTINGS_DB_ERROR'));
        return false;
    }
};

// ── AUTORECORDING ────────────────────────────────────────────────
cmd({ pattern: "autorecording", alias: ["autorec","arecording"], desc: "Enable/Disable auto recording", category: "settings", react: "🎙️" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('AUTO_RECORDING', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('AUTO_RECORDING', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_AUTORECORDING_STATUS', config.AUTO_RECORDING));
});

// ── AUTOTYPING ───────────────────────────────────────────────────
cmd({ pattern: "autotyping", alias: ["autotype","atyping"], desc: "Enable/Disable auto typing", category: "settings", react: "⌨️" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('AUTO_TYPING', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('AUTO_TYPING', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_AUTOTYPING_STATUS', config.AUTO_TYPING));
});

// ── AUTOVOICE ────────────────────────────────────────────────────
cmd({ pattern: "autovoice", alias: ["avoice","autovn"], desc: "Enable/Disable auto voice", category: "settings", react: "🎙️" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('AUTO_VOICE', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('AUTO_VOICE', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_AUTOVOICE_STATUS', config.AUTO_VOICE));
});

// ── CUSTOMREACT ──────────────────────────────────────────────────
cmd({ pattern: "autoreact", alias: ["creact"], desc: "Enable/Disable custom auto react", category: "settings", react: "✨" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('CUSTOM_REACT', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('CUSTOM_REACT', 'false', botNumber, config, reply);
    else reply(t(config, 'CUSTOMREACT_STATUS', config.CUSTOM_REACT));
});

// ── OWNERREACT ───────────────────────────────────────────────────
cmd({ pattern: "ownerreact", alias: ["oreact"], desc: "Enable/Disable owner react", category: "settings", react: "👑" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('OWNER_REACT', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('OWNER_REACT', 'false', botNumber, config, reply);
    else reply(t(config, 'OWNERREACT_STATUS', config.OWNER_REACT));
});

// ── MENTION-REPLY ────────────────────────────────────────────────
cmd({ pattern: "mention-reply", alias: ["mreply","mentionreply","mentionon"], desc: "Enable/Disable auto reply on mention", category: "settings", react: "💬" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('MENTION_REPLY', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('MENTION_REPLY', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_MENTION_STATUS', config.MENTION_REPLY));
});

// ── ANTICALL ─────────────────────────────────────────────────────
cmd({ pattern: "anticall", alias: "acall", desc: "Auto reject calls", category: "settings", react: "📵" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('ANTI_CALL', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('ANTI_CALL', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_ANTICALL_STATUS', config.ANTI_CALL));
});

// ── WELCOME ──────────────────────────────────────────────────────
cmd({ pattern: "welcome", desc: "Enable/Disable welcome messages", category: "settings", react: "👋" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('WELCOME', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('WELCOME', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_WELCOME_STATUS', config.WELCOME));
});

// ── GOODBYE ──────────────────────────────────────────────────────
cmd({ pattern: "goodbye", desc: "Enable/Disable goodbye messages", category: "settings", react: "👋" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('GOODBYE', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('GOODBYE', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_GOODBYE_STATUS', config.GOODBYE));
});

// ── AUTOREAD ─────────────────────────────────────────────────────
cmd({ pattern: "autoread", desc: "Enable/Disable auto read (Blue Tick)", category: "settings", react: "👀" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('READ_MESSAGE', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('READ_MESSAGE', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_AUTOREAD_STATUS', config.READ_MESSAGE));
});

// ── AUTOVIEWSVIEW ────────────────────────────────────────────────
cmd({ pattern: "autoviewsview", alias: ["avs","statusseen","astatus"], desc: "Auto view status updates", category: "settings", react: "👁️" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('AUTO_VIEW_STATUS', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('AUTO_VIEW_STATUS', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_AUTOVIEW_STATUS', config.AUTO_VIEW_STATUS));
});

// ── AUTOLIKESTATUS ───────────────────────────────────────────────
cmd({ pattern: "autolikestatus", alias: ["als"], desc: "Auto like status updates", category: "settings", react: "❤️" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const v = args[0]?.toLowerCase();
    if (v === 'on' || v === 'true') await updateConfig('AUTO_LIKE_STATUS', 'true', botNumber, config, reply);
    else if (v === 'off' || v === 'false') await updateConfig('AUTO_LIKE_STATUS', 'false', botNumber, config, reply);
    else reply(t(config, 'SETTINGS_AUTOLIKE_STATUS', config.AUTO_LIKE_STATUS));
});

// ── MODE ─────────────────────────────────────────────────────────
cmd({ pattern: "mode", desc: "Change bot mode (public/private/groups/inbox)", category: "settings", react: "⚙️" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const mode = args[0]?.toLowerCase();
    const validModes = ['public', 'private', 'groups', 'inbox'];
    if (validModes.includes(mode)) {
        await updateConfig('WORK_TYPE', mode, botNumber, config, reply);
    } else {
        reply(t(config, 'SETTINGS_MODE_STATUS', config.WORK_TYPE));
    }
});

// ── SETPREFIX ────────────────────────────────────────────────────
cmd({ pattern: "setprefix", desc: "Change bot prefix", category: "settings", react: "🔣" },
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config }) => {
    if (!isOwner && !isSudo) return reply(t(config, 'OWNER_ONLY'));
    const newPrefix = args[0];
    if (newPrefix) {
        if (newPrefix.length > 1 && newPrefix !== 'noprefix') return reply(t(config, 'SETTINGS_PREFIX_INVALID'));
        await updateConfig('PREFIX', newPrefix, botNumber, config, reply);
    } else {
        reply(t(config, 'SETTINGS_PREFIX_STATUS', config.PREFIX));
    }
});
