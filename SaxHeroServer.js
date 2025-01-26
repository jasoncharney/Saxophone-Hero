//Saxophone Hero Server - 2024//
//TODO: How to turn this into an application you can run from the Max folders?

//import modules
let fs = require('fs');
let express = require('express');
let osc = require('node-osc');
let socket = require('socket.io');

//initialize connection settings and make an object with the number of notes per level
let connectSettings = JSON.parse(fs.readFileSync('connectSettings.json'));

let notesPerLevel = JSON.parse(fs.readFileSync('notesPerLevel.json'));

const levelTapScalar = 2; //base scalar of taps per level. 

let averageNotesPerLevel = calculateAverageNotesPerLevel(notesPerLevel);



//const deviationNotesPerLevel = calculateDeviations(notesPerLevel);
let targetPointsPerLevel = {}; //we'll update these as we get more players choosing.

//IMPORTANT: targetScorePerLevel = notesPerLevel * (numberOfPlayers - 1)

//set up server/ports. Separate for sax app, audience member app, and projector display app.
let app = express();
app.use(express.static('public'));

let saxApp = express();
saxApp.use(express.static('saxScores'));

let projectorApp = express();
projectorApp.use(express.static('projector'));

//change the IP addresses/ports in the JSON file (Max also reads this file)
let server = app.listen(connectSettings.expressPort);
let saxPlayer = saxApp.listen(connectSettings.saxPlayerPort);
let projectorScreen = projectorApp.listen(connectSettings.projectorPort);

//set up WebSockets
let io = socket(server);
let client = io.of('/client');

let saxio = socket(saxPlayer);
let saxUser = saxio.of('/saxUser');

let projectio = socket(projectorScreen);
let projector = projectio.of('/projector');

let serverStatus = 0; //initialize server
let choosePlayerFlag = 0; //toggle this after the player choice has been initiated but before the game starts
let introFlag = 0; //On client side, this becomes a boolean

//set up OSC channels
let oscServer = new osc.Server(connectSettings.maxSendPort, connectSettings.hostIP);
let oscClient = new osc.Client(connectSettings.hostIP, connectSettings.maxListenPort);

let nextEightBarTime; //send this time to latecomers. They'll join on the next loop.
let transportState; //array w/ two values for the transport - state and the time it was turned on or off
let gameStarted = false;
let winner;

//empty arrays for each group of audience members

let unassignedUsers = []; //users who have intialized but not chosen a team

let teamIDs = {
    "soprano": [],
    "alto": [],
    "tenor": [],
    "bari": []
}

let teamLevels = { //levels are current and next
    "soprano": [0, 1],
    "alto": [0, 1],
    "tenor": [0, 1],
    "bari": [0, 1]
}

let teamAccuracies = {
    "soprano": {},
    "alto": {},
    "tenor": {},
    "bari": {}
}

let saxIDs = { //track the user ids for sax players who have joined and ID'd themselves.

    "soprano": 0,
    "alto": 0,
    "tenor": 0,
    "bari": 0
}

let teamPoints = { //number of points earned per team (earned per level)
    "soprano": 0,
    "alto": 0,
    "tenor": 0,
    "bari": 0
}

let teamFullLevels = {
    "soprano": [],
    "alto": [],
    "tenor": [],
    "bari": []
}; //object to get team full levels from Max

//current notification on the projector screen
let notification;

//Original timestamp of first startup. So rejoining players can reference.
let originalTransportStartTime; //TODO: they start on the next level.

LOOK: //run at startup:
console.clear();
serverStatus = 1;
printAddresses();
client.emit('clearLocalStorage'); //clear local storage if anyone's connected

function printAddresses() {
    console.log('Sax Hero Server Running:' + '\n' + '\n' + 'Audience URL: ' + connectSettings.hostIP + ':' + connectSettings.expressPort);
    console.log('Player URL: ' + connectSettings.hostIP + ':' + connectSettings.saxPlayerPort);
    console.log('Projector page: ' + connectSettings.hostIP + ':' + connectSettings.projectorPort);
    console.log('-------------------------');
}
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

oscServer.on('/choosePlayer', function (msg) {
    choosePlayerFlag = msg[1]; //new players joining will immediately get the choose player buttons OR be previously reassigned.
    if (choosePlayerFlag == 1) {
        console.log('Audience can choose players.');
    }
    client.emit('choosePlayer', choosePlayerFlag);
});

// oscServer.on('/eightBarServerTime', function (msg) {
//     nextEightBarTime = msg[1];
// });

oscServer.on('/stopreset', function (msg) {
    console.clear();
    console.log('Game stopped and reset.\n-----------------');
    printAddresses();
    teamPoints = {
        "soprano": 0,
        "alto": 0,
        "tenor": 0,
        "bari": 0
    }
    choosePlayerFlag = 0; //toggle player flag to 0
    winner = undefined;
    gameStarted = false;
    client.emit('reset');
    projector.emit('reset');
    saxUser.emit('reset');
});

oscServer.on('/gameStarted', function (msg) {
    gameStarted = true; //for player scores to reconnect.
});

oscServer.on('/endFlag', function (msg) {
    client.emit('endFlag', msg[1]);
    projector.emit('endFlag', msg[1]);
});

oscServer.on('/winner', function (msg) {
    winner = msg[1];
    console.log(winner + 'wins');
    client.emit('winner', winner);
    saxUser.emit('winner', winner);
    projector.emit('winner', winner);
});


//LOOK: level-sending logic
oscServer.on('/level', function (msg) {
    let teamLevels = JSON.parse(msg[1]); //turn the levels into a JSON object
    if (choosePlayerFlag == 1) { //only attempt to send messages if players have been told to join teams
        updateLevelsAndNotify(teamLevels);
    }
});

oscServer.on('/projectorLevelUpdate', function (msg) {
    let projectorLevels = JSON.parse(msg[1]);
    console.log(projectorLevels);
    projector.emit('levels', projectorLevels);
});

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
        saxUser.to(saxPlayer).emit('level', level);
        console.log(saxPlayer + ' ' + team + ' ' + level);
    }
}


//tell all connected users to clear their local storage,
// so they have to pick a new voice
oscServer.on('/clearLocalStorage', function (msg) {
    client.emit('clearLocalStorage');
});

//send arrays of accuracies to Max

function updateAccuracies(team, id, newAccuracy) {
    if (teamAccuracies[team]) {
        teamAccuracies[team][id] = newAccuracy;
    }
}

function calculateAverageAccuracy(teamAccuracies) {
    const averages = {};

    for (const team in teamAccuracies) {
        const players = teamAccuracies[team];
        const playerAccuracies = Object.values(players); // Get an array of accuracy values

        if (playerAccuracies.length > 0) {
            const totalAccuracy = playerAccuracies.reduce((sum, accuracy) => sum + accuracy, 0);
            const averageAccuracy = totalAccuracy / playerAccuracies.length;
            averages[team] = averageAccuracy;
        } else {
            averages[team] = 0;  // or another default value if no players are present
        }
    }
    return averages;
}


function sendAccuracies() {
    const teamAverageAccuracies = calculateAverageAccuracy(teamAccuracies);
    oscClient.send('/accuracies', JSON.stringify(teamAverageAccuracies));
    //console.log('Accuracies:' + teamAverageAccuracies);
}


oscServer.on('/requestAccuracies', function () {
    sendAccuracies();
});

//LOOK: transport state change schedules in the future!

oscServer.on('/transportState', function (msg) {
    transportState = ([msg[1], msg[2]]);
    // let myDateNow;
    // if (msg[1] == 1){
    //     myDateNow = (Date.now() + 4000).toString();
    // }
    // console.log(myDateNow - transportState[1]);
    // transportState = (msg[1], myDateNow);
    //log that original transport time for rejoining users, baby!
    if (!originalTransportStartTime) {
        originalTransportStartTime = msg[2];
    }
    saxUser.emit('transportState', transportState);
    client.emit('transportState', transportState);
    //send the list of tap accuracies to Max every 16 seconds
    // if (transportState[0] == 1) {
    //     setTimeout(function () { setInterval(sendAccuracies, 16000) }, 16000); //TODO: maybe should not be aligned with the accuracy sends
    // }
});

oscServer.on('/fullLevels', function (msg){
    teamFullLevels = JSON.parse(msg[1]);
});


oscServer.on('/introFlag', function (msg) {
    introFlag = msg[1];
    client.emit('introFlag', introFlag);
    saxUser.emit('introFlag', introFlag);
});

oscServer.on('/projectorNotify', function (msg) {
    notification = msg[1];
    projector.emit('notification', notification);
});

oscServer.on('/clearPoints', function (msg) {
    resetTeamPoints(msg[1]);//reset the points for the team that is starting a new level.
});

//LOOK: Websocket Connections

client.on('connection', onAudienceConnect);
saxUser.on('connection', onSaxPlayerConnect);
projector.on('connection', onProjectorConnect);

function onProjectorConnect(socket) {
    projector.to(socket.id).emit('audienceURL', 'http://' + connectSettings.hostIP.toString() + ':' + connectSettings.expressPort.toString());
    projector.to(socket.id).emit('wifi', {
        ssid: connectSettings.ssid,
        password: connectSettings.pw
    });
    if (notification) {
        projector.to(socket.id).emit('notification', notification);
    }
}

function onSaxPlayerConnect(socket) {
    socket.on('myVoice', function (msg) {
        saxIDs[msg] = socket.id;
        oscClient.send('/saxIDs', JSON.stringify(saxIDs));
        saxUser.to(socket.id).emit('introFlag', introFlag);
        if (gameStarted) {
        }
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

function onAudienceConnect(socket) {
    client.to(socket.id).emit('connectionTime', Date.now());//send the current servertime
    //user must be initialized through pressing the button on their startup screen.
    if (gameStarted == true) {
        client.to(socket.id).emit('gameStarted'); //if game's already started, tough luck.
    }
    socket.on('initializeMe', function (msg) {
        unassignedUsers.push(socket.id);
        oscClient.send('/numUnassignedUsers', unassignedUsers.length);
        if (gameStarted == false) {
            client.to(socket.id).emit('choosePlayer', choosePlayerFlag); //if the "choose players" event already triggered, bring up selection screen right away
        }
    });

    socket.on('myTeam', function (msg) {
        let team = msg;
        teamIDs[team].push(socket.id);

        if (unassignedUsers.indexOf(socket.id) !== -1) {
            unassignedUsers.splice(unassignedUsers.indexOf(socket.id), 1);
            oscClient.send('/numUnassignedUsers', unassignedUsers.length);
        }

        updateTargetPointsPerLevel(teamIDs);
        console.log(targetPointsPerLevel);
        projector.emit('numPlayers', countPlayersInTeams(teamIDs));
        oscClient.send('/teamIDs', JSON.stringify(teamIDs));
        oscClient.send('/targetPointsPerLevel', JSON.stringify(targetPointsPerLevel));

        // if (nextEightBarTime && transportState[0] == 1) {//catch them up: next 8 bar loop, intro flag
        //client.to(socket.id).emit('nextEightBarTime', nextEightBarTime); //TODO: 
        //client.to(socket.id).emit('introFlag', introFlag); //TODO: get them caught up!
        //}

        client.to(socket.id).emit('level', teamLevels[team]); //send the current level of that team to them
        client.to(socket.id).emit('levelList', teamFullLevels[team]);
    });

    socket.on('accuracy', function (msg) {
        if (msg[1]) { //only add if there's not a null value
            updateAccuracies(msg[0], socket.id, parseFloat(msg[1]));
        }
    });
    socket.on('points', function (msg) {
        updateTeamPoints(msg);
        oscClient.send('/teamPoints', JSON.stringify(teamPoints));
        projector.emit('teamPoints', teamPoints);
    });

    socket.on('disconnect', function () {
        if (unassignedUsers.indexOf(socket.id) !== -1) {
            unassignedUsers.splice(unassignedUsers.indexOf(socket.id), 1);
        }
        removePlayer(socket.id);
        updateTargetPointsPerLevel(teamIDs);
        oscClient.send('/targetPointsPerLevel', JSON.stringify(targetPointsPerLevel));
        projector.emit('numPlayers', countPlayersInTeams(teamIDs));
        oscClient.send('/teamIDs', JSON.stringify(teamIDs));
        oscClient.send('/numberofUsers', unassignedUsers.length);
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

function countPlayersInTeams(_teams) {
    let playerCounts = {};

    for (let team in _teams) {
        if (Object.keys(_teams[team]).length) {
            playerCounts[team] = Object.keys(_teams[team]).length;
        }
        else {
            playerCounts[team] = 0;
        }
    }

    return playerCounts;

}

function updateTargetPointsPerLevel(_teams) { //multiply number of notes per level by number of connected players in team
    let numPlayersPerTeam = countPlayersInTeams(_teams);
    for (let team in numPlayersPerTeam) {
        targetPointsPerLevel[team] = notesPerLevel[team].map(num => num * (numPlayersPerTeam[team] - 1)); //one fewer than number of players.
    }
}

function updateTeamPoints(_assignedTeam) {
    if (teamPoints.hasOwnProperty(_assignedTeam)) {
        teamPoints[_assignedTeam]++; //add one point to team total
    }
    console.log(teamPoints);
}

function resetTeamPoints(_assignedTeam) {
    if (teamPoints.hasOwnProperty(_assignedTeam)) {
        teamPoints[_assignedTeam] = 0; //add one point to team total
    }
}

function calculateAverageNotesPerLevel(_notesPerLevel) {
    const numberOfLevels = _notesPerLevel.soprano.length; //number of levels
    const totalTeams = Object.keys(_notesPerLevel).length; //number of teams
    let averageTapsPerLevel = new Array(numberOfLevels).fill(0);

    for (let level = 0; level < numberOfLevels; level++) {
        let sumTaps = 0;
        for (let team in _notesPerLevel) {
            sumTaps += _notesPerLevel[team][level];
        }
        averageTapsPerLevel[level] = sumTaps / totalTeams;
    }
    return averageTapsPerLevel;

}

function calculateScaledTarget(baseTarget, teamTaps, averageTaps, difficultyExponent) {
    const scaledTarget = {};

    for (let team in teamTaps) {
        scaledTarget[team] = [];
        for (let level = 0; level < teamTaps[team].length; level++) {
            let deviation = teamTaps[team][level] / averageTaps[level];
            if (deviation > 1.2) {
                deviation = 1.2;
            }
            else if (deviation < 0.8) {
                deviation = 0.8;
            }
            const target = baseTarget * Math.pow(deviation, difficultyExponent);
            scaledTarget[team].push(target);
        }
    }
    return scaledTarget;
}

function calculateBaseTarget(teamTaps, scalarPerLevel) {//calculate the number of taps per each level (see scalar above)
    const baseTarget = {};
    for (let team in teamTaps) {
        baseTarget[team] = [];
        for (let level = 0; level < teamTaps[team].length; level++) {
            let baseValue = teamTaps[team][level] * scalarPerLevel; //multiply all by scalar
            baseTarget[team].push(baseValue);
        }
    }
    return baseTarget;
}

// function calculateDeviations(_notesPerLevel) {
//     let deviations = {};
//     for (let team in _notesPerLevel) {
//         deviations[team] = _notesPerLevel()
//     }
// }