async function logError(bot,fs,error,admin){
    try{
        var log = fs.writeFileSync('error.txt',`${error.stack}`);
        await bot.sendDocument(admin,"error.txt");
        return true;
    }
    catch(err){
        console.log(err);
        await bot.sendMessage(admin,"Error while sending log file to you!");
        return false;
    }
    
}

module.exports.logError = logError;