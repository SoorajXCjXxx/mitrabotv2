async function register(msg, bot, collection) {
    return new Promise(async (res, rej) => {
        try {

            let helpLine = `🚨 Bot သုံးနည်း

👮‍♂  /start ,  /find command သည် လူရှာရန်ုဖြစ်သည်။ 
            
👮‍♂ /next command သည်လက်ရှိစကားပြောနေသောလူအား ကျော်ရန်ဖြစ်သည်။
            
👮‍♂ /stop command သည် bot ကိုရပ်တန့်ရန်ဖြစ်သည်။
                    
⚠️ အထက်ပါဖော်ပြထားသော commands များကို စာရိုက်ပြီးပို့နိုင်သလို အဲ့ command များကို ဖော်ပြထားသော နေရာတွင် နှိပ်၍လဲ သုံးနိုင်သည်။`
            // button for gender 

            // button end here
            let name = ".. ...";

            let userName = null;
            if (msg.username != undefined) {
                userName = msg.username;
            }

            await bot.sendMessage(msg.chat.id, "🌐-Rigister require! \n\nစသုံးသူ အနေနဲ rigister လုပ်ပေးရမည်");

            let ageMessage = await bot.sendMessage(msg.chat.id, "📆 𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙮𝙤𝙪𝙧 𝙖𝙜𝙚!\n\n 📆 သင်၏အသက်ကိုထည့်ပါ။", {
                reply_markup: {
                    force_reply: true
                }
            })

            let replyIndexForAge;
            let clearTimeoutForAge;
            let error;

            let inputedAge = await new Promise((res, rej) => {

                clearTimeoutForAge = setTimeout(async () => {
                    try {
                        bot.removeReplyListener(replyIndexForAge);  
                        await bot.deleteMessage(ageMessage.chat.id, ageMessage.message_id);
                        res("time_out");
                    }
                    catch (err) {
                        error = err;
                        res("error");
                    }
                    
                }, 1000 * 60);

                replyIndexForAge = bot.onReplyToMessage(msg.chat.id, ageMessage.message_id, (reply) => {
                    try {
                        clearTimeout(clearTimeoutForAge);
                        bot.removeReplyListener(replyIndexForAge);
                        if (reply.text && isNaN(reply.text) === false) {
                            res(reply.text);
                        }
                        else {
                            res(false);
                        }
                    }
                    catch (err) {
                        error = err;
                        res("error");
                    }
                })
            })



            if (inputedAge === false) {
                await bot.sendMessage(msg.chat.id, "❌ Register လုပ်ချင်းမအောင်မြင်ပါ။ \n\nထည့်ထား သော အသက်သည် english လို့ဖြစ်ရမည်။\n\n eg:  20,/start ကိုနှိပ်၍ ပြန်စပါ။");
                res({ status: false });
                return;
            }
            else if (inputedAge === "time_out" || inputedAge == "error") {
                await bot.sendMessage(msg.chat.id, "❌ Register လုပ်ချင်းမအောင်မြင်ပါ။/start ကိုနှိပ်၍ ပြန်စပါ။");
                if (inputedAge==="error") {
                    res({ status: "error", error: error });
                    return;
                }
                res({ status: false });
                return;
            }
            let age = inputedAge;

        

            // code for gender selection 

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🚹 Male - ကျား', callback_data: 'male' }],
                        [{ text: '🚺 Female - မ', callback_data: 'female' }],
                        [{ text: '⭕ Other', callback_data: 'other' }],
                    ],
                },

            };

            let ageAsk = await bot.sendMessage(msg.chat.id, "𝙋𝙡𝙚𝙖𝙨𝙚 𝙨𝙚𝙡𝙚𝙘𝙩 𝙮𝙤𝙪𝙧 𝙜𝙚𝙣𝙙𝙚𝙧:\n\nကျေးဇူးပြု၍ တစ်ခုရွေးပါ။", keyboard);

            let gender;
            let intervalForGender;
            let countForGender = 0;

            let genderRespose = await new Promise((res, rej) => {
                intervalForGender = setInterval(async () => {
                    try{
                        if(global.genderQuaue[msg.chat.id]!=undefined){
                            clearInterval(intervalForGender);
                            await bot.deleteMessage(msg.chat.id,ageAsk.message_id);
                            let enteredGender = global.genderQuaue[msg.chat.id];
                            delete global.genderQuaue[msg.chat.id];

                            if(enteredGender==="male" || enteredGender==="female" || enteredGender ==="other"){
                                res(enteredGender);
                            }
                            else{
                                res(false);
                            }
                        }

                        if(countForGender>=60){
                            clearInterval(intervalForGender);
                            delete global.genderQuaue[msg.chat.id];  
                            await bot.deleteMessage(msg.chat.id,ageAsk.message_id);
                            res("time_out");
                        }
                        countForGender++;
                    }
                    catch(err){
                        clearInterval(intervalForGender);
                        try{
                            await bot.deleteMessage(msg.chat.id,ageAsk.message_id);
                        }
                        catch(err){
                            console.log(err);
                        }
                        delete global.genderQuaue[msg.chat.id];
                        error = err;
                        res("error");
                    }
                }, 1000);
            })

            if (genderRespose === "time_out"|| genderRespose=="error") {
                await bot.sendMessage(msg.chat.id, "❌ Register လုပ်ချင်းမအောင်မြင်ပါ။/start ကိုနှိပ်၍ ပြန်စပါ။");
                if(genderRespose==="error"){
                    res({status:"error",error:error});
                    return;
                }
                res({ status: false });
                return;
            }
            else if (genderRespose === false) {
                await bot.sendMessage(msg.chat.id, "🥴ပေးထားသော ခလုပ် နှစ်ခု ကို အသုံးပြရပါမည်။ /start ကိုနှိပ်၍ပြန်စပါ။");
                res({ status: false });
                return;

            }
            gender = genderRespose;

            let picTimeOut;
            let picReplyIndex;

            let picData = await bot.sendMessage(msg.chat.id, "profile ပုံတစ်ခု ပို့ပါ။\n\n⚠️ Fake ပုံပို့ရန် အကြံပြုပါသည်။", {
                reply_markup: {
                    force_reply: true
                }
            });

            let picUrl = await new Promise((res, rej) => {
                picTimeOut = setTimeout(async () => {
                    try {
                        bot.removeReplyListener(picReplyIndex);
                        await bot.deleteMessage(msg.chat.id, picData.message_id);
                        res("time_out");
                    }
                    catch (err) {
                        error = err;
                        res("error");
                    }
                    
                }, 1000 * 60)

                let picReplyIndex = bot.onReplyToMessage(msg.chat.id, picData.message_id, (reply) => {
                    try{
                        clearTimeout(picTimeOut);
                        bot.removeReplyListener(picReplyIndex);
    
                        if (reply.photo) {
                            res(reply.photo[0].file_id);
                        }
                        else {
                            res(false);
                        }
                    }
                    catch(err){
                        error = err;
                        res("error");
                    }
    
                })
                
                
            })

            if (picUrl == "time_out" || picUrl ==="error") {
                await bot.sendMessage(msg.chat.id, "❌ Register လုပ်ချင်းမအောင်မြင်ပါ။/start ကိုနှိပ်၍ ပြန်စပါ။");
                if(picUrl==="error"){
                    res({status:"error",error:error});
                    return;
                }
                res({ status: false });
                return;
            }
            else if (picUrl === false) {
                await bot.sendMessage(msg.chat.id, "❌ Register လုပ်ချင်းမအောင်မြင်ပါ။\n\n video မပို့ရ၊ တစ်ပုံ့ထဲ ပို့ပါ။\n\n/start ကိုနှိပ်၍ ပြန်စပါ။")
                res({ status: false });
                return;
            }
            let url = picUrl;




            let data = { name, age, gender, userName, url, chatId: msg.chat.id, isPro: false, editLimit: 3,seekLimit:10 };
            let dataBaseStatus = await collection.insertOne(data);

            if (dataBaseStatus.acknowledged === true) {
                await bot.sendMessage(msg.chat.id, "✅ Your account is registered successfully");
                await bot.sendMessage(msg.chat.id, helpLine);
                res({ status: true, gender: gender });
            }
            else {
                res({ status: false });
            }


        }
        catch (err) {
            
            try{
                await bot.sendMessage(msg.chat.id, '❌ Register လုပ်ချင်းမအောင်မြင်ပါ။/start ကိုနှိပ်၍ ပြန်စပါ။');
            }
            catch(err){};

            console.log(err);
            res({ status: "error", error: err });
            return;
        }
    })
}

module.exports.register = register;