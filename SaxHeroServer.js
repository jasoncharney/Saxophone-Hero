//Saxophone Hero Server - 2024//

//import modules
var fs = require('fs');
var express = require('express');
var osc = require('node-osc');
var socket = require('socket.io');

//initialize connection settings
var connectSettings = JSON.parse(fs.readFileSync('connectSettings.json'));

//set up server/ports. Separate for sax app and audience member app.
var app = express();
app.use(express.static('public'));

var saxApp = express();
saxApp.use(express.static('saxScores'));

//change the IP addresses/ports in the JSON file (Max also reads this file)
var server = app.listen(connectSettings.expressPort);
var saxPlayer = saxApp.listen(connectSettings.saxPlayerPort);

//set up WebSockets
var io = socket(server);
var client = io.of('/client');

var saxio = socket(saxPlayer);
var saxUser = saxio.of('/saxUser');

var serverStatus = 0; //initialize server
var choosePlayerFlag = 0; //toggle this after the player choice has been initiated but before the game starts

//set up OSC channels
var oscServer = new osc.Server(connectSettings.maxSendPort, connectSettings.hostIP);
var oscClient = new osc.Client(connectSettings.hostIP, connectSettings.maxListenPort);

//all audience players connected (regardless of group sorting)
var userIDs = [];
var numUsers;

//empty arrays for each group of audience members

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

let teamAccuracies = {
    "soprano": {},
    "alto": {},
    "tenor": {},
    "bari": {}
}

//track the user ids for sax players who have joined and ID'd themselves.
var saxIDs = {
    "soprano": 0,
    "alto": 0,
    "tenor": 0,
    "bari": 0
}

LOOK: //run at startup:
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

function clientPing(serverTime) {
    //pass the latency of the Max server to 
    client.emit('ping', serverTime);
}

oscServer.on('/ping', function (msg) {
    let receivedTime = parseInt(msg[1]);
    clientPing(receivedTime);
});

oscServer.on('/choosePlayer', function (msg) {
    choosePlayerFlag = 1; //new players joining will immediately get the choose player buttons
    client.emit('choosePlayer', choosePlayerFlag);
});


oscServer.on('/level', function (msg) {
    let teamLevels = JSON.parse(msg[1]); //turn the levels into a JSON object
    if (choosePlayerFlag == 1) { //only attempt to send messages if players have been told to join teams
        updateLevelsAndNotify(teamLevels);
    }
});

//send arrays of accuracies to Max

function updateAccuracies(team, id, newAccuracy) {
    if (teamAccuracies[team]) {
        teamAccuracies[team][id] = newAccuracy;
    }
}

function sendAccuracies() {
    //console.log(teamAccuracies);
    //console.log(calculateAverageAccuracies()); TODO: figure this out so it's calculated in the server and not in Max
    oscClient.send('/accuracies', JSON.stringify(teamAccuracies));
}

function updateLevelsAndNotify(newLevels) {
    for (let team in newLevels) {
        if (teamLevels.hasOwnProperty(team)) {
            teamLevels[team] = newLevels[team];
            sendLevelUpdateToTeam(team);
        }
    }
}

function sendLevelUpdateToTeam(team) {
    if (teamLevels.hasOwnProperty(team)) {
        let level = teamLevels[team];
        teamIDs[team].forEach(userID => {
            client.to(userID).emit('level', level);
        });
        let saxPlayer = saxIDs[team];
        if (saxPlayer) {
            saxUser.to(saxPlayer).emit('level', level);
        }
    }
}

//LOOK: transport state change schedules in the future!
oscServer.on('/transportState', function (msg) {
    let transportState = ([msg[1], msg[2]]);
    saxUser.emit('transportState', transportState);
    client.emit('transportState', transportState);
    //send the list of accuracies every 16 seconds
    if (transportState[0] == 1) {
        setTimeout(function () { setInterval(sendAccuracies, 16000) }, 16000);
    }
    if (transportState[0] == 0) {
        clearInterval(sendAccuracies);
    }
});

oscServer.on('/beat', function (msg) {
    let barbeat = [msg[1], msg[2]];
    saxUser.emit('beat', barbeat);
    client.emit('beat', barbeat);
});
//from Max's transport, send out the loopreset when the loop goes around to 
oscServer.on('/loopReset', function (msg) {
    client.emit('loopReset');
});

oscServer.on('/testSchedule', function (msg) {
    let scheduleTime = parseInt(msg[1]);
    console.log(msg[1]);
    client.emit('test', scheduleTime);
});
//LOOK: Websocket Connections

client.on('connection', onConnect);
saxUser.on('connection', onSaxPlayerConnect);

function onSaxPlayerConnect(socket) {
    socket.on('myVoice', function (msg) {
        saxIDs[msg] = socket.id;
        oscClient.send('/saxIDs', JSON.stringify(saxIDs));
    });

    socket.on('sentTime', function (msg) {
        const serverTime = Date.now();
        const { sentTime } = JSON.parse(msg);
        const latency = serverTime - sentTime;
        console.log(latency);
        saxUser.to(socket.id).emit('latency', latency);
    });

    socket.on('disconnect', function () {
        for (let key in saxIDs) {
            ;
            if (saxIDs[key] == socket.id) {
                saxIDs[key] = 0;
            }
        }
        oscClient.send('/saxIDs', JSON.stringify(saxIDs));
    });
}

function onConnect(socket) {
    //user must be initialized through pressing the button on their startup screen.
    socket.on('initializeMe', function (msg) {
        userIDs.push(socket.id);
        numUsers = userIDs.length;
        console.log('number of users: ' + numUsers);
        oscClient.send('/numUsers', numUsers);
        client.to(socket.id).emit('choosePlayer', choosePlayerFlag); //if the choose players event already triggered, bring up selection screen right away
    });

    socket.on('myTeam', function (msg) {
        let team = msg;
        teamIDs[team].push(socket.id);
        oscClient.send('/teamIDs', JSON.stringify(teamIDs));
        client.to(socket.id).emit('level', teamLevels[team]); //send the current level of that team to them
    });

    socket.on('accuracy', function (msg) {
        if (msg[1]) { //only add if there's not a null value
            updateAccuracies(msg[0], socket.id, parseFloat(msg[1]));
        }
    });

    socket.on('disconnect', function () {
        if (userIDs.indexOf(socket.id) !== -1) {
            userIDs.splice(userIDs.indexOf(socket.id), 1);
        }
        numUsers = userIDs.length;
        removePlayer(socket.id);
        oscClient.send('/teamIDs', JSON.stringify(teamIDs));
        console.log('number of users: ' + numUsers);
        oscClient.send('/numberofUsers', numUsers);
    });
    //TODO: If people disconnect intentionally or not, are they "out of the game"? How does the system compensate?

}

function removePlayer(id) {
    //remove from the teamIDs object
    for (let key in teamIDs) {
        let index = teamIDs[key].indexOf(id);
        if (index !== -1) {
            teamIDs[key].splice(index, 1);
            break; //assuming each user can only be in one team
        }
    }
    //remove from the accuracies object
    for (let team in teamAccuracies) {
        if (teamAccuracies[team][id]) {
            delete teamAccuracies[team][id];
            return;
        }
    }

}