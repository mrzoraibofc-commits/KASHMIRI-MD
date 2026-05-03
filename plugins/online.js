const { cmd } = require('../inconnuboy');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

cmd({
    pattern: "online",
    alias: ["whosonline", "onlinemembers"],
    desc: "Check who's online in the group (Admins & Owner only)",
    category: "main",
    react: "🟢",
    filename: __filename
},
async (conn, mek, m, { from, quoted, isGroup, isAdmins, isCreator, fromMe, reply, config: cfg }) => {
    try {
        if (!isGroup) return reply(t(cfg, 'ONLINE_GROUP_ONLY'));
        if (!isCreator && !isAdmins && !fromMe) return reply(t(cfg, 'ONLINE_ADMIN_ONLY'));

        await reply(t(cfg, 'ONLINE_CHECKING'));

        const onlineMembers = new Set();
        const groupData = await conn.groupMetadata(from);
        const presencePromises = [];

        for (const participant of groupData.participants) {
            presencePromises.push(
                conn.presenceSubscribe(participant.id)
                    .then(() => conn.sendPresenceUpdate('composing', participant.id))
            );
        }

        await Promise.all(presencePromises);

        const presenceHandler = (json) => {
            for (const id in json.presences) {
                const presence = json.presences[id]?.lastKnownPresence;
                if (['available', 'composing', 'recording', 'online'].includes(presence)) {
                    onlineMembers.add(id);
                }
            }
        };

        conn.ev.on('presence.update', presenceHandler);

        const checks = 3;
        const checkInterval = 5000;
        let checksDone = 0;

        const checkOnline = async () => {
            checksDone++;
            if (checksDone >= checks) {
                clearInterval(interval);
                conn.ev.off('presence.update', presenceHandler);

                if (onlineMembers.size === 0) {
                    return reply("⚠️ Couldn't detect any online members. They might be hiding their presence.");
                }

                const onlineArray = Array.from(onlineMembers);
                const onlineList = onlineArray.map((member, index) =>
                    `${index + 1}. @${member.split('@')[0]}`
                ).join('\n');

                const message = `*👑 ONLINE MEMBERS LIST 👑* (${onlineArray.length}/${groupData.participants.length}):\n\n${onlineList}`;

                await conn.sendMessage(from, { text: message, mentions: onlineArray }, { quoted: mek });
            }
        };

        const interval = setInterval(checkOnline, checkInterval);
    } catch (e) {
        console.error("Error in online command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
