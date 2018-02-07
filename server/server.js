http = require('http');
var f = require('./subscribe')
var history = [];
var errorMessages = {
   "0": "All fine",
   "-1": "No space left in DB",
   "-2": "Wrong data",
   "-3": "Apocalypse",
   "-4": "REALLY Wrong data",
};
var RPCFuncs = {
    getMessages: function(data){
        var messageId = +data.messageId;
        return history.slice(messageId);
    },
    addMessage:  function(data){
        data.message = findScripts(data.message);
        history.push(data);
    },
    allowFight: function(data, response){
       f.clientOffersAdd(data.pk, response);
    },
    submitFight: function(data, response){
        f.submitOffer(data, response);
    },
    startFight: function(data, response) {
        f.doMove(data, response);
    }
};
server = http.createServer(function(req, res){
    if (req.method == "POST"){
        var body = '';
        req.on('data', function (data) {
                body += data;
        });
        req.on('end', function () {
                try{
                    var data = JSON.parse(body);
                }
                catch (e){
                    console.log("wrong JSON");
                    var errorCode = -4;
                    res.end(JSON.stringify({errorCode: errorCode, errorMessage: errorMessages[errorCode]}));
                    return;
                }
                var timestamp =(new Date()).getTime(); 
                //var errorCode = 0 - Math.floor(Math.random()*4)
                //res.end(JSON.stringify({errorCode: errorCode, errorMessage: errorMessages[errorCode]}));
                try {
                    if ("func" in data || 'action' in data){
                        if (data.func in RPCFuncs || data.action in RPCFuncs){
                            var func = data.func;
                            delete data.func;
                            data.timestamp = timestamp;

                            if('action' in data) {
                                RPCFuncs[data.action](data, res);
                            }
                          
                            var result = {data: RPCFuncs[func](data), nextMessageId: history.length};
                            if (! ('action' in data))
                                res.end(JSON.stringify(result));
                            

                          
                           
                        }
                        else {
                            console.log("no func in functions array" + body);
                        }
                    }
                    else {
                        console.log("no func key in data:" + body);
                    }
            } catch (e) {}
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.writeHead(200, {'Content-Type': 'text/json'});
       
    }
});
port = 8070;
host = 'localhost'
// host = '164.138.30.21';
server.listen(port, host);
console.log("Listen...");


 String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
    }


    function findScripts(str) {
        str = str.replaceAll('script>', '||антискрипт детектед??!!!');
        return str;
    }

