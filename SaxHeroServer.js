//Saxophone Hero Server - 2024//

//import modules
var fs = require('fs');
var express = require('express');
var osc = require('node-osc');
var socket = require('socket.io');

//initialize connection settings
var connectSettings = JSON.parse(fs.readFileSync('connectSettings.json'));

//set up server/ports
var app = express();
app.use(express.static('public'));

var saxApp = express();
saxApp.use(express.static('saxScores'));

var server = app.listen(connectSettings.expressPort);

//sax players connect on separate port
var saxPlayer = saxApp.listen(connectSettings.saxPlayerPort);

//set up WebSockets
var io = socket(server);
var client = io.of('/client');

var saxio = socket(saxPlayer);
var saxUser = saxio.of('/saxUser');

var serverStatus = 0; //initialize server
var choosePlayerFlag = 0; //toggle this after the player choice has been initiated but before the game starts

var oscServer = new osc.Server(connectSettings.maxSendPort, connectSettings.hostIP);
var oscClient = new osc.Client(connectSettings.hostIP, connectSettings.maxListenPort);

//all audience players connected
var userIDs = [];
var numUsers;

//audience players sorted into different groups
var sopranoIDs = [];
var altoIDs = [];
var tenorIDs = [];
var bariIDs = [];

//let's try doing this in a single JS object.

let teamIDs = {
    "soprano": [],
    "alto": [],
    "tenor": [],
    "bari": []
}

let teamLevels = {
    "soprano": -1,
    "alto": -1,
    "tenor": -1,
    "bari": -1
}

//track the user ids for sax players who have joined and ID'd themselves.
//Soprano = 0, Alto = 1, Tenor = 2, Bari = 3.

var saxIDs = [-2, -2, -2, -2]; //-1 indicates no assignment yet

//run at startup:
console.clear();
serverStatus = 1;
console.log('Sax Hero Server Running:' + '\n' + 'Audience URL: ' + connectSettings.hostIP + ':' + connectSettings.expressPort);
console.log('Player URL: ' + connectSettings.hostIP + ':' + connectSettings.saxPlayerPort);

//Max should be started already. Tell Max the server is running - 200 ms after server starts.
setTimeout(function () {
    oscClient.send('/serverStatus', serverStatus);
}, 200);

//Tell Max the server is no longer running.
process.on('SIGINT', closeServer);

function closeServer() {
    serverStatus = 0;
    oscClient.send('/serverStatus', serverStatus);
    setTimeout(function () {
        process.exit(0);
    }, 100);
}

//LOOK: OSC Listeners from Max - control the server from the Max app.

// oscServer.on('/reset', function (msg) {
//     //reset the game! Kick everyone off.
// });

//the performer triggers "CHOOSE PLAYER!" to appear on the screen
oscServer.on('/ping', function (msg){
    //console.log(msg[2]);
    //console.log(Date.now()-msg[2]);
    client.emit('ping', msg[1]-Date.now());
});
oscServer.on('/choosePlayer', function (msg) {
    choosePlayerFlag = 1; //new players joining will immediately get the choose player buttons
    client.emit('choosePlayer', choosePlayerFlag);
});

// oscServer.on('/level', function (msg) {
//     client.emit('level', msg);
// });

oscServer.on('/level', function (msg) {
    let teamLevels = JSON.parse(msg[1]); //turn the levels into a JSON object
    if (choosePlayerFlag == 1) { //only attempt to send messages if players have been told to join teams
        updateLevelsAndNotify(teamLevels);
    }

    for (let i = 0; i < saxIDs.length; i++) {
        saxUser.to(saxIDs[i]).emit('changeLevel', msg[i + 1]);//+1 because the first part of msg is address
    }
});

function updateLevelsAndNotify(newLevels){
    for (let team in newLevels){
        if (teamLevels.hasOwnProperty(team)){
            teamLevels[team] = newLevels[team];
            sendLevelUpdateToTeam(team);
        }
    }
}
function sendLevelUpdateToTeam(team){
    if (teamLevels.hasOwnProperty(team)){
        let level = teamLevels[team];
        teamIDs[team].forEach(userID =>{
            client.to(userID).emit('level', level);
        });
    }
}

oscServer.on('/transportState', function (msg) {
    let transportState = msg[1]
    saxUser.emit('transportState', transportState);
    client.emit('transportState', transportState);
});

oscServer.on('/hi', function (msg) {
    client.emit('hi');
});


//LOOK: Websocket Connections

client.on('connection', onConnect);
saxUser.on('connection', onSaxPlayerConnect);

function onSaxPlayerConnect(socket) {
    socket.on('myVoice', function (msg) {
        if (msg == 'soprano') {
            saxIDs[0] = socket.id;
        }
        if (msg == 'alto') {
            saxIDs[1] = socket.id;
        }
        if (msg == 'tenor') {
            saxIDs[2] = socket.id;
        }
        if (msg == 'bari') {
            saxIDs[3] = socket.id;
        }
        oscClient.send('/saxIDs', saxIDs);

    });
    socket.on('sentTime', function (msg) {
        const serverTime = Date.now();
        const { sentTime } = JSON.parse(msg);
        const latency = serverTime - sentTime;
        console.log(latency);
        saxUser.to(socket.id).emit('latency', latency);
    });

    socket.on('disconnect', function () {
        if (saxIDs.indexOf(socket.id) !== -1) {
            let removePlayer = saxIDs.indexOf(socket.id);
            saxIDs[removePlayer] = -2;
            oscClient.send('/saxIDs', saxIDs);
        }
    });
}

function onConnect(socket) {
    //user must be initialized through their first tap on the screen 
    socket.on('initializeMe', function (msg) {
        userIDs.push(socket.id);
        numUsers = userIDs.length;
        console.log('number of users: ' + numUsers);
        oscClient.send('/numUsers', numUsers);
        client.to(socket.id).emit('choosePlayer', choosePlayerFlag); //if the choose players button already triggered, bring up selection screen
    });
    socket.on('myTeam', function (msg) {
        let team = msg;
        teamIDs[team].push(socket.id);
        oscClient.send('/teamIDs', JSON.stringify(teamIDs));
        client.to(socket.id).emit('level', teamLevels[team]); //send the current level of that team to them
    });
    socket.on('disconnect', function () {
        if (userIDs.indexOf(socket.id) !== -1) {
            userIDs.splice(userIDs.indexOf(socket.id), 1);
        }
        numUsers = userIDs.length;
        for (let key in teamIDs) {
            let index = teamIDs[key].indexOf(socket.id);
            if (index !== -1) {
                teamIDs[key].splice(index, 1);
                break; //assuming each user can only be in one team
            }
        }
        oscClient.send('/teamIDs', JSON.stringify(teamIDs));
        console.log('number of users: ' + numUsers);
        oscClient.send('/numberofUsers', numUsers);
    });
    //TODO: If people disconnect intentionally or not, are they "out of the game"? How does the system compensate?

}