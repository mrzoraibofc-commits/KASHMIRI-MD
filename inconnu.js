const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    Browsers,
    DisconnectReason,
    jidDecode,
    getContentType
} = require('@whiskeysockets/baileys');

const config = require('./config');

// ── FAKE QUOTED HELPER ───────────────────────────────────────────────────────
function createSerial(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function buildFakeQuoted(cfg) {
    const botName = cfg?.BOT_NAME || config.BOT_NAME || 'KASHMIRI-MINI';
    return {
        key: {
            remoteJid: 'status@broadcast',
            participant: '13135550002@s.whatsapp.net',
            fromMe: false,
            id: createSerial(16).toUpperCase()
        },
        message: {
            contactMessage: {
                displayName: '© Iɴᴄᴏɴɴᴜ Bᴏʏ',
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN: ${botName}\nORG: ${botName};\nTEL;type=CELL;type=VOICE;waid=13135550002:13135550002\nEND:VCARD`,
                contextInfo: {
                    stanzaId: createSerial(16).toUpperCase(),
                    participant: '0@s.whatsapp.net',
                    quotedMessage: {
                        conversation: '© mr Zoraib'
                    }
                }
            }
        },
        messageTimestamp: Math.floor(Date.now() / 1000),
        status: 1,
        verifiedBizName: 'Meta'
    };
}
// ─────────────────────────────────────────────────────────────────────────────
const { commands } = require('./inconnuboy');
const { sms } = require('./lib/msg');
const {
    connectdb,
    saveSessionToMongoDB,
    getSessionFromMongoDB,
    deleteSessionFromMongoDB,
    getUserConfigFromMongoDB,
    addNumberToMongoDB,
    removeNumberFromMongoDB,
    getAllNumbersFromMongoDB,
    incrementStats,
    isSudo,
    isBanned
} = require('./lib/database');

const path = require('path');
const fs = require('fs-extra');
const pino = require('pino');
const express = require('express');

// ================= LOAD PLUGINS =================
const pluginsDir = path.join(__dirname, 'plugins');
fs.readdirSync(pluginsDir)
    .filter(f => f.endsWith('.js'))
    .forEach(f => {
        try {
            require(path.join(pluginsDir, f));
        } catch (e) {
            console.error(`⚠️ Failed to load plugin ${f}:`, e.message);
        }
    });
// ================================================

// ================= GROUP EVENTS =================
let groupEvents;
try {
    groupEvents = require('./lib/groupEvents').groupEvents;
} catch (e) {
    console.warn('⚠️ Warning: lib/groupEvents.js missing. Group events disabled.');
    groupEvents = async () => {};
}
// ================================================

const router = express.Router();
connectdb();

const activeSockets = new Map();

// =====================================================================
// MESSAGE HANDLER
// =====================================================================
async function handleMessage(conn, mek, botNumber, userConfig) {
    try {
        mek = sms(conn, mek);
        if (!mek.message) return;
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
        if (mek.isBaileys) return;

        const from     = mek.chat;
        const sender   = mek.sender;
        const body     = mek.body || '';
        const isGroup  = mek.isGroup;
        const fromMe   = mek.fromMe;
        const prefix   = userConfig?.PREFIX || config.PREFIX || '.';

        const cleanBot  = botNumber.replace(/[^0-9]/g, '');
        const ownerRaw  = (config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
        const senderNum = sender.replace(/[^0-9]/g, '');

        // ── OWNER / SUDO CHECK ───────────────────────────────────────────
        const isOwner    = fromMe || senderNum === ownerRaw;
        const sudoAccess = !isOwner ? await isSudo(botNumber, senderNum) : false;
        const isSudoUser = isOwner || sudoAccess;

        // ── BAN CHECK ────────────────────────────────────────────────────
        if (!isOwner && !sudoAccess) {
            const banned = await isBanned(botNumber, senderNum);
            if (banned) {
                const { getLang } = require('./lib/lang');
                const lang = userConfig?.BOT_LANG || config.BOT_LANG || 'en';
                const banMsg = getLang(lang, 'BAN_BLOCKED');
                await conn.sendMessage(from, { text: banMsg }, { quoted: mek }).catch(() => {});
                return;
            }
        }

        // ── WORK TYPE FILTER ─────────────────────────────────────────────
        const workType = (userConfig.WORK_TYPE || config.WORK_TYPE || 'public').toLowerCase();
        if (workType === 'private' && !isOwner && !sudoAccess) return;
        if (workType === 'inbox'   && isGroup)                  return;
        if (workType === 'group'   && !isGroup)                 return;

        // ── AUTO REACT (emoji react on every message) ────────────────────
        // CUSTOM_REACT : réagit sur tous les messages avec un emoji aléatoire
        // OWNER_REACT  : réagit uniquement sur les messages du owner
        try {
            const customReactOn = String(userConfig.CUSTOM_REACT || '').toLowerCase() === 'true';
            const ownerReactOn  = String(userConfig.OWNER_REACT  || '').toLowerCase() === 'true';

            const reactEmojis = ['❤️','😂','🔥','👍','😍','🥰','😎','💯','✨','🎉','😊','💪','👏','🙌','🫡'];

            if (customReactOn) {
                // Réagit sur tous les messages
                const emoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
                conn.sendMessage(from, { react: { text: emoji, key: mek.key } }).catch(() => {});
            } else if (ownerReactOn && isOwner) {
                // Réagit seulement sur les messages du owner
                const emoji = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
                conn.sendMessage(from, { react: { text: emoji, key: mek.key } }).catch(() => {});
            }
        } catch (_) {}

        // ── TEXT LISTENERS (no prefix needed, e.g. auto reactions) ──────────
        const textListeners = commands.filter(c => c.on === 'text');
        for (const listener of textListeners) {
            try {
                await listener.function(conn, mek, mek, {
                    from, sender, isOwner, isSudo: isSudoUser,
                    args: [], q: body, reply: (text) => conn.sendMessage(from, { text: String(text) }, { quoted: mek }),
                    prefix, botNumber: cleanBot, myquoted: buildFakeQuoted(userConfig), quoted: mek.quoted,
                    config: userConfig, isGroup, fromMe,
                    react: (emoji) => conn.sendMessage(from, { react: { text: emoji, key: mek.key } })
                });
            } catch (e) {
                console.error('❌ Text listener error:', e.message);
            }
        }

        // ── COMMAND PARSING ──────────────────────────────────────────────
        const isCmd = body.startsWith(prefix);
        if (!isCmd) return;

        const cmdText = body.slice(prefix.length).trim();
        const cmdName = cmdText.split(' ')[0].toLowerCase();
        const args    = cmdText.split(' ').slice(1);
        const q       = args.join(' ');

        const command = commands.find(c => {
            const patterns = [c.pattern, ...(c.alias || [])].map(p => p?.toLowerCase());
            return patterns.includes(cmdName);
        });

        if (!command) return;

        // React
        if (command.react) {
            conn.sendMessage(from, { react: { text: command.react, key: mek.key } }).catch(() => {});
        }

        await incrementStats(botNumber, 'commandsUsed').catch(() => {});

        // Quoted context
        if (mek.quoted) {
            mek.quoted.sender = mek.message?.extendedTextMessage?.contextInfo?.participant || '';
        }

        const reply = (text) => conn.sendMessage(from, { text: String(text) }, { quoted: mek });

        // ── GROUP INFO (pour tagall, hidetag, etc.) ──────────────────────
        let participants = [];
        let groupAdmins  = [];
        let groupName    = '';
        if (isGroup) {
            try {
                const groupMeta = await conn.groupMetadata(from);
                participants = groupMeta.participants || [];
                groupAdmins  = participants
                    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                    .map(p => p.id);
                groupName = groupMeta.subject || '';
            } catch (_) {}
        }
        const senderNumber = sender.split('@')[0];

        // ── EXECUTE ──────────────────────────────────────────────────────
        await command.function(conn, mek, mek, {
            from,
            sender,
            senderNumber,
            isOwner,
            isSudo: isSudoUser,
            args,
            q,
            body,
            command: cmdName,
            reply,
            prefix,
            botNumber: cleanBot,
            myquoted: buildFakeQuoted(userConfig),
            quoted: mek.quoted,
            config: userConfig,
            isGroup,
            fromMe,
            participants,
            groupAdmins,
            groupName,
            react: (emoji) => conn.sendMessage(from, { react: { text: emoji, key: mek.key } })
        });

    } catch (e) {
        console.error('❌ handleMessage error:', e.message);
    }
}

// =====================================================================
// START BOT
// =====================================================================
async function startBot(number, res = null) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionDir = path.join(__dirname, 'session', `session_${sanitizedNumber}`);

    try {
        const existingSession = await getSessionFromMongoDB(sanitizedNumber);
        if (existingSession) {
            fs.ensureDirSync(sessionDir);
            fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(existingSession));
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const conn = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
            },
            printQRInTerminal: false,
            usePairingCode: !existingSession,
            browser: Browsers.macOS('Safari'),
            logger: pino({ level: 'silent' })
        });

        activeSockets.set(sanitizedNumber, conn);

        // Creds update
        conn.ev.on('creds.update', async () => {
            await saveCreds();
            try {
                const creds = JSON.parse(fs.readFileSync(path.join(sessionDir, 'creds.json'), 'utf-8'));
                await saveSessionToMongoDB(sanitizedNumber, creds);
            } catch (_) {}
        });

        // Connection update with auto-reconnect
        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                console.log(`✅ Connected: ${sanitizedNumber}`);
                await addNumberToMongoDB(sanitizedNumber);
            }
            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                const isLoggedOut = code === DisconnectReason.loggedOut;
                const isUnauthorized = code === 401;
                const shouldReconnect = !isLoggedOut && !isUnauthorized;
                console.log(`⚠️ Disconnected (${sanitizedNumber}). Code: ${code}. Reconnect: ${shouldReconnect}`);

                // 🧹 Session invalide / expirée → lavage automatique
                if (isUnauthorized || isLoggedOut) {
                    console.log(`🧹 Session invalide détectée (${sanitizedNumber}) — suppression automatique...`);
                    try {
                        await deleteSessionFromMongoDB(sanitizedNumber);
                        await removeNumberFromMongoDB(sanitizedNumber);
                        console.log(`✅ Session nettoyée pour ${sanitizedNumber}`);
                    } catch (cleanErr) {
                        console.error(`❌ Erreur lors du nettoyage session ${sanitizedNumber}:`, cleanErr.message);
                    }
                    activeSockets.delete(sanitizedNumber);
                    return;
                }

                if (shouldReconnect) setTimeout(() => startBot(number), 5000);
                else activeSockets.delete(sanitizedNumber);
            }
        });

        // Group events
        conn.ev.on('group-participants.update', async (update) => {
            const evUserConfig = await getUserConfigFromMongoDB(sanitizedNumber).catch(() => ({}));
            await groupEvents(conn, update, evUserConfig);
        });

        // Messages
        conn.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            const userConfig = await getUserConfigFromMongoDB(sanitizedNumber).catch(() => ({}));
            for (const mek of messages) {
                await handleMessage(conn, mek, sanitizedNumber, userConfig);
            }
        });

        // Pairing code
        if (!existingSession && res && !res.headersSent) {
            setTimeout(async () => {
                try {
                    const code = await conn.requestPairingCode(sanitizedNumber);
                    res.json({ code });
                } catch (e) {
                    if (!res.headersSent) res.json({ error: 'Failed to get pairing code' });
                }
            }, 3000);
        }

    } catch (err) {
        console.error('❌ Error in startBot:', err);
    }
}

// =====================================================================
// AUTO-RECONNECT ALL SESSIONS ON STARTUP
// =====================================================================
(async () => {
    try {
        const numbers = await getAllNumbersFromMongoDB();
        for (const num of numbers) {
            console.log(`🔄 Reconnecting session: ${num}`);
            await startBot(num);
            await delay(2000);
        }
    } catch (e) {
        console.error('❌ Auto-reconnect error:', e.message);
    }
})();

// =====================================================================
// API ROUTES
// =====================================================================
router.get('/code', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.json({ error: 'Number required' });
    await startBot(number, res);
});

router.get('/status', (req, res) => {
    const sessions = [...activeSockets.keys()];
    res.json({ active: sessions.length, sessions });
});

module.exports = router;
