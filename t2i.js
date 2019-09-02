const TelegramBot = require('node-telegram-bot-api');
var request = require('request');
const fs = require('fs');
const download = require('download');
const { spawn } = require('child_process');
require('./secret');

var url = "https://api.telegram.org/bot" + TOKEN + "/getFile?file_id=";
var urlFile = "https://api.telegram.org/file/bot" + TOKEN + "/";



const bot = new TelegramBot(TOKEN, {polling: true});

// Maximo de tamaño de 20 megas

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  let rawjson = fs.readFileSync('datos.json');
  let parsedjson = JSON.parse(rawjson);
  let obj = {
    message_id: msg.message_id,
    from_id: msg.from.id,
    from_name: msg.from.first_name + ' ' + msg.from.last_name,
    date: msg.date,
    type: '',
    file: ''
  };

//   console.log(msg);

    if(msg.voice != null){
        obj.type = 'audio';
        descargaMedia(msg.voice, 'audio', 'oga', 'audio descargado');
    } else if(msg.photo != null){
        obj.type = 'foto';
        descargaMedia(msg.photo, 'foto', 'jpg', 'foto descargada');
    } else if(msg.video != null){
        obj.type = 'video';
        descargaMedia(msg.video, 'video', 'mp4', 'video descargado');
    } else if(msg.text != null){
        obj.type = 'texto';
        obj.file = msg.text;
        fs.writeFileSync( darStringArchivo('texto', 'txt'), msg.text);
        parsedjson.push(obj);
        fs.writeFileSync('datos.json', JSON.stringify(parsedjson));
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
                    obj.file = darStringArchivo(carpeta, ext);

                    parsedjson.push(obj);
                    fs.writeFileSync('datos.json', JSON.stringify(parsedjson));
                    var ffmpeg = spawn('ffmpeg', ['-i', './' + darStringArchivo(carpeta, ext), './archivo.mp3']);
                    ffmpeg.on('exit', (statusCode) => {
                        if(statusCode === 0) {
                            bot.sendMessage(chatId, 'archivo convertido a wav');

                            // var stream = spawn('oggenc', ['-', '<', 'archivo.wav', '|', 'oggfwd', '88.99.123.96', '8000', 'n0alinea2', '/ckweb.ogg']);
                            var stream = spawn('ffmpeg', ['-f', 'archivo.wav', 'icecast://source:n0alinea2@88.99.123.96:8000/nestorin']);

                            stream.on('exit', (statusCode) => {
                                // var remove = spawn('rm', ['archivo.wav']);
                                console.log(statusCode);
                            })
                            // var remove = spawn('rm', ['archivo.wav']);
                            // var stream = 
                        }
                    });
                    bot.sendMessage(chatId, msj_confirmacion);
                });

            }
        });
    }
    
});

