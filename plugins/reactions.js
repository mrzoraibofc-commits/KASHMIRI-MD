const { cmd } = require('../inconnuboy');
const axios = require('axios');
const { fetchGif, gifToVideo } = require('../lib/sticker-utils');

const reactions = {
    cry:       { api: 'https://api.waifu.pics/sfw/cry',       emoji: '😢', action: 'is crying' },
    cuddle:    { api: 'https://api.waifu.pics/sfw/cuddle',    emoji: '🤗', action: 'cuddled' },
    bully:     { api: 'https://api.waifu.pics/sfw/bully',     emoji: '😈', action: 'is bullying' },
    hug:       { api: 'https://api.waifu.pics/sfw/hug',       emoji: '🤗', action: 'hugged' },
    awoo:      { api: 'https://api.waifu.pics/sfw/awoo',      emoji: '🐺', action: 'awoos at' },
    lick:      { api: 'https://api.waifu.pics/sfw/lick',      emoji: '👅', action: 'licked' },
    pat:       { api: 'https://api.waifu.pics/sfw/pat',       emoji: '🫂', action: 'patted' },
    smug:      { api: 'https://api.waifu.pics/sfw/smug',      emoji: '😏', action: 'is smug at' },
    bonk:      { api: 'https://api.waifu.pics/sfw/bonk',      emoji: '🔨', action: 'bonked' },
    yeet:      { api: 'https://api.waifu.pics/sfw/yeet',      emoji: '🔪', action: 'yeeted' },
    blush:     { api: 'https://api.waifu.pics/sfw/blush',     emoji: '😊', action: 'is blushing at' },
    handhold:  { api: 'https://api.waifu.pics/sfw/handhold',  emoji: '🤝', action: 'is holding hands with' },
    highfive:  { api: 'https://api.waifu.pics/sfw/highfive',  emoji: '✋', action: 'gave a high-five to' },
    nom:       { api: 'https://api.waifu.pics/sfw/nom',       emoji: '🍽️', action: 'is nomming' },
    wave:      { api: 'https://api.waifu.pics/sfw/wave',      emoji: '👋', action: 'waved at' },
    smile:     { api: 'https://api.waifu.pics/sfw/smile',     emoji: '😁', action: 'smiled at' },
    wink:      { api: 'https://api.waifu.pics/sfw/wink',      emoji: '😉', action: 'winked at' },
    happy:     { api: 'https://api.waifu.pics/sfw/happy',     emoji: '😊', action: 'is happy with' },
    glomp:     { api: 'https://api.waifu.pics/sfw/glomp',     emoji: '🤗', action: 'glomped' },
    bite:      { api: 'https://api.waifu.pics/sfw/bite',      emoji: '🦷', action: 'bit' },
    poke:      { api: 'https://api.waifu.pics/sfw/poke',      emoji: '👉', action: 'poked' },
    cringe:    { api: 'https://api.waifu.pics/sfw/cringe',    emoji: '😬', action: 'thinks' },
    dance:     { api: 'https://api.waifu.pics/sfw/dance',     emoji: '💃', action: 'danced with' },
    kill:      { api: 'https://api.waifu.pics/sfw/kill',      emoji: '🔪', action: 'killed' },
    slap:      { api: 'https://api.waifu.pics/sfw/slap',      emoji: '✊', action: 'slapped' },
    kiss:      { api: 'https://api.waifu.pics/sfw/kiss',      emoji: '💋', action: 'kissed' },
};

// ── Shared function ────────────────────────────────────────────────────────────
async function sendReactionGif(conn, mek, reactionType, from, isGroup) {
    try {
        // Emoji react
        conn.sendMessage(from, { react: { text: reactionType.emoji, key: mek.key } }).catch(() => {});

        const senderJid = mek.sender;
        // Try to get mentioned user from message context
        const contextInfo = mek.message?.extendedTextMessage?.contextInfo
            || mek.message?.imageMessage?.contextInfo
            || mek.message?.videoMessage?.contextInfo
            || {};
        const mentionedJids = contextInfo.mentionedJid || [];
        const quotedSender  = contextInfo.participant || mek.quoted?.sender || null;
        const mentionedUser = mentionedJids[0] || quotedSender;

        const sender = `@${senderJid.split('@')[0]}`;
        let caption;
        let mentionsList = [senderJid];

        if (mentionedUser) {
            const target = `@${mentionedUser.split('@')[0]}`;
            caption = `${sender} ${reactionType.action} ${target}`;
            mentionsList.push(mentionedUser);
        } else if (isGroup) {
            caption = `${sender} ${reactionType.action} everyone!`;
        } else {
            caption = `${sender} ${reactionType.action}`;
        }

        // Fetch GIF from waifu.pics
        const res = await axios.get(reactionType.api);
        const gifUrl = res.data.url;
        const gifBuffer = await fetchGif(gifUrl);
        const videoBuffer = await gifToVideo(gifBuffer);

        await conn.sendMessage(
            from,
            {
                video: videoBuffer,
                caption: caption,
                gifPlayback: true,
                mentions: mentionsList.filter(Boolean),
            },
            { quoted: mek }
        );
    } catch (error) {
        console.error('❌ Reaction error:', error);
        conn.sendMessage(from, { text: '❌ Failed to send reaction GIF' }, { quoted: mek }).catch(() => {});
    }
}

// ── Method 1: Auto reaction — user types "kiss", "hug", etc. (no prefix) ──────
cmd({
    pattern: '__reaction_text_listener__',
    dontAddCommandList: true,
    on: 'text',
    category: 'fun',
    desc: 'Auto detect reaction keywords'
},
async (conn, mek, m, { from, isGroup }) => {
    try {
        const body = (mek.body || '').toLowerCase().trim();
        const reactionType = reactions[body];
        if (!reactionType) return;
        await sendReactionGif(conn, mek, reactionType, from, isGroup);
    } catch (e) {
        console.error('❌ Auto reaction listener error:', e);
    }
});

// ── Method 2: Command-based — .kiss, .hug, etc. ──────────────────────────────
Object.keys(reactions).forEach((reactionName) => {
    cmd({
        pattern: reactionName,
        desc: `Send ${reactionName} reaction GIF`,
        category: 'fun',
        react: reactions[reactionName].emoji,
    },
    async (conn, mek, m, { from, isGroup }) => {
        await sendReactionGif(conn, mek, reactions[reactionName], from, isGroup);
    });
});
