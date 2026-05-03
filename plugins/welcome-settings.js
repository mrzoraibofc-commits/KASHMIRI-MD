const { cmd } = require('../inconnuboy');
const { updateUserConfig } = require('../lib/database');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

const updateConfig = async (key, value, botNumber, config) => {
    config[key] = value;
    await updateUserConfig(botNumber, { ...config, [key]: value });
};

// ── SETWELCOME ───────────────────────────────────────────────────────────────
cmd({
    pattern: 'setwelcome',
    alias: ['welcomemsg', 'setwelcomemsg'],
    desc: 'Set custom welcome message. Tags: {user} {group} {members} {date}',
    category: 'settings',
    react: '👋',
    use: '.setwelcome <message>',
    filename: __filename
},
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config: cfg }) => {
    if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

    const msg = args.join(' ').trim();
    if (!msg) return reply(t(cfg, 'SETWELCOME_USAGE'));

    try {
        await updateConfig('WELCOME_MSG', msg, botNumber, cfg);
        reply(t(cfg, 'SETWELCOME_SUCCESS') + `\n\n*Preview:*\n${msg
            .replace(/\{user\}/gi, '@User')
            .replace(/\{group\}/gi, 'GroupName')
            .replace(/\{members\}/gi, '10')
            .replace(/\{date\}/gi, new Date().toLocaleDateString())
        }`);
    } catch (e) {
        console.error(e);
        reply(t(cfg, 'SETTINGS_DB_ERROR'));
    }
});

// ── SETGOODBYE ───────────────────────────────────────────────────────────────
cmd({
    pattern: 'setgoodbye',
    alias: ['goodbyemsg', 'setgoodbyemsg'],
    desc: 'Set custom goodbye message. Tags: {user} {group} {members} {date}',
    category: 'settings',
    react: '👋',
    use: '.setgoodbye <message>',
    filename: __filename
},
async (conn, mek, m, { args, isOwner, isSudo, reply, botNumber, config: cfg }) => {
    if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

    const msg = args.join(' ').trim();
    if (!msg) return reply(t(cfg, 'SETGOODBYE_USAGE'));

    try {
        await updateConfig('GOODBYE_MSG', msg, botNumber, cfg);
        reply(t(cfg, 'SETGOODBYE_SUCCESS') + `\n\n*Preview:*\n${msg
            .replace(/\{user\}/gi, '@User')
            .replace(/\{group\}/gi, 'GroupName')
            .replace(/\{members\}/gi, '10')
            .replace(/\{date\}/gi, new Date().toLocaleDateString())
        }`);
    } catch (e) {
        console.error(e);
        reply(t(cfg, 'SETTINGS_DB_ERROR'));
    }
});

// ── RESETWELCOME ─────────────────────────────────────────────────────────────
cmd({
    pattern: 'resetwelcome',
    alias: ['welcomereset', 'clearwelcome'],
    desc: 'Reset welcome message to default',
    category: 'settings',
    react: '🔄',
    use: '.resetwelcome',
    filename: __filename
},
async (conn, mek, m, { isOwner, isSudo, reply, botNumber, config: cfg }) => {
    if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

    try {
        await updateConfig('WELCOME_MSG', null, botNumber, cfg);
        reply(t(cfg, 'SETWELCOME_RESET'));
    } catch (e) {
        console.error(e);
        reply(t(cfg, 'SETTINGS_DB_ERROR'));
    }
});

// ── RESETGOODBYE ─────────────────────────────────────────────────────────────
cmd({
    pattern: 'resetgoodbye',
    alias: ['goodbyereset', 'cleargoodbye'],
    desc: 'Reset goodbye message to default',
    category: 'settings',
    react: '🔄',
    use: '.resetgoodbye',
    filename: __filename
},
async (conn, mek, m, { isOwner, isSudo, reply, botNumber, config: cfg }) => {
    if (!isOwner && !isSudo) return reply(t(cfg, 'OWNER_ONLY'));

    try {
        await updateConfig('GOODBYE_MSG', null, botNumber, cfg);
        reply(t(cfg, 'SETGOODBYE_RESET'));
    } catch (e) {
        console.error(e);
        reply(t(cfg, 'SETTINGS_DB_ERROR'));
    }
});
