const TelegramBot = require('node-telegram-bot-api');
var request = require('request');
const fs = require('fs');
const download = require('download');

const token = '980219398:AAHbTl6ljSyRk6BikVnF6v2TItYfUYc1suM';

var url = "https://api.telegram.org/bot980219398:AAHbTl6ljSyRk6BikVnF6v2TItYfUYc1suM/getFile?file_id=";
var urlFile = "https://api.telegram.org/file/bot980219398:AAHbTl6ljSyRk6BikVnF6v2TItYfUYc1suM/";

const bot = new TelegramBot(token, {polling: true});

// Maximo de tamaño de 20 megas

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  console.log(msg);

    if(msg.voice != null){
        var newUrl = url + msg.voice.file_id;
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
                    fs.writeFileSync('audio/' + msg.message_id + '.oga', data);
                    bot.sendMessage(chatId, 'audio descargado');
                });

            }
        });
    } else if(msg.photo != null){
        var newUrl = url + msg.photo[2].file_id;
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
                    fs.writeFileSync('foto/' + msg.message_id + '.jpg', data);
                    bot.sendMessage(chatId, 'foto descargada');
                });

            }
        });
    } else if(msg.video != null){
        var newUrl = url + msg.video.file_id;
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
                console.log(fileUrl);
                download(fileUrl).then(data => {
                    fs.writeFileSync('video/' + msg.message_id + '.mp4', data);
                    bot.sendMessage(chatId, 'video descargado');
                });

            }
        });
    }
    
});

