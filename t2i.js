const TelegramBot = require('node-telegram-bot-api');
var request = require('request');
const fs = require('fs');
const download = require('download');
require('./secret');

var url = "https://api.telegram.org/bot" + TOKEN + "/getFile?file_id=";
var urlFile = "https://api.telegram.org/file/bot" + TOKEN + "/";

const bot = new TelegramBot(TOKEN, {polling: true});

// Maximo de tamaño de 20 megas

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  console.log(msg);

    if(msg.voice != null){
        descargaMedia(msg.voice, 'audio', 'oga', 'audio descargado');
    } else if(msg.photo != null){
        descargaMedia(msg.photo, 'foto', 'jpg', 'foto descargada');
    } else if(msg.video != null){
        descargaMedia(msg.video, 'video', 'mp4', 'video descargado');
    } else if(msg.text != null){
        fs.writeFileSync( darStringArchivo('texto', 'txt'), msg.text);
        bot.sendMessage(chatId, 'mandaste un texto');
    }

    function darStringArchivo(carpeta, ext) {
        return carpeta + '/' + msg.from.id + '_' + msg.from.first_name + '_' + msg.date + '_' + msg.message_id + '.' + ext;
    }

    function descargaMedia(paquete, carpeta, ext, msj_confirmacion){
        var newUrl;
        if(carpeta == 'foto') newUrl = url + paquete[2].file_id;
        else newUrl = url + paquete.file_id;

        
        request.get({
            url: newUrl,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err, res, data) => {
            if (err) {
            console.log('Error:', err);
            } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
            } else {
                var fileUrl = urlFile + data.result.file_path;
                download(fileUrl).then(data => {
                    fs.writeFileSync(darStringArchivo(carpeta, ext), data);
                    bot.sendMessage(chatId, msj_confirmacion);
                });

            }
        });
    }
    
});

