
const { cmd } = require('../inconnuboy')
const axios = require('axios')
const { getLang } = require('../lib/lang')

const t = (cfg, key, ...args) => getLang(cfg?.BOT_LANG || 'en', key, ...args);

// simple in-memory store (resets on restart)
const tempMailStore = {}

cmd({
    pattern: "tempmail",
    alias: ["tmpmail", "mail"],
    react: "📧",
    desc: "Create temp email & check inbox",
    category: "tools",
    use: ".tempmail | .tempmail inbox",
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply, config: cfg }) => {
    try {
        // 📥 INBOX CHECK
        if (args[0] === "inbox") {
            const data = tempMailStore[sender]
            if (!data) return reply(t(cfg, 'TEMPMAIL_CREATE_FIRST'));

            const url = `https://www.movanest.xyz/v2/tempmail/check?token=${data.token}`
            const res = await axios.get(url)

            if (!res.data.results || res.data.results.length === 0) {
                return reply(t(cfg, 'TEMPMAIL_NO_MESSAGES'));
            }

            let msg = "*📬 INBOX MESSAGES*\n\n"
            res.data.results.forEach((m, i) => {
                msg += `*${i + 1}.*\nFrom: ${m.from}\nSubject: ${m.subject}\nMessage:\n${m.text}\n\n`
            })

            return reply(msg)
        }

        // 📧 CREATE TEMP MAIL
        const domainsRes = await axios.get("https://www.movanest.xyz/v2/tempmail/domains")
        const domains = domainsRes.data.results
        const domain = domains[Math.floor(Math.random() * domains.length)].name
        const username = "user" + Math.floor(Math.random() * 10000)

        const genUrl = `https://www.movanest.xyz/v2/tempmail/generate?username=${username}&domain=${domain}`
        const genRes = await axios.get(genUrl)
        const email = genRes.data.results.email
        const token = genRes.data.results.token

        tempMailStore[sender] = { email, token }

        reply(
`📧 *TEMP MAIL READY*

Email:
${email}

📥 Check inbox:
.tempmail inbox

⚠️ Token is private
👑 SHINIGAMI MD`
        )
    } catch (e) {
        console.log("TEMPMAIL ERROR:", e)
        reply(t(cfg, 'TEMPMAIL_ERROR'));
    }
})
