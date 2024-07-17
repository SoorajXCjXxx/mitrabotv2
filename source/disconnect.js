
function removeListeners(chatId, bot) {

    try {
        let removeList = global.replyQuee[chatId]; // will get array of replyListener id ;
        if (removeList == undefined) {
            return;
        }

        for (let a = 0; a < removeList.length; a++) {
            let b = bot.removeReplyListener(removeList[a]);
        }
        delete global.replyQuee[chatId];
    }
    catch (err) {

    }
}

async function disconnect(bot, chatId, command) {
    try {
        if (global.messageQuee[chatId] === undefined) {
            await bot.sendMessage(chatId, "🤨 ကျော်ဖို့ ဘယ်သူမှ မရှိဘူး \n\n🚀 ရှာရန် /start 𝙤𝙧 /find ကိုနှိပ်ပါ🌚");
            return { status: false };
        }
        let chatId2 = global.messageQuee[chatId]; // getting chatId of secondUser
        
        // deleting from inMessage
        delete global.inMessage[chatId];
        delete global.inMessage[chatId2];
        
        // deleteing form messageQuee
        delete global.messageQuee[chatId]
        delete global.messageQuee[chatId2];
        
        removeListeners(chatId, bot);
        removeListeners(chatId2, bot);
        
        let keyboard = {
            reply_markup: {
                keyboard: [
                    [{ text: '🚀 Find new partner' }],
                    [{ text: '💼 Grow business with us' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        };
        let adviceLine = `Bot နှင့် ပတ်သက်၍ အကြံပေးလိုပါက  @Ye_lin_tun_x_C ကို ဆက်သွယ်ပါ`;
        
        if (command == "/stop") {
            await bot.sendMessage(chatId, "သင်ရပ်တန့်လိုက်ပြီး💢\n\n နောက်တစ်ယောက်ရှာရန် /start or /find ကိုနှိပ်ပါ🙃", keyboard);
            await bot.sendMessage(chatId, adviceLine);
        }
        else {
            await bot.sendMessage(chatId, "သင်ရပ်တန့်လိုက်ပြီး💢\n\n သင့်အတွက်နောက်တစ်ယောက် ရှာနေပါသည်😜");
            await bot.sendMessage(chatId, adviceLine);

        }
        await bot.sendMessage(chatId2, "ခနခန😅 အကျော် ခံရပြီး \n\nနောက်တစ်ယောက်ရှာရန် /start or /find ကိုနှိပ်ပါ🙃", keyboard);
        await bot.sendMessage(chatId2, adviceLine);
        return { status: true };
    }
    catch (err) {
        return { status: "error", error: err };
        console.log(err);
    }
}

module.exports.disconnect = disconnect;