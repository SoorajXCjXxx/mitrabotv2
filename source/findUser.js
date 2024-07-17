async function find(bot, chatId, gender, matchCollection) {
    return new Promise(async (res, rej) => {
        try {
// task 1: checking is exist
            const isExist = await matchCollection.find({ chatId }).toArray();
            if (isExist[0] != undefined) {
                await bot.sendMessage(chatId,"Already searching for you...");
                res({ status: "exist" });
                return;
            }

            const opts = {
                reply_markup: {
                    keyboard: [
                        ['👦 Boy ရှာမည်။'],
                        ['👧 Girl ရှာမည်။'], // You can add more rows as needed
                        ["❌"]
                    ],
                    resize_keyboard: true, // Adjusts keyboard size to fit buttons
                    one_time_keyboard: true,// Hides keyboard after one use (optional)

                }
            };
              
            const cancelOPtion = {
                reply_markup: {
                    keyboard: [
                        ["✖ Cancel လုပ်မည်"],
                        // You can add more rows as needed
                    ],
                    resize_keyboard: true, // Adjusts keyboard size to fit buttons
                    one_time_keyboard: true,// Hides keyboard after one use (optional)
                }
            };

            // asking user to select his/her choice
            global.listenMessage[chatId] = true;
            let error;
            let choiceAsker = await bot.sendMessage(chatId, "သင့်အကြိုက် ရွေးချယ်ပါ။", opts);
            let selectedGender = await new Promise((res, rej) => {
                let index = 0;
                let interval = setInterval(async() => {
                    try {

                        if(listenMessage[chatId]!=true){
                            
                            clearInterval(interval);
                            let enterMessage = global.listenMessage[chatId];
                            delete global.listenMessage[chatId]; 
                        
                            if (enterMessage === "👦 Boy ရှာမည်။" || enterMessage === "👧 Girl ရှာမည်။") {
                                
                                res(enterMessage);
                            }
                            else if(enterMessage==="❌"){
                                await bot.sendMessage(chatId,"✖ Cancel လုပ်ချင်း အောင်မြင်ပါသည်။\n\nနောက်တစ်ခါ partner ရှာလိုပါက /start သို့ /find ကို နှိပ်ပါ။")
                                res(false);
                            }
                            else{
                                await bot.sendMessage(chatId, "🥴ပေးထားသော ခလုပ် နှစ်ခု ကို အသုံးပြရပါမည်။ /start ကိုနှိပ်၍ပြန်စပါ။");
                                res(false);
                            }
                        }

                        else if(index>15){
                            clearInterval(interval);
                            await bot.sendMessage(chatId, '😴ရွေးချယ်ချိန်ကုန်ဆုံးသွားပါပြီ။\n\nနောက်တစ်ခါ ရှာရန် /start or /find ကို နှိပ်ပါ။');
                            await bot.deleteMessage(chatId,choiceAsker.message_id);
                            delete global.listenMessage[chatId];
                            res(false);
                        }
                        index++;
                    }
                    catch (err) {
                        clearInterval(interval);  
                        delete global.listenMessage[chatId];
                        error = err;
                        res("error")
                    }
                }, 1000);

            })
            
            let searchFor;
            if(selectedGender==="error"){
                console.log(error);
                throw Error(error);
            }
            else if(selectedGender===false){
                res({status:false});
                return;
            }

            else if (selectedGender == "👦 Boy ရှာမည်။") {
                searchFor = "male";
            }
            else if (selectedGender == "👧 Girl ရှာမည်။") {
                searchFor = "female";
            }
            
            if (gender === "other") {
                gender = "male";
            }

            // Now, we have fist user's gender and what he is searching for
            // connection g1 = male and s1 = female ---> g2 = female and s2 = male
            // means g2 = s1 and s2 = g1
          
            let secondUserGender = searchFor;
            let secondUserNeed = gender;
          
            let searchUser = await matchCollection.find({gender:secondUserGender,searchFor:secondUserNeed}).toArray();
          
            if(searchUser[0]==undefined){
                await matchCollection.insertOne({chatId:chatId,gender:gender,searchFor:searchFor});
                await bot.sendMessage(chatId,`😁 ${searchFor} partner ရှာနေပါသည်။`,cancelOPtion);
                res({status:"waiting"});
            }
            else if(searchUser[0]!=undefined){
                await matchCollection.deleteOne({chatId:searchUser[0].chatId});
                res({status:true,data:{chatId1:chatId,chatId2:searchUser[0].chatId}});
                return;
            }

        }
        catch (err) {
            res({ status: "error", error: err })
        }  
    })
}

module.exports.findUser = find;