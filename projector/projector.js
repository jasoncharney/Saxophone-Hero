let socket = io('/projector');
let gameAddress;
let winner;
let endFlag = false;
let teamPoints;

let levels =
{
    "soprano": -1,
    "alto": -1,
    "tenor": -1,
    "bari": -1
};

let playerNumbers = {
    "soprano": 0,
    "alto": 0,
    "tenor": 0,
    "bari": 0
}

//reload the page when it's resized
window.addEventListener('resize', function () {
    location.reload();
});


socket.on('audienceURL', function (msg) {
    new QRCode(document.getElementById("qrcodeGame"), {
        text: msg,
        width: 300,
        height: 300
    });
    gameAddress = msg;
    document.getElementById("linkGame").innerHTML = 'or type: ' + gameAddress;
});

socket.on('wifi', function (msg) {
    document.getElementById("wifi").innerHTML = 'ssid: ' + msg.ssid + '<br>' + 'password: ' + msg.password;
});

socket.on('reset', function () {
    location.reload();
});

socket.on('winner', function (msg) {
    winner = msg;
});

socket.on('levels', function (msg) {
    levels = msg;
    console.log(levels);
    for (let level in msg) {
        levels[level] = msg[level];
    }
});

socket.on('teamPoints', function (msg){
    teamPoints = msg;
});

socket.on('endFlag', function (msg) {
    console.log('endFlag' + msg);
    if (msg == 0) {
        endFlag = false;
    }
    if (msg == 1) {
        endFlag = true;
    }
});

socket.on('numPlayers', function (msg) {
    for (let player in msg) {
        playerNumbers[player] = msg[player];
    }
    console.log(playerNumbers);
});

socket.on('notification', function (msg) {
    console.log(msg);
    document.getElementById("status").innerHTML = msg;
});