
var smiles = {
    ':)'  :  'http://www.kolobok.us/smiles/big_standart/biggrin.gif',
    ':*'  :  'http://www.kolobok.us/smiles/he_and_she/kiss2.gif'
}
// var url = 'http://localhost:8070';
var url = 'http://chat.apples.fe.a-level.com.ua:8070';
// var url      = "http://students.a-level.com.ua:10012";

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
                addMessage(item, document.getElementsByClassName('messages')[0]);
                messages.push(item);
            })

        })
}, 5000);

function allowFight() {
   /* if (playerInGame() != 'true') {*/
        var data = {};
        data.pk      = generateUUID();
        data.func    = 'addMessage';
        data.action  = 'allowFight';
        data.nick    = this.parentNode.nick.value;
        data.message = `<button data-pk="${generateUUID()}" class="sbm_ft btn btn-success">
                    Принять бой от ${this.parentNode.nick.value}</button>`;
        jsonPost(url, data).
        then((data) => {
            startGame(document.getElementsByClassName('game_field')[0]);
            alert('Ваш вызов принял ' + data.opponent );
            return data.oppKey})
            .then((key) => setDataAttr('opposer', doMove(key), document.getElementsByClassName('cont-game')[0]))
            .then(() => playerInGame(true))
            .then(init)

   /* }*/
}



document.getElementById('publish').addEventListener('submit', sendMessage);

document.getElementsByClassName('btn-ft')[0].addEventListener('click', allowFight);

document.body.onclick = function(ev) {
    var target = ev.target;
    if (target.classList.contains('sbm_ft') && target.dataset.pk != generateUUID()) {

        playerInGame(true);
        var data = {};
        data.pk           = generateUUID();
        data.anotherPk    = target.dataset.pk;
        data.action       = 'submitFight';
        data.nick         = document.getElementsByName('nick')[0].value;
        jsonPost(url, data)
            .then((data) => {
                if (data.status == 'bed') {
                    console.log('##### Ваш соперник уже принимает участие в игре');
                }
                else {
                    alert('Готовьтесь к игре');
                    startGame(document.getElementsByClassName('game_field')[0]);
                    setDataAttr('opposer', doMove(data.oppKey),document.getElementsByClassName('cont-game')[0]);
                    init();

                }
            })
    }
    if (target.closest('.card')) {
        var card = target.closest('.card');
        var oppKey = document.getElementsByClassName('cont-game')[0].dataset.opposer;
        var data = {};
        data.cardContent = card.textContent.replaceAll(/\b\s+\b/,' ')
        doMove(oppKey, data);
        card.style.background = '#8282f1';

        // Cюда добавлять анимацию и остальное для клика карте

    }
    if ( target.dataset.pk == generateUUID() ) { alert("Вы пытаетесь сыграть с собой")};
};



function doRotate(element) {
    element.classList.add('rotate');
    setTimeout(() => {
        element.children[0].style.visibility = "visible"
    }, 500);
}

function init() {
    createPlayerCards();
    rotateAllPlayerCards();
}


function createPlayerCards(){  // рандомайзер делает рандомные существа(объекты) с уроном и защитой от 0 до 50
    var cardDecks = [];
    for(var i=0; i<5; i++){
        var rand = {damage: parseInt(Math.random()*50), armor: parseInt(Math.random()*50)};
        cardDecks.push(rand);
    }
    // return cardDecks;
    cardDecks.forEach(card => {

        // Тут добавить аттрибуты для карты

        var cardHTML = `
                <div class="card" id="card-1">
                    <div class="card-content">
                        <b>damage = </b>${card.damage} <br />
                        <b>armor = </b>${card.armor}
                    </div>
                </div>
            `;
        document.getElementById('player-cards').innerHTML += cardHTML;
    });

}






function rotateAllPlayerCards() {
    var cards = document.getElementById('player-cards').children;
    var delay = 200;

    Array.prototype.forEach.call(cards, function(el) {
        setTimeout(function() {
            doRotate(el);
        }, delay);
        delay += 200;
    });
}


function doMove(oppKey, data={}) {

        data.action = 'startFight';
        data.pk = generateUUID();
        data.oppKey = oppKey;


    jsonPost(url, data)
        .then(res => {

            console.log(res)
            /*   Тут принимаем обьект ответа и обрабатываем его. Открываем доступ к полям для управления и тд
               doMove требуется навесить еще на какой то обработчик собития  */
        })
        .catch((error) => {
            console.error(error);
        });
    return oppKey;
}

function playerInGame(isTrue) {
    if (!arguments.length) {
        return localStorage['inGame'];
    }
    localStorage['inGame'] = isTrue.toString()
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

function setDataAttr(attr, val, node) {
    node.dataset[attr] = val
}

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};





