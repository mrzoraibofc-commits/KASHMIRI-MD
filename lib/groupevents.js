//Give Me Credit If Using This File Give Me Credit On Your Channel ✅ 
// Credits boss TechX - Boss-md 💜 

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363405061777123@newsletter',
            newsletterName: '𝘽𝙊𝙎𝙎-𝙈𝘿',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        // ✅ FIXED: Handle participants properly
        for (const participant of participants) {
            // Safely extract user ID
            let userId = '';
            let userName = '';
            
            if (typeof participant === 'string') {
                // Participant is already a JID string
                userId = participant;
                userName = participant.split("@")[0];
            } else if (participant.id) {
                // Participant is an object with id property
                userId = participant.id;
                userName = participant.id.split("@")[0];
            } else {
                // Unknown format, skip
                continue;
            }
            
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `Hey @${userName} 👋\n` +
                    `Welcome to *${metadata.subject}*.\n` +
                    `You are member number ${groupMembersCount} in this group. 🙏\n` +
                    `Time joined: *${timestamp}*\n` +
                    `Please read the group description to avoid being removed:\n` +
                    `${desc}\n` +
                    `*Powered by ${config.BOT_NAME}*.`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [userId],
                    contextInfo: getContextInfo({ sender: userId }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `Goodbye @${userName}. 😔\n` +
                    `Another member has left the group.\n` +
                    `Time left: *${timestamp}*\n` +
                    `The group now has ${groupMembersCount} members. 😭`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [userId],
                    contextInfo: getContextInfo({ sender: userId }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                // ✅ FIXED: Safe author extraction
                const authorId = update.author || '';
                const demoter = authorId.split("@")[0] || 'Unknown';
                
                await conn.sendMessage(update.id, {
                    text: `*Admin Event*\n\n` +
                          `@${demoter} has demoted @${userName} from admin. 👀\n` +
                          `Time: ${timestamp}\n` +
                          `*Group:* ${metadata.subject}`,
                    mentions: [authorId, userId],
                    contextInfo: getContextInfo({ sender: authorId }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                // ✅ FIXED: Safe author extraction
                const authorId = update.author || '';
                const promoter = authorId.split("@")[0] || 'Unknown';
                
                await conn.sendMessage(update.id, {
                    text: `*Admin Event*\n\n` +
                          `@${promoter} has promoted @${userName} to admin. 🎉\n` +
                          `Time: ${timestamp}\n` +
                          `*Group:* ${metadata.subject}`,
                    mentions: [authorId, userId],
                    contextInfo: getContextInfo({ sender: authorId }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
