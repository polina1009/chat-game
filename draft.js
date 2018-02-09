debugger;

var cardDecks = [];
var sumParam = [];

function createPlayerCards(){  // рандомайзер делает рандомные существа(объекты) с уроном и защитой от 0 до 50
    for(var i=0; i<5; i++){
        var rand = {damage: parseInt(Math.random()*50), armor: parseInt(Math.random()*50)};
        cardDecks.push(rand);
    }
    return cardDecks;
}
console.log(createPlayerCards());

function fightParam(){                           // создаем общий параметр для сражения 

    for( key in cardDecks){
        // console.log(cardDecks[key].damage, cardDecks[key].armor)
        var sum = cardDecks[key].damage + cardDecks[key].armor; 
        sumParam.push(sum);
        // console.log(sumParam)
    }
    return sumParam;
}




//////////////////////////////////fight//////////////

function qwe(){
	var data ={};

	data.fight = fightParam();
	console.log(data)
}

qwe();