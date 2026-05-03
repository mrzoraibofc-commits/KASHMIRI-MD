const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');
const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// ─────────────────────────────────────────────────────────────────────────────
// .tagall — Tag all group members with new design
// ─────────────────────────────────────────────────────────────────────────────
cmd({
  pattern: "tagall", alias: ["gc_tagall"], react: "👑",
  desc: "Tag all members", category: "group", filename: __filename
}, async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, command, body, config: cfg }) => {
  try {
    if (!isGroup) return reply('❌ *Group only command!*');

    // FIX: safely check groupAdmins (évite l'erreur "includes of undefined")
    const safeAdmins = Array.isArray(groupAdmins) ? groupAdmins : [];
    const botOwner = conn.user.id.split(':')[0];
    const senderJid = senderNumber + '@s.whatsapp.net';

    if (!safeAdmins.includes(senderJid) && senderNumber !== botOwner) {
      return reply('❌ *Admin only command!*');
    }

    let groupInfo = await conn.groupMetadata(from).catch(() => null);
    if (!groupInfo) return reply('❌ *Could not fetch group info!*');

    const safeParticipants = Array.isArray(participants) && participants.length > 0
      ? participants : (groupInfo.participants || []);
    const totalMembers = safeParticipants.length;
    if (totalMembers === 0) return reply('❌ *No members found!*');

    const botName = cfg?.BOT_NAME || 'BOT';
    const prefix  = cfg?.PREFIX || '.';
    const user    = senderNumber;

    let message = body.slice(body.indexOf(command) + command.length).trim() || t(cfg, 'TAGALL_MSG');

    // New design
    let teks = `╭─────────────────◇\n`;
    teks    += `│  ʙᴏᴛ ɴᴀᴍᴇ: ${botName}\n`;
    teks    += `│  ᴜsᴇʀ: @${user}\n`;
    teks    += `│  ᴘʀᴇғɪx: ${prefix}\n`;
    teks    += `│  ᴍᴇᴍʙʀᴇs: ${totalMembers} 👥\n`;
    teks    += `╰──────────────────◇\n\n`;
    teks    += `📢 *${message}*\n\n`;

    for (let mem of safeParticipants) {
      if (!mem.id) continue;
      teks += `@${mem.id.split('@')[0]}\n`;
    }

    const mentions = [senderJid, ...safeParticipants.map(a => a.id)].filter(Boolean);

    await conn.sendMessage(from, { text: teks, mentions }, { quoted: mek });

  } catch (e) {
    reply('❌ Error: ' + e.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// .hidetag — Tag all members silently (hidden mention)
// ─────────────────────────────────────────────────────────────────────────────
cmd({
  pattern: "hidetag", alias: ["htag"], react: "👁️",
  desc: "Tag all members silently", category: "group", filename: __filename
}, async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, body, command, config: cfg }) => {
  try {
    if (!isGroup) return reply('❌ *Group only command!*');

    const safeAdmins = Array.isArray(groupAdmins) ? groupAdmins : [];
    const botOwner = conn.user.id.split(':')[0];
    const senderJid = senderNumber + '@s.whatsapp.net';

    if (!safeAdmins.includes(senderJid) && senderNumber !== botOwner) {
      return reply('❌ *Admin only command!*');
    }

    let groupInfo = await conn.groupMetadata(from).catch(() => null);
    if (!groupInfo) return reply('❌ *Could not fetch group info!*');

    const safeParticipants = Array.isArray(participants) && participants.length > 0
      ? participants : (groupInfo.participants || []);
    if (safeParticipants.length === 0) return reply('❌ *No members found!*');

    let message = body.slice(body.indexOf(command) + command.length).trim() || '\u200e';

    await conn.sendMessage(from, {
      text: message,
      mentions: safeParticipants.map(a => a.id).filter(Boolean)
    }, { quoted: mek });

  } catch (e) {
    reply('❌ Error: ' + e.message);
  }
});
