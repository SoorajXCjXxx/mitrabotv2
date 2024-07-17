async function sendMail(bot, msg, collection,chatId) {
    try {
        // Find all documents with projection for chatId only
        const chatIds = await collection.find({}).project({ chatId: 1, _id: 0 }).toArray();

        let length = chatIds.length;
        let a = 0;
        let interval = setInterval(async () => {
            try {

                if (msg.file == null) {
                    await bot.sendMessage(chatIds[a].chatId, msg.text);
                }
                else if (msg.type == "video") {
                    await bot.sendVideo(chatIds[a].chatId, msg.file, { caption: msg.text })
                }
                else if (msg.type == "photo") {
                    await bot.sendPhoto(chatIds[a].chatId, msg.file, { caption: msg.text })
                }
            }
            catch (err) {
            }

            a++;
            if (a >= length) {
                bot.sendMessage(chatId,"Mailing done! yep");
                clearInterval(interval);
            }
        }, 1000);

        // console.log(chatIds[a].chatId);
        
    }
    catch (err) {
        await bot.sendMessage(chatId,"facing error on mailing...");

        console.log(err);
    }
}

module.exports.sendMail = sendMail;