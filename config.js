const fs = require('fs');

// ==================== CONFIGURATION VARIABLES ====================
// Yahan apni values direct set karo - config.env ki zaroorat nahi

module.exports = {
    // ==================== SESSION CONFIG ====================
    SESSION_ID: "",  // Apna session ID yahan paste karo
    
    // ==================== STATUS FEATURES ====================
    AUTO_STATUS_SEEN: "true",
    AUTO_STATUS_REPLY: "false",
    AUTO_STATUS_REACT: "true",
    AUTO_STATUS_MSG: "*SEEN YOUR STATUS BY KASHMIRI-MD 💔*",
    
    // ==================== ANTI FEATURES ====================
    ANTI_DELETE: "true",
    ANTI_DEL_PATH: "inbox",
    ANTI_LINK: "true",
    ANTI_LINK_KICK: "false",
    WARN_LIMIT: "3",
    ANTI_BAD: "false",
    ANTI_VV: "true",
    ANTI_CALL: "true",
    ANTI_SPAM: "false",
    ANTI_BOT: "false",
    
    // ==================== GROUP SETTINGS ====================
    WELCOME: "false",
    ADMIN_EVENTS: "true",
    DELETE_LINKS: "false",
    GROUP_SYSTEM: "true",
    AUTO_JOIN: "false",
    
    // ==================== BOT SETTINGS ====================
    PREFIX: ".",
    BOT_NAME: "KASHMIRI-MD̷═",
    MODE: "public",
    ALWAYS_ONLINE: "false",
    PUBLIC_MODE: "true",
    LANG: "en",
    
    // ==================== OWNER INFORMATION ====================
    OWNER_NUMBER: "923247947238",
    OWNER_NAME: "KASHMIRI-MD",
    DEV: "923247947238",
    OWNER_REACT: "👑",
    
    // ==================== MESSAGE SETTINGS ====================
    READ_MESSAGE: "false",
    READ_CMD: "false",
    MENTION_REPLY: "false",
    AUTO_REPLY: "true",
    AUTO_REPLY_MSG: "I'm busy right now!",
    AUTO_REPLY_TIME: "0",
    
    // ==================== REACTION SETTINGS ====================
    AUTO_REACT: "false",
    CUSTOM_REACT: "false",
    CUSTOM_REACT_EMOJIS: "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
    REACT_ON_CMD: "true",
    REACT_ON_TAG: "false",
    
    // ==================== MEDIA SETTINGS ====================
    MENU_IMAGE_URL: "https://eliteprotech-url.zone.id/1778118748432fgnyd1.jpg",
    ALIVE_IMG: "https://eliteprotech-url.zone.id/1778118748432fgnyd1.jpg",
    STICKER_NAME: "KASHMIRI-MD",
    STICKER_AUTHOR: "KASHMIRI-MD",
    IMAGE_QUALITY: "80",
    
    // ==================== AUTO ACTIONS ====================
    AUTO_STICKER: "false",
    AUTO_TYPING: "false",
    AUTO_RECORDING: "false",
    AUTO_BIO: "false",
    AUTO_BIO_MSG: "Zoraib Kashmiri Online",
    AUTO_VOICE: "false",
    
    // ==================== DOWNLOAD SETTINGS ====================
    DOWNLOAD_QUALITY: "high",
    MAX_DOWNLOAD_SIZE: "100",
    SAVE_MEDIA: "true",
    
    // ==================== ALIVE MESSAGE ====================
    LIVE_MSG: "ᴋᴀsʜᴍɪʀɪ ᴍᴅ ᴀʟɪᴠᴇ",
    
    // ==================== DESCRIPTION ====================
    DESCRIPTION: "*©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴀsʜᴍɪʀɪ ᴍᴅ*",
    
    // ==================== ULTRA NEW FEATURES ====================
    // Voice & Audio Features
    AUTO_VOICE_REPLY: "false",
    VOICE_LANG: "en",
    
    // AI Features
    AI_CHAT: "true",
    AI_MODEL: "gpt-3.5-turbo",
    AI_TEMP: "0.7",
    
    // Database Features
    DATABASE_URL: "",
    DATABASE_NAME: "kashmiri-md",
    
    // Plugin Features
    AUTO_LOAD_PLUGINS: "true",
    EXTERNAL_PLUGINS: "",
    
    // Security Features
    BOT_BLOCK: "false",
    MAX_CMD_PER_MIN: "10",
    BAN_DURATION: "60",
    
    // Performance Features
    CACHE_SIZE: "50",
    MAX_CONNECTIONS: "5",
    AUTO_RESTART: "false",
    RESTART_TIME: "3600000"
};
