
async function varifyText(text, chatId,bot) {
    try {
        let banWords = ["@", "www.", "https://", "http://", "t.me/", ".com"];
        for (let a = 0; a < banWords.length; a++) {
            if (text.includes(banWords[a])) {
                await bot.sendMessage(chatId, `😥 link ပို့မရပါ🔗 \n\n💀 Ban list - ${JSON.stringify(banWords)}`)
                return { status: false };
                break;
            }
        }

        return { status: true, text: text };

    }
    catch (err) {
        return {status:"error",error:err}
    }
}

module.exports.varifyText = varifyText