var offers   = {};
var channels = [];

exports.clientOffersAdd = function(identKey, response) {
	offers[identKey] = response;
}

exports.submitOffer = function(data, response) {
	var clientNick = data.nick;
	var clientKey  = data.pk;
	var oppKey     = data.anotherPk;
	if (offers[oppKey]) {
		offers[oppKey].end(JSON.stringify({'opponent' : clientNick, 'oppKey' : clientKey}));
		response.end(JSON.stringify({'status' : 'ok', 'oppKey' : oppKey}));
		channels.push(new GameChannel(oppKey, clientKey));
		delete offers[oppKey];
		delete offers[clientKey];
	}
	else {
		response.end(JSON.stringify({'status' : 'bed'}));
	}

}

exports.doMove = function(data, response) {
	channels.forEach(chan => {
		
		if (chan[data.pk] && chan[data.oppKey]) {
			chan[data.pk].response = response;
			chan.step(data);
			
		}
	})
}


function GameChannel(firstId, secondId) {
	this[firstId]  = { 'pk': secondId };
	this[secondId] = { 'pk': firstId };
	this.isStart   = true;
	this.step = function(data) {
		if (this[firstId].response && this[secondId].response) {
			this[data.oppKey].response.end(JSON.stringify(data))
			}
		}
	}

