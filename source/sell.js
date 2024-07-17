async function sell(bot, chatId, collection) {
    return new Promise(async (res, rej) => {
        try {
            let askingChoice = await bot.sendMessage(chatId, "တစ်ခုရွေးချယ်ပါ: ", {
                reply_markup: {
                    keyboard: [
                        [{ text: "✏ Profile ချိန်ကဒ်" }],
                        [{ text: "🧐 profile ကြည့်ကဒ်" }],
                        [{ text: "❌ cancel" }],
                    ]

                    , resize_keyboard: true,
                    one_time_keyboard: true
                }
            })



            let error;
            listenMessage2[chatId] = true;

            let selectdCard = await new Promise((res, rej) => {
                let index = 0;
                try {
                    let interval = setInterval(async () => {
                        try {
                            if (listenMessage2[chatId] !== true) {
                                clearInterval(interval);
                                let message = listenMessage2[chatId];
                                delete listenMessage2[chatId];

                                if (message === "✏ Profile ချိန်ကဒ်" || message === "🧐 profile ကြည့်ကဒ်") {
                                    res(message);
                                    return;
                                }
                                else if (message === "❌ cancel") {
                                    await bot.sendMessage(chatId, "🛑 card ရောင်းချင်း ရပ်တန့်သွားပါပြီး။");
                                    res(false);
                                    return;
                                }
                                else {
                                    await bot.sendMessage(chatId, "🥴ပေးထားသော ခလုပ် ကို အသုံးပြရပါမည်။ /sell ကိုနှိပ်၍ပြန်စပါ။");
                                    res(false);
                                    return;

                                }
                            }

                            if (index >= 20) {
                                clearInterval(interval);
                                delete listenMessage2[chatId];
                                await bot.deleteMessage(chatId, askingChoice.message_id);
                                await bot.sendMessage(chatId, "Time out pls try agian /sell");
                                res(false);
                                return;
                            }

                            index++;
                        }
                        catch (err) {
                            error = err;
                            clearInterval(interval);
                            delete listenMessage2[chatId];
                            res(false);
                        }
                    }, 1000)
                }
                catch (err) {
                    error = err;
                    delete listenMessage2[chatId];
                    res(false);
                }
            })


            if (selectdCard === false && error != undefined) {
                throw Error(error);
            }
            else if (selectdCard === false) {
                return;
            }
            let filed;
            let amount;

            if (selectdCard === "🧐 profile ကြည့်ကဒ်") {
                filed = "seekLimit"
                amount = 30;
            }
            else if (selectdCard === "✏ Profile ချိန်ကဒ်") {
                filed = "editLimit";
                amount = 5;
            }

            

            let data = await collection.find({ chatId }).toArray();
            let limit = data[0][filed];
            await bot.sendMessage(chatId, `${selectdCard} : ${limit}🎴`);

            // taking id form the auther 

            let askId = await bot.sendMessage(chatId, "👉 ပို့ချင်သော သူ၏ id ကို ထည့်ပါ \n\n👉 id ကို /id ပို့၍ ရရှိနိုင်သည်\n\n⚠️ ဝယ်တဲ့ သူ၏ id ကိုထည့်ရမှာနော်");

            listenMessage2[chatId] = true;

            let buyerId = await new Promise((res, rej) => {
                let index = 0;
                try {
                    let interval = setInterval(async () => {
                        try {
                            if (listenMessage2[chatId] !== true) {

                                clearInterval(interval);
                                let message = listenMessage2[chatId];
                                delete listenMessage2[chatId];
                                let ID = Number(message);

                                if (ID == chatId) {
                                    await bot.sendMessage(chatId, "😢 ကိုယ် id ပြန်ထည့်နေတာလာ ⁉️\n\n👉 card လွှဲပေးချင်သော သူ၏ Id ကိုထည့်ပါ။\n\n/sell to sell cards again");
                                    res(false);
                                    return;
                                }
                                await bot.sendMessage(chatId, "Id စစ်ဆေးနေပါသည်‼️");

                                let checkId = await collection.find({ chatId: ID }).toArray();
                                if (checkId[0] == undefined) {
                                    await bot.sendMessage(chatId, "👉user မတွေ့ပါ💢 /sell to sell again!");
                                    res(false);
                                    return;
                                }
                                else if (checkId[0].chatId === ID) {
                                    res({ status: true, data: checkId[0], filed: filed, amount: amount });
                                    return;
                                }

                            }
                            if (index >= 300) {
                                clearInterval(interval);
                                delete listenMessage2[chatId];
                                await bot.deleteMessage(chatId, askId.message_id);
                            }
                            index++;
                        }
                        catch (err) {
                            error = err;
                            clearInterval(interval);
                            delete listenMessage2[chatId];
                            res(false);
                        }
                    }, 1000)
                }
                catch (err) {
                    error = err;
                    res(false);
                }
            })

            if (buyerId == false && error != undefined) {
                throw Error(error);
            }
            else if (buyerId === false) {
                res(false); return;
            }


            let bData = buyerId.data;
            let ID = buyerId.data.chatId;
            let confirmMsg = await bot.sendMessage(chatId, `User တွေ့ရှိပါသည် \n\nName: ${bData.name}\n\nAge: ${bData.age}\n\nid: ${bData.chatId}\n\nအဲ့ user သို့ ${selectdCard} ${buyerId.amount} cards လွှဲမည်`, {
                reply_markup: {
                    keyboard: [
                        ["Okay✅"], ["မလုပ်တော့ပါ❌"]
                    ], resize_keyboard: true,
                    one_time_keyboard: true
                }
            });

            listenMessage2[chatId] = true;
            let confirm = await new Promise((res, rej) => {
                let index = 0;
                let interval = setInterval(async () => {
                    try {
                        if (listenMessage2[chatId] != true) {
                            clearInterval(interval);
                            let messsage = listenMessage2[chatId];
                            delete listenMessage2[chatId];

                            if (messsage === "Okay✅") {
                                res(true);
                                return;
                            }
                            else {
                                await bot.sendMessage(chatId, "🛑 card ရောင်းချင်း ရပ်တန့်သွားပါပြီး။");
                                res(false);
                                return;
                            }
                        }

                        if (index >= 20) {
                            clearInterval(interval);
                            delete listenMessage2[chatId];
                            await bot.deleteMessage(chatId, confirmMsg.message_id);
                            res(false);
                            return;
                        }
                        index++;
                    }
                    catch (err) {
                        error = err;
                        clearInterval(interval);
                        delete listenMessage2[chatId];
                        res(false);
                    }

                }, 1000)
            })

            if (confirm === false && error != undefined) {
                throw Error(error);
            }
            else if (confirm === false) {
                res(false); return;
            }

            // bloacking the dataBase;
            
            let block = await new Promise((res, rej) => {
                let index = 0;
                let interval = setInterval(() => {
                    if (accessDataBase[chatId] == undefined) {
                        clearInterval(interval);
                        res(true);
                        return;
                    }

                    if (index >= 20) {
                        clearInterval(interval);
                        res(false); return;
                    }
                    index++;
                }, 1000);
            })

            if (block) {
                accessDataBase[chatId] = true;
                let dataOfSeller = await collection.find({ chatId: chatId }).toArray();
                let existCard = dataOfSeller[0][filed];
                if (existCard >= amount) {
                    existCard = existCard - amount;
                    await collection.updateOne({ chatId: chatId }, { $set: { [filed]: existCard } });

                    let buyerId = await collection.find({ chatId: ID }).toArray();
                    let leftCard = buyerId[0][filed];
                    leftCard = leftCard + amount;

                    await collection.updateOne({ chatId: ID }, { $set: { [filed]: leftCard } });

                    delete accessDataBase[chatId];

                    await bot.sendMessage(ID, `${selectdCard} ${amount} ရရှိပါသည်။ /card to check`);
                    await bot.sendMessage(chatId, `👉card ပို့ချင်း အောင်မြင်ပါသည်\n\n ကျန်ရှိသော cards များ /card to check!`)

                    res(true);
                    return;
                }
                else{
                    delete accessDataBase[chatId];
                    await bot.sendMessage(chatId,"လွဲရန် cards မလုံလောက်ပါ။😔");
                    res(false);
                    return;
                }
            }
            else{
                res(false);
                return;
            }

        }
        catch (err) {
            console.log(err);
        }
    })
}

module.exports.sell = sell;