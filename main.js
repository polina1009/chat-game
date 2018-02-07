
var smiles = {
    ':)'  :  'http://www.kolobok.us/smiles/big_standart/biggrin.gif',
    ':*'  :  'http://www.kolobok.us/smiles/he_and_she/kiss2.gif'
}
var url = 'http://chat.apples.fe.a-level.com.ua:8070';
// var url      = "http://students.a-level.com.ua:10012";
var ipUrl    = "https://api.ipify.org?format=json";
var messages = [];

function jsonPost(url, data, method)
{
    return new Promise((resolve, reject) => {
        var x = new XMLHttpRequest();

        x.onerror = () => reject(new Error('jsonPost failed'))
        x.open(method || "POST", url, true);
        x.send(JSON.stringify(data))

        x.onreadystatechange = () => {
            if (x.readyState == XMLHttpRequest.DONE && x.status == 200){
                resolve(JSON.parse(x.responseText))
            }
            else if (x.status != 200){
                reject(new Error('status is not 200'))
            }
        }
    })
}

function addMessage(message, chatField) {
    var messageItem = document.createElement('li');
    messageItem.classList.add('message');
    messageItem.innerHTML = `>> ${message.nick} :  ${findMedia(message.message)}`;
    chatField.appendChild(messageItem);
}

function sendMessage(ev) {
    ev.preventDefault();
    var func    = 'addMessage';
    var nick    = this.nick.value;
    var message = this.message.value;
    jsonPost(url, {'func':'addMessage', 'nick': nick, 'message': message}, "POST")

}

function findMedia(message) {
    for (var smile in smiles)
        message = message.replaceAll(smile, `<img src="${smiles[smile]}">`)
    return message;
}

var interval = setInterval(() => {
    jsonPost(url, {'func' :'getMessages', 'messageId': messages.length}, "POST")
        .then((res) => {
            res.data.forEach(item => {
                addMessage(item, document.getElementsByClassName('messages')[0])
                messages.push(item);
            })

        })
}, 1000)

function allowFight() {
    if (!localStorage['state']) {
        var data = {};
        data.pk      = generateUUID();
        data.func    = 'addMessage';
        data.action  = 'allowFight';
        data.nick    = this.parentNode.nick.value;
        data.message = `<button data-pk="${generateUUID()}" class="sbm_ft btn btn-success">
                    Принять бой от ${this.parentNode.nick.value}</button>`;
        jsonPost(url, data).
        then((data) => {
            startGame(document.getElementsByClassName('game_field')[0])
            alert('Ваш вызов принял ' + data.opponent )});

    }
}

document.getElementById('publish').addEventListener('submit', sendMessage)

document.getElementsByClassName('btn-ft')[0].addEventListener('click', allowFight)

document.body.onclick = function(ev) {
    var target = ev.target;
    if (target.classList.contains('sbm_ft') /*&& target.dataset.pk != generateUUID()*/) {

        /* После снятия комментария в блоке if пропадет возможность принимать вызовы у самого себя в одном окне браузера*/

        var data = {};
        data.pk           = generateUUID();
        data.anotherPk    = target.dataset.pk;
        data.action       = 'submitFight';
        data.nick         = document.getElementsByName('nick')[0].value;
        jsonPost(url, data)
            .then((data) => {
                if (data.status == 'bed') {
                    alert('Ваш соперник уже принимает участие в игре');
                }
                else
                    alert('Готовьтесь к игре');
                startGame(document.getElementsByClassName('game_field')[0])
            })
    }
}



function generateUUID () {
    var uuid = null;
    if (! localStorage['uuid']) {
        uuid = s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        localStorage['uuid'] = uuid;
        return uuid;
    }
    return localStorage['uuid'];
}
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function startGame(field) {
    field.classList.remove('invisible');
}

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}