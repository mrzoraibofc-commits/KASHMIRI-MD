const { cmd } = require('../inconnuboy');
const config = require('../config');
const { getLang } = require('../lib/lang');

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

const BOT_LINK = 'https://inconnu.zone.id';

cmd({
    pattern: 'repo',
    alias: ['getbot', 'source', 'clone', 'botlink'],
    desc: 'Get the bot link and pairing instructions',
    category: 'general',
    react: '🤖',
    use: '.repo',
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, config: cfg }) => {
    try {
        const lang = cfg?.BOT_LANG || 'en';
        const botName = cfg?.BOT_NAME || config.BOT_NAME || 'SHINIGAMI-MD';

        const msgEn = `╔══════════════════╗
║  🤖 *${botName}*
╚══════════════════╝

🔗 *Bot Website:*
${BOT_LINK}

━━━━━━━━━━━━━━━━━━━━
📲 *HOW TO CONNECT YOUR BOT:*
━━━━━━━━━━━━━━━━━━━━

*Step 1:* Visit the link above 👆
*Step 2:* Enter your WhatsApp number
*Step 3:* A *8-digit pairing code* will be generated
*Step 4:* On your phone, open WhatsApp
*Step 5:* Go to ⚙️ *Settings* → *Linked Devices*
*Step 6:* Tap *Link a Device*
*Step 7:* Choose *Link with phone number instead*
*Step 8:* Enter the *8-digit code* shown on the website

✅ *Your bot is now connected!*

━━━━━━━━━━━━━━━━━━━━
> © Powered by Inconnu Boy`;

        const msgFr = `╔══════════════════╗
║  🤖 *${botName}*
╚══════════════════╝

🔗 *Site Web du Bot :*
${BOT_LINK}

━━━━━━━━━━━━━━━━━━━━
📲 *COMMENT CONNECTER TON BOT :*
━━━━━━━━━━━━━━━━━━━━

*Étape 1 :* Visite le lien ci-dessus 👆
*Étape 2 :* Entre ton numéro WhatsApp
*Étape 3 :* Un *code de pairage à 8 chiffres* sera généré
*Étape 4 :* Sur ton téléphone, ouvre WhatsApp
*Étape 5 :* Va dans ⚙️ *Paramètres* → *Appareils connectés*
*Étape 6 :* Appuie sur *Associer un appareil*
*Étape 7 :* Choisis *Associer avec un numéro de téléphone*
*Étape 8 :* Saisis le *code à 8 chiffres* affiché sur le site

✅ *Ton bot est maintenant connecté !*

━━━━━━━━━━━━━━━━━━━━
> © Powered by Inconnu Boy`;

        const text = lang === 'fr' ? msgFr : msgEn;

        await conn.sendMessage(from, {
            text: text
        }, { quoted: mek });

    } catch (e) {
        console.error('REPO ERROR:', e);
        reply('❌ ' + e.message);
    }
});
