
var users = {},
games = {},
game_data = {};
exports.init = function(userio,socket){
	var io = userio,
	usersocket = socket;
	

	//when a user hosts a game
	usersocket.on('host_game' , function(callback){
		createGame(usersocket);
		console.log('calling back');
		callback(true , usersocket.game_id);		

	});

	// when a player joins a  game
	usersocket.on('player_joined' , function(data , callback){
		console.log(data.game_id);
		if (data.game_id in games) {
			
			
			if(!games[data.game_id].room_full){ //check if the room is full
			createUser(usersocket , data.game_id , false , true);
			addUserToGame(usersocket,data.game_id ,data.username);

			}
			else{
				callback('Room Full');
			}
			
			console.log(users);
		}
		else{
			callback('Game Not Found');
		}

	});

	usersocket.on('display_games' , function(){
			console.log(games);
		});
	usersocket.on('display_users' , function(){
			console.log(users);
		});


	//when a user disconnects 
	usersocket.on('disconnect' , function(){
		console.log('user disconnected....');

		if(!usersocket.game_id){ //if the user did not join or host a game
			return;
		}
		else
		{
			if(usersocket.host){ //if the user is a host
				io.sockets.in(usersocket.game_id).emit('host disconnected');

				emptyGame(usersocket);
				delete games[usersocket.game_id];
				delete users[usersocket.id];
			}
			else if(usersocket.player){

				io.sockets.in(usersocket.game_id).emit('player disconnected');

				emptyGame(usersocket);
				delete users[usersocket.id];
			}
			
				
			
			
		}
		console.log(users);
	});
	
function emptyGame(usersocket){
	game_id = usersocket.game_id;
	if(games[usersocket.game_id]){
	
				if(games[game_id].player2.socket)
				{
					games[game_id].player2.socket.leave(game_id);
					
				}
				if(games[game_id].player1.socket){
					games[game_id].player1.socket.leave(game_id);
					
			}

			games[game_id].player1.username = "";
				games[game_id].player2.username = "";
				games[game_id].player1.socket = "";
				games[game_id].player2.socket = "";
				games[game_id].playercount = 0;
				games[game_id].room_full = false;
	}

}
function addUserToGame(usersocket,game_id , name){
if(games[game_id].playercount == 0){
	games[game_id].player1.socket = usersocket;
	games[game_id].player1.username = name; 
	games[game_id].playercount++;
	usersocket.game_id = game_id;
	usersocket.player1 = true;
	usersocket.join(game_id);
}
else if(games[game_id].playercount == 1) {
	games[game_id].player2.socket = usersocket;
	games[game_id].player2.username = name;
	games[game_id].playercount++;
	games[game_id].room_full = true;
	usersocket.game_id = game_id;
	usersocket.player2 = true;
	usersocket.join(game_id);	
startGame(game_id);
}


}

function startGame(game_id){
makeGameData(game_id);
io.sockets.in(game_id).emit('host_game');
console.log(game_id + ' : Game Started');
setTimeout(function(){
	sendWord(game_id);
},5000);


}
function makeGameData(game_id){
	game_data[game_id] = {
		player1_score :"",
		player2_score : "",
		round_no :  1
	}
}
function update_game_data(){
	game_data[game_id].player1_score = 0;
	game_data[game_id].player2_score =0;
	game_data[game_id].round_no = 0;
}
function sendWord(game_id){
	
	round_no = game_data[game_id].round_no;
	if(round_no <= wordPool.length){
 	var word = getWord(wordPool[round_no-1]);
 	console.log(word);
 	games[game_id].host_socket.emit('host_word' , word);
 	io.sockets.in(game_id).emit('get_word' , word);

 	}
 	else
 	{
 		


 	}

}

function getWord(array){
	
	var word_array = shuffle(array.words);
	 decoys_array = shuffle(array.decoys),
	 index = Math.floor(Math.random() * 5);
	word = word_array[0];

	decoys_array.splice(index , 0 , word_array[1]);
	var word_send = {
		host_word : word,
		correct_word : decoys_array[index],
		decoys_array : decoys_array
	}
return word_send;


}

function createGame(usersocket){
	
	var game_id = getGameId();
		games[game_id] = {
			player1 : {
				username : "",
				socket : ""
			},

			player2 : {
				username : "",
				socket :""
			},
			playercount : 0,
			room_full : false,
			host_socket : usersocket
		}
	

		
		createUser(usersocket , game_id , true  , false);


}
function createUser(usersocket,game_id , var_host , var_player){
	users[usersocket.id] = {
		game_id : game_id, 
		host : var_host ,
		player : var_player  
	}
	usersocket.game_id = game_id;
	usersocket.host = var_host;
	usersocket.player = var_player;
}

function getGameId(){
	var id = Math.floor( Math.random() * 100000 );
	
	if(id in games){
		
		getGameId();
	
	}
	else
	{
		return id;

	}
}
function shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

   
    while (0 !== currentIndex) {

        
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}



}

var wordPool = [
    {
        "words"  : [ "sale","seal","ales","leas" ],
        "decoys" : [ "lead","lamp","seed","eels","lean","cels","lyse"]
    },

    {
        "words"  : [ "item","time","mite","emit" ],
        "decoys" : [ "neat","team","omit","tame","mate","idem","mile"]
    },

    {
        "words"  : [ "spat","past","pats","taps" ],
        "decoys" : [ "pots","laps","step","lets","pint","atop","tapa"]
    },

    {
        "words"  : [ "nest","sent","nets","tens" ],
        "decoys" : [ "tend","went","lent","teen","neat","ante","tone" ]
    },

    {
        "words"  : [ "pale","leap","plea","peal" ],
        "decoys" : [ "sale","pail","play","lips","slip","pile","pleb"]
    },

    {
        "words"  : [ "races","cares","scare","acres" ],
        "decoys" : [ "crass","scary","seeds","score","screw","cager","clear", ]
    },

    {
        "words"  : [ "bowel","elbow","below","beowl" ],
        "decoys" : [ "bowed","bower","robed","probe","roble","bowls","blows" ]
    },

    {
        "words"  : [ "dates","stead","sated","adset" ],
        "decoys" : [ "seats","diety","seeds","today","sited","dotes","tides"]
    },

    {
        "words"  : [ "spear","parse","reaps","pares" ],
        "decoys" : [ "ramps","tarps","strep","spore","repos","peris","strap"]
    },

    {
        "words"  : [ "stone","tones","steno","onset" ],
        "decoys" : [ "snout","tongs","stent","tense","terns","santo","stony"]
    }
]