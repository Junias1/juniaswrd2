import fs from "fs";

export default {
  command: "menu",
  aliases: ["help"],
  description: "Premium bot menu",
  category: "general",

  async handler(sock, message, args, context) {
    try {
      const chatId = context.chatId || message.key.remoteJid;
      const user = message.pushName || "User";
      const time = new Date().toLocaleTimeString();
      const date = new Date().toLocaleDateString();

      const caption = `
╭━━━〔 ꧁Juniaswrld꧂ 〕━━━╮
┃ 👤 User: ${user}
┃ 📅 Date: ${date}
┃ ⏰ Time: ${time}
┃
┃ 📌 .menu
┃ ⚡ .ping
┃ ❤️ .alive
┃ 😂 .joke
┃ 🎵 .play
┃ 👥 .kick
┃ 🚫 .ban
┃
╰━━━━━━━━━━━━━━━━━━━╯

📢 Follow the Juniaswrld channel:
https://whatsapp.com/channel/0029VbCSAX4AO7RHo5Ygk00h
`;

      const imageExists = fs.existsSync("./media/menu.jpg");
      if (imageExists) {
        await sock.sendMessage(chatId, {
          image: fs.readFileSync("./media/menu.jpg"),
          caption
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }

    } catch (e) {
      console.error(e);
    }
  }
};
