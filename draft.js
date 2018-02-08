 var cardDecks = [];

function createPlayerCards(){  // рандомайзер делает рандомные существа(объекты) с уроном и защитой от 0 до 50
    for(i=0; i<5; i++){
        var rand = {damage: parseInt(Math.random()*50), armor: parseInt(Math.random()*50)};
        cardDecks.push(rand);
    }
    return cardDecks;
}
console.log(createPlayerCards());

debugger;
//////////////////////////////////fight//////////////

function fightParam(){
	for(j=0;j<5;j++){
    for(let value of cardDecks){
        console.log(sum)
        var sum = value.damage + value.armor; 
    }
}
}

fightParam();