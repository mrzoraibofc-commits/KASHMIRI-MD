const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// ── HELPER: convert image/video buffer to webp sticker ───────────────────────
async function toWebpSticker(buffer, isAnimated = false, packname = 'Inconnu Boy', author = 'SHINIGAMI-MD') {
    const inputExt = isAnimated ? '.mp4' : '.jpg';
    const inputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + inputExt);
    const outputPath = path.join(tmpdir(), Crypto.randomBytes(6).toString('hex') + '.webp');

    fs.writeFileSync(inputPath, buffer);

    await new Promise((resolve, reject) => {
        const cmd = ffmpeg(inputPath).on('error', reject).on('end', () => resolve(true));
        if (isAnimated) {
            cmd.addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
                '-loop', '0', '-preset', 'default', '-an', '-vsync', '0'
            ]);
        } else {
            cmd.addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0",
                '-preset', 'default', '-loop', '0', '-an'
            ]);
        }
        cmd.toFormat('webp').save(outputPath);
    });

    let webpBuffer = fs.readFileSync(outputPath);

    try {
        const exifJson = JSON.stringify({
            'sticker-pack-id': `tedtm.${Crypto.randomBytes(4).toString('hex')}`,
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
        });
        const exifBuf = Buffer.from(exifJson, 'utf-8');
        const riffHeader = webpBuffer.slice(0, 12);
        const webpChunks = webpBuffer.slice(12);
        const exifChunkId = Buffer.from('EXIF');
        const exifSize = Buffer.alloc(4);
        exifSize.writeUInt32LE(exifBuf.length, 0);
        webpBuffer = Buffer.concat([riffHeader, exifChunkId, exifSize, exifBuf, webpChunks]);
    } catch (_) {}

    fs.unlinkSync(inputPath);
    try { fs.unlinkSync(outputPath); } catch (_) {}
    return webpBuffer;
}

// ── HELPER: detect media type from message ───────────────────────────────────
function getMediaType(msg) {
    if (!msg || !msg.message) return null;
    const types = ['imageMessage', 'videoMessage', 'stickerMessage', 'gifMessage'];
    for (const t of types) {
        if (msg.message[t]) return t;
    }
    // Check inside extendedTextMessage (forwarded messages)
    const ext = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    if (ext) {
        for (const t of types) {
            if (ext[t]) return t + ':quoted';
        }
    }
    return null;
}

// ── HELPER: download media — FIXED pour reply image/sticker ──────────────────
async function downloadMedia(conn, mek) {
    try {
        const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage'];

        // ── Priorité 1: message en reply (quotedMessage dans contextInfo) ──
        const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage
            || mek.message?.imageMessage?.contextInfo?.quotedMessage
            || mek.message?.videoMessage?.contextInfo?.quotedMessage
            || mek.message?.stickerMessage?.contextInfo?.quotedMessage;

        if (quotedMsg) {
            const type = Object.keys(quotedMsg).find(k => supportedTypes.includes(k));
            if (type) {
                try {
                    // Construire un faux message pour downloadMediaMessage
                    const fakeMsg = {
                        key: mek.key,
                        message: quotedMsg
                    };
                    const buffer = await conn.downloadMediaMessage(fakeMsg);
                    if (buffer && buffer.length > 0) return { buffer, type };
                } catch (dlErr) {
                    console.error('downloadMedia quoted attempt failed:', dlErr.message);
                }
            }
        }

        // ── Priorité 2: mek.quoted s'il existe (objet Baileys) ──
        if (mek.quoted && mek.quoted.message) {
            const type = Object.keys(mek.quoted.message).find(k => supportedTypes.includes(k));
            if (type) {
                try {
                    const buffer = await conn.downloadMediaMessage(mek.quoted);
                    if (buffer && buffer.length > 0) return { buffer, type };
                } catch (dlErr) {
                    console.error('downloadMedia mek.quoted attempt failed:', dlErr.message);
                }
            }
        }

        // ── Priorité 3: message courant (si l'image est envoyée directement) ──
        if (mek.message) {
            const type = Object.keys(mek.message).find(k => supportedTypes.includes(k));
            if (type) {
                try {
                    const buffer = await conn.downloadMediaMessage(mek);
                    if (buffer && buffer.length > 0) return { buffer, type };
                } catch (dlErr) {
                    console.error('downloadMedia current msg attempt failed:', dlErr.message);
                }
            }
        }

        return null;
    } catch (e) {
        console.error('downloadMedia error:', e.message);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// .sticker — Convert image/video/gif to sticker
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'sticker',
    alias: ['s', 'stik'],
    desc: 'Convert image/video/gif to WhatsApp sticker',
    category: 'sticker',
    react: '🎨',
    use: '.sticker (reply to image/video/gif)',
    filename: __filename
},
async (conn, mek, m, { from, reply, config: cfg }) => {
    try {
        const media = await downloadMedia(conn, mek);
        if (!media) return reply(t(cfg, 'STICKER_USAGE'));

        await reply(t(cfg, 'STICKER_WAIT'));

        const isAnimated = media.type === 'videoMessage';
        const sticker = await toWebpSticker(media.buffer, isAnimated);

        await conn.sendMessage(from, { sticker }, { quoted: mek });
    } catch (e) {
        console.error('STICKER ERROR:', e);
        reply(t(cfg, 'STICKER_ERROR'));
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .take — Create sticker with pack name
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'take',
    alias: ['tk'],
    desc: 'Create sticker with your name as pack name',
    category: 'sticker',
    react: '🎴',
    use: '.take [pack name]',
    filename: __filename
},
async (conn, mek, m, { from, args, sender, reply, config: cfg }) => {
    try {
        const media = await downloadMedia(conn, mek);
        if (!media) return reply(t(cfg, 'TAKE_USAGE'));

        await reply(t(cfg, 'TAKE_WAIT'));

        const packname = args.length > 0
            ? args.join(' ')
            : (sender.split('@')[0] || 'Inconnu Boy');

        const isAnimated = media.type === 'videoMessage';
        const sticker = await toWebpSticker(media.buffer, isAnimated, packname, 'TEDTM');

        await conn.sendMessage(from, { sticker }, { quoted: mek });
    } catch (e) {
        console.error('TAKE ERROR:', e);
        reply(t(cfg, 'TAKE_ERROR'));
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .getpp — Get profile picture of a user
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'getpp',
    alias: ['pp', 'profilepic'],
    desc: "Get someone's profile picture",
    category: 'utility',
    react: '🖼️',
    use: '.getpp @mention or reply',
    filename: __filename
},
async (conn, mek, m, { from, args, sender, reply, config: cfg }) => {
    try {
        let target = null;
        const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned && mentioned.length > 0) target = mentioned[0];
        if (!target && mek.quoted) target = mek.quoted.sender || mek.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target) target = sender;

        const ppUrl = await conn.profilePictureUrl(target, 'image').catch(() => null);
        if (!ppUrl) return reply(t(cfg, 'GETPP_NO_PP'));

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: `📸 *Profile Picture*\n👤 @${target.split('@')[0]}`,
            mentions: [target]
        }, { quoted: mek });
    } catch (e) {
        console.error('GETPP ERROR:', e);
        reply(t(cfg, 'GETPP_ERROR'));
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// .tlg — Telegram sticker pack
// ─────────────────────────────────────────────────────────────────────────────
cmd({
    pattern: 'tlg',
    alias: ['telegramsticker', 'tgsticker'],
    desc: 'Download stickers from a Telegram sticker pack URL',
    category: 'sticker',
    react: '✈️',
    use: '.tlg <Telegram sticker pack URL>',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, config: cfg }) => {
    try {
        if (!args[0]) return reply(t(cfg, 'TLG_USAGE'));
        const url = args[0].trim();
        const packNameMatch = url.match(/t\.me\/addstickers\/([a-zA-Z0-9_]+)/);
        if (!packNameMatch) return reply(t(cfg, 'TLG_INVALID_URL'));
        const packName = packNameMatch[1];
        reply(t(cfg, 'TLG_WAIT'));

        const botToken = process.env.TELEGRAM_BOT_TOKEN || cfg?.TELEGRAM_BOT_TOKEN || require('../config').TELEGRAM_BOT_TOKEN;
        if (!botToken) return reply('❌ *Telegram Bot Token not configured!*');

        const stickerSetRes = await axios.get(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${packName}`).catch(() => null);
        if (!stickerSetRes?.data?.ok) return reply(t(cfg, 'TLG_ERROR'));

        const stickers = stickerSetRes.data.result.stickers;
        if (!stickers || stickers.length === 0) return reply(t(cfg, 'TLG_ERROR'));

        const limit = Math.min(stickers.length, 20);
        let sentCount = 0;

        for (let i = 0; i < limit; i++) {
            try {
                const fileId = stickers[i].file_id;
                const isAnimated = stickers[i].is_animated || stickers[i].is_video;
                const fileRes = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
                if (!fileRes.data?.ok) continue;
                const filePath = fileRes.data.result.file_path;
                const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
                const { data: fileBuffer } = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(fileBuffer);
                if (filePath.endsWith('.webp') && !isAnimated) {
                    await conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
                } else {
                    const sticker = await toWebpSticker(buffer, isAnimated, packName, 'Telegram');
                    await conn.sendMessage(from, { sticker }, { quoted: mek });
                }
                sentCount++;
                await new Promise(r => setTimeout(r, 500));
            } catch (innerErr) {
                console.error(`TLG sticker ${i} error:`, innerErr.message);
            }
        }
        reply(t(cfg, 'TLG_DONE', sentCount));
    } catch (e) {
        console.error('TLG ERROR:', e);
        reply(t(cfg, 'TLG_ERROR'));
    }
});
