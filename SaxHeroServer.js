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

var io = socket(server);
var client = io.of('/client');

var saxio = socket(saxPlayer);
var saxUser = saxio.of('/saxUser');



var serverStatus = 0;

var oscServer = new osc.Server(connectSettings.maxSendPort, connectSettings.hostIP);
var oscClient = new osc.Client(connectSettings.hostIP, connectSettings.maxListenPort);

var userIDs = [];
var numUsers;

//track the user ids for sax players who have joined and ID'd themselves.
//Soprano = 0, Alto = 1, Tenor = 2, Bari = 3.

var saxIDs = [-2, -2, -2, -2]; //-1 indicates no assignment yet

//run at startup:
console.clear();
serverStatus = 1;
console.log('Sax Hero Server Running:' + '\n' + connectSettings.hostIP + ':' + connectSettings.expressPort);

//Max should be started already. Tell Max the server is running - 200 ms after server starts.
setTimeout(function () {
    oscClient.send('/serverStatus', serverStatus);
}, 200);

//Tell Max the server is no longer running.
process.on('SIGINT', closeServer);

function closeServer(){
    serverStatus = 0;
    oscClient.send('/serverStatus', serverStatus);
    setTimeout(function(){
        process.exit(0);
    },100);
}

//LOOK: OSC Listeners from Max - control the server from the Max app.

oscServer.on('/reset', function (msg){
//reset the game! Kick everyone off.
});

//the performer triggers "CHOOSE PLAYER!" to appear on the screen

oscServer.on('/choosePlayer', function(msg){
    console.log(msg);
});

oscServer.on('/hi', function(msg){
    client.emit('hi');
});

//LOOK: Websocket Connections

client.on('connection', onConnect);
saxUser.on('connection', onSaxPlayerConnect);

function onSaxPlayerConnect(socket){
    socket.on('myVoice', function(msg){
        if (msg == 'soprano'){
            saxIDs[0] = socket.id;
        }
        if (msg == 'alto'){
            saxIDs[1] = socket.id;
        }
        if (msg == 'tenor'){
            saxIDs[2] = socket.id;
        }
        if (msg == 'bari'){
            saxIDs[3] = socket.id;
        }
    oscClient.send('/saxIDs',saxIDs);

    });

    socket.on('disconnect', function(){
        if (saxIDs.indexOf(socket.id) !== -1) {
            let removePlayer = saxIDs.indexOf(socket.id);
            saxIDs[removePlayer] = -2;
            oscClient.send('/saxIDs',saxIDs);
        }
    });
}

function onConnect(socket){
    //user must be initialized through their first tap on the screen 
    //socket.on('initializeMe', function (msg){
        userIDs.push(socket.id);
        numUsers = userIDs.length;
        console.log('number of users: ' + numUsers);
        oscClient.send('/numUsers', numUsers);
    //});

    socket.on('disconnect', function () {
        if (userIDs.indexOf(socket.id) !== -1) {
            userIDs.splice(userIDs.indexOf(socket.id), 1);
        }
        numUsers = userIDs.length;
        console.log('number of users: ' + numUsers);
        oscClient.send('/numberofUsers', numUsers);
});
    //FIXME: If people disconnect intentionally or not, are they "out of the game"? How does the system compensate?

}