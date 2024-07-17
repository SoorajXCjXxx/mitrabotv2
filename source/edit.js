async function edit(bot,chatId,data,collection){
    
    return new Promise(async(res,rej)=>{
        try{

            if(listenMessage[chatId]===true){
                console.log("fun")
                await bot.sendMessage(chatId,"🗨️Message form /edit: \n\n \t😐 အရင်ဖွင့်ထားသော commad များကို ဆုံးဖြစ်အောင် သုံးပါ သို့မဟုတ် ခန စောင့်ပါ။");
                res(false);
                return;
            }

            let userData = await collection.find({chatId}).toArray();
    
            if(userData[0].editLimit>=1){
                let messages = ["သင်၏ နာမည် အသစ်ကို ပို့ပါ။", "သင်၏ အသက် အသစ်ကို ပို့ပါ။", "ပြောင်းချင်း လိုသော profile ပုံ အသစ်ကို ပို့ပါ။"];
                let accessId;

                if(data=="edit_name"){
                    accessId =0;
                }
                else if(data==="edit_age"){
                    accessId = 1;
                }
                else if(data==="edit_profile"){
                    accessId = 2;
                }

                let asker = await bot.sendMessage(chatId,`${messages[accessId]}`,{
                    reply_markup:{
                        force_reply:true
                    }
                });

                let timeOutForNewData;
                let replyIndexForNewData;
                let error;

                let newData = await new Promise((res,rej)=>{
                    timeOutForNewData = setTimeout(async()=>{
                        try{
                            await bot.deleteMessage(chatId,asker.message_id);
                            bot.removeReplyListener(replyIndexForNewData);
                            res("time_out");
                        }
                        catch(err){
                            error = err;
                            res("error"); 
                        }
                    },1000*60);

                    replyIndexForNewData =  bot.onReplyToMessage(chatId,asker.message_id,async(reply)=>{
                        try{
                            clearTimeout(timeOutForNewData);
                            bot.removeReplyListener(replyIndexForNewData);

                            if(reply.text){
                                if(accessId == 0 || accessId == 1){
                                    if(accessId==1){
                                        if (reply.text && isNaN(reply.text) === false) {
                                            res(reply.text);
                                        }
                                        else {
                                            await bot.sendMessage(chatId, "❌ Register လုပ်ချင်းမအောင်မြင်ပါ။ \n\nထည့်ထား သော အသက်သည် english လို့ဖြစ်ရမည်။\n\n eg:  20,/edit ကိုနှိပ်၍ ပြန်စပါ။");
                                            res(false);
                                        }
                                    }
                                    else{
                                        res(reply.text);
                                    }
                                }
                                else{
                                    res(false);
                                }
                            }
                            else if(reply.photo && accessId ==2){
                                res(reply.photo[0].file_id);
                            }
                            else{
                                res(false);
                            }
                        }
                        catch(err){
                            error = err;
                            res("error");
                        }
                    })
                });

                
                if(newData=="error"){
                    throw Error(err);
                }
                else if(newData==false){
                    await bot.sendMessage(chatId,"😞 Edit လုပ်ချင်းမအောင်မြင်ပါ\n\n👍 သက်ဆိုင်ရာ ခလုပ်ကိုနှိပ်ပြီး သက်ဆိုင်သော အရာကို ထည့်ပါ\n\n😂 name ပြောင်းမယ်ဆိုပြီး ပုံပို့နေရင် မရဘူးလေ");
                    res({status:false});
                    return;
                }

                else if(newData=="time_out"){
                    res({status:false});
                    return;
                }


                let allowToEdit = await new Promise((res,rej)=>{
                    let index  =0;
                    setInterval(()=>{
                        if(global.isEditing[chatId]===undefined){
                            res(true);
                        }
                        if(index>60){
                            res(false);
                        }
                        index++;
                    },1000)
                })
                let field;
                let fields = ["name","age","url"];
                field = fields[accessId];
            

                if(allowToEdit){
                    global.isEditing[chatId] = true;
                    let editLimit = await collection.find({chatId}).toArray();
                    editLimit = editLimit[0].editLimit;

                    if(editLimit){
                        editLimit--;
                        let updateInfrom = await collection.updateOne({chatId},{$set:{editLimit:editLimit,[field]:newData}});
                        if(updateInfrom.modifiedCount){
                            await bot.sendMessage(chatId,"✅ Updated successfully!");
                        }
                        else{
                            await bot.sendMessage(chatId,"❌ Fail to change your profile try again later!");
                        }
                        delete global.isEditing[chatId];
                    }
                }
                else{
                    res({status:false});
                    return;
                }

            }

            else{
                await bot.sendMessage(chatId,"🎴 profile change card မရှိပါ။\n\n 👉 profile change card 5 = 5000mmk\n\n ဝယ်ရန် @Ye_lin_tun_x_C");
                res({status:false});
                return;
            }
        }
        catch(err){
            res({status:"error",error:err});
            return;
        }
    })
    
}

module.exports.edit = edit;