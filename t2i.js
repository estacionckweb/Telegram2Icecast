const TelegramBot = require('node-telegram-bot-api');
var request = require('request');
const fs = require('fs');
const download = require('download');
const { spawn } = require('child_process');
var say = require('say');
var ip = require("ip");
require('./secret');

var url = "https://api.telegram.org/bot" + TOKEN + "/getFile?file_id=";
var urlFile = "https://api.telegram.org/file/bot" + TOKEN + "/";



const bot = new TelegramBot(TOKEN, {polling: true});

var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname))

app.get('/', function(request, response) {
    res.sendFile(__dirname + '/index.html');
})

app.listen(app.get('port'), function() {
  console.log("corriendo en el puerto:" + app.get('port'))
})

// Maximo de tamaño de 20 megas

bot.on('message', (msg) => {
    console.log(msg);
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

    if(msg.voice != null){
        obj.type = 'audio';
        descargaMedia(msg.voice, 'audio', 'oga', 'audio descargado');
    } else if(msg.photo != null){
        obj.type = 'foto';
        descargaMedia(msg.photo, 'foto', 'jpg', 'foto descargada');
    } else if(msg.video != null){
        obj.type = 'video';
        descargaMedia(msg.video, 'video', 'mp4', 'video descargado');
    } else if(msg.document != null){
        descargaDocumento(msg.document, 'documentos', '');
    } else if(msg.text != null){
        obj.type = 'texto';
        obj.file = msg.text;
        fs.writeFileSync( darStringArchivo('texto', 'txt'), msg.text);
        parsedjson.push(obj);
        fs.writeFileSync('datos.json', JSON.stringify(parsedjson));
        bot.sendMessage(chatId, 'mandaste un texto');
        say.speak(msg.text,'voice_el_diphone', (err) => {
            console.log(err);
        });
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
                    if(carpeta == 'audio' || carpeta == 'video'){
                        var play = spawn('cvlc', ['--no-video', './' + darStringArchivo(carpeta, ext)]);
                        bot.sendMessage(chatId, 'se fue al streaming en vivo');

                        play.on('exit', (statusCode) => {
                            console.log(statusCode);
                        })
                    }
                    
                    bot.sendMessage(chatId, 'ip local para revisar el historial: ' + ip.address());
                }).catch((err) => {console.log(err)});

            }
        });
    }

    function descargaDocumento(paquete, carpeta, msj_confirmacion){
        var newUrl;
        newUrl = url + paquete.file_id;
        
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
                    fs.writeFileSync(darStringArchivo(carpeta, paquete.file_name), data);
                    bot.sendMessage(chatId, 'ip local para revisar el historial: ' + ip.address() + ':' + app.get('port'));
                }).catch((err) => {console.log(err)}

            }
        });
    }
    
});

