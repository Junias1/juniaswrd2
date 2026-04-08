import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const EMOJI_TRIGGERS = new Set(['😘', '😊', '❤️', '🥰', '😍', '💕', '👀', '🔥', '💯', '😎']);

async function saveViewOnceToOwnerDM(sock, quotedMessage, ownerJid, requesterName) {
    const quotedImage = quotedMessage?.imageMessage;
    const quotedVideo = quotedMessage?.videoMessage;
    const quotedAudio = quotedMessage?.audioMessage;

    let mediaBuffer = null;
    let mediaType = null;
    let caption = '';

    if (quotedImage && quotedImage.viewOnce) {
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buf = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        mediaBuffer = buf;
        mediaType = 'image';
        caption = quotedImage.caption || '';
    } else if (quotedVideo && quotedVideo.viewOnce) {
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buf = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        mediaBuffer = buf;
        mediaType = 'video';
        caption = quotedVideo.caption || '';
    } else if (quotedAudio && quotedAudio.viewOnce) {
        const stream = await downloadContentFromMessage(quotedAudio, 'audio');
        let buf = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        mediaBuffer = buf;
        mediaType = 'audio';
    }

    if (!mediaBuffer) return false;

    const header = `*📥 View-Once Saved*\n_Requested by: ${requesterName || 'Someone'}_\n`;

    if (mediaType === 'image') {
        await sock.sendMessage(ownerJid, {
            image: mediaBuffer,
            caption: `${header}${caption ? '\n' + caption : ''}`
        });
    } else if (mediaType === 'video') {
        await sock.sendMessage(ownerJid, {
            video: mediaBuffer,
            caption: `${header}${caption ? '\n' + caption : ''}`
        });
    } else if (mediaType === 'audio') {
        await sock.sendMessage(ownerJid, {
            audio: mediaBuffer,
            mimetype: 'audio/mp4',
            caption: header
        });
    }

    return true;
}

export default {
    command: 'vv2',
    aliases: ['savevo', 'saveview', 'vo'],
    category: 'general',
    description: 'Secretly save a view-once image/video to bot DM',
    usage: '.vv2 (reply to a view-once message)',
    async handler(sock, message, args, context) {
        const { chatId, senderId } = context;
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) {
                return await sock.sendMessage(chatId, {
                    text: '📌 *Reply to a view-once image or video with .vv2 to save it secretly to bot DM.*'
                }, { quoted: message });
            }

            const hasViewOnce = quoted?.imageMessage?.viewOnce ||
                quoted?.videoMessage?.viewOnce ||
                quoted?.audioMessage?.viewOnce;

            if (!hasViewOnce) {
                return await sock.sendMessage(chatId, {
                    text: '❌ *The replied message is not a view-once media.*'
                }, { quoted: message });
            }

            const ownerJid = `${sock.user?.id?.split(':')[0].split('@')[0]}@s.whatsapp.net`;
            const requesterName = message.pushName || senderId.split('@')[0];

            const saved = await saveViewOnceToOwnerDM(sock, quoted, ownerJid, requesterName);

            if (saved) {
                await sock.sendMessage(chatId, {
                    react: { text: '✅', key: message.key }
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ *Could not extract view-once media. Please try again.*'
                }, { quoted: message });
            }
        } catch (error) {
            console.error('Error in vv2 command:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to save view-once media.'
            }, { quoted: message });
        }
    }
};

export { saveViewOnceToOwnerDM, EMOJI_TRIGGERS };
