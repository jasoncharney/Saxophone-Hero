let socket = io('/projector');
let gameAddress;
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

socket.on('audienceURL', function (msg) {
    new QRCode(document.getElementById("qrcodeGame"), {
        text: msg,
        width: 300,
        height: 300
    });
    gameAddress = msg;
    document.getElementById("linkGame").innerHTML = 'or type: ' + gameAddress;
});

socket.on('levels', function (msg) {
    for (let level in msg){
        levels[level] = msg[level];
    }
    console.log(levels);
});

socket.on('numPlayers', function (msg) {
    for (let player in msg){
        playerNumbers[player] = msg[player];
    }
    console.log(playerNumbers);
});