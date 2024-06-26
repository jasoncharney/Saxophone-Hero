//Sax Hero Client - Audience Member

var socket = io('/client');

var centerX, centerY;

var audioContextStarted = false; //audio context for Tone - need to start with tap

let initialized = false; //user must tap "I'm ready!" event to allow sound/device orientation access.
let choosePlayerStatus = 0; //brings up the buttons to select which team they're on

let shoeLimg, shoeRimg;

let assignedTeam;

let shoeSampler;//object for holding shoe samples
let shoeSize = 0.1; //the size of the shoe graphic is also the vertical area of the screen where a tap is counted as accurate.

//let shoeL, shoeR; //player objects for Tone

let crossMark = window.innerHeight * 0.66; //the point at which the lines cross the playhead, where you tap each thumb

let touchArray = new Array(2); //only two touches on the screen at a time, please!

let canvas;//reference the created canvas for using JS without p5

let level = -1; //the current level we're on!

let displayTime = true; //draw the transport position at the bottom of the screen for troubleshooting

let notesObject = soprano.notes; //reassign this from the single score file at team assignment time

let thumblines = [];
let playhead;
let hashWidth;

let secondsPerWindow = 4; //seconds of time displayed vertically

//Metronome for testing
let metronomeEnabled = true; //change to false to turn it off.
const metronomeSynth = new Tone.MembraneSynth().toDestination();
metronomeSynth.pitchDecay = 0;
metronomeSynth.release = 0.01;


console.log(notesObject);

function preload() {
    bg = loadImage('assets/grass.jpeg');
    shoeLimg = loadImage('assets/shoeL.png');
    shoeRimg = loadImage('assets/shoeR.png');
    shoeSampler = new Tone.Sampler({
        urls: {
            "C4": 'assets/leftStep.wav',
            "C#4": 'assets/rightStep.wav'
        }
    }).toDestination();
    //soundFormats('wav', 'mp3');
    //shoeL = loadSound('assets/leftStep');
}
//LOOK: P5 Setup Function.


function setup() {
    frameRate(60);

    canvas = createCanvas(window.innerWidth, window.innerHeight);

    canvas.position(0, 0);

    bg.resize(window.innerWidth, window.innerHeight);

    shoeSize = shoeSize * height;
    hudSize = hudSize * width;

    shoeLimg.resize(shoeSize, 0);
    shoeRimg.resize(shoeSize, 0);

    centerX = width / 2;
    centerY = height / 2;

    crossMark = height * 0.66;

    initializeButton();
    //set the static fields for the playhead and thumbline classes

    let pixelsPerSecond = height / secondsPerWindow;
    let zeroPoint = crossMark;
    hashWidth = width * 0.33;


    playhead = new Playhead(crossMark, window.innerHeight / secondsPerWindow);

    playhead.reset();

    for (let i = 0; i < notesObject.length; i++) {
        thumblines.push(new Thumbline(notesObject[i].time, notesObject[i].duration, notesObject[i].midi, pixelsPerSecond, zeroPoint));
    }
    for (let thumbline of thumblines) {
        thumbline.print();
    }

}

//LOOK: P5 Draw function.

function draw() {
    background(0);
    imageMode(CORNER);
    image(bg, 0, 0);
    if (initialized == true) {
        crossMarkDraw();
    }
    if (Tone.Transport.state == 'started') {
        //playhead.update(Tone.Transport.seconds);
        //playhead.draw();
        for (let thumbline of thumblines) {
            thumbline.update(Tone.Transport.seconds);
            thumbline.draw(hashWidth);
        }
    }
    if (initialized == true) {
        drawShoes();
    }
    playerHUD();

}

//Shoe draw and sound functions.
function shoePlay(shoeSoundChoose) {
    //play the left shoe sound if the touch is to the left of the center, otherwise play right
    if (shoeSoundChoose < centerX) {
        shoeSampler.triggerAttackRelease("C4", 0.5);
    }
    if (shoeSoundChoose >= centerX) {
        shoeSampler.triggerAttackRelease("C#4", 0.5);
    }
}

function drawShoes() {
    //draw shoes for only the first two touches
    let firstTwoTouches = touches.slice(0, 2);
    for (let touch of firstTwoTouches) {
        if (touch.x < centerX) {
            imageMode(CENTER);
            image(shoeLimg, touch.x, touch.y);
        }
        if (touch.x >= centerX) {
            imageMode(CENTER);
            image(shoeRimg, touch.x, touch.y);
        }
    }
}
function playMetronome(_status) {
    if (_status == 1) {
        Tone.Transport.scheduleRepeat((time) => {
            metronomeSynth.triggerAttackRelease("A4", "8n", time);
        }, "4n"); // "4n" is a quarter note, adjust as needed for different beat intervals
    }
    if (_status == 0) {
        Tone.Transport.cancel();
    }
}
//LOOK: Listeners

socket.on('choosePlayer', function (msg) {
    choosePlayerStatus = msg;
    console.log(choosePlayerStatus);
    if (choosePlayerStatus == 1) {
        buttonSetup();
    }
});

socket.on('ping', function (msg){
    console.log(msg);
});
socket.on('level', function (msg) {
    level = msg;
    setTransportPosition(level);
});

function setTransportPosition(_level) {
    //set the transport position to a multiple of 8 (for which page we're on). TODO: get the victorylap logic in here though
    newPosition = (_level * 8).toString() + ":0:0";
    Tone.Transport.position = newPosition;
}

socket.on('transportState', function (msg) {
    if (metronomeEnabled) {
        playMetronome(msg);
    }
    if (msg == 1) {
        Tone.Transport.start();
    }
    if (msg == 0) {
        Tone.Transport.stop();
        playhead.reset();
    }
});

addEventListener('touchstart', function (event) {
    let touch = event.touches[event.touches.length - 1];
    if (initialized) {
        shoePlay(touch.clientX);
    }
    //before even calculating accuracy, was the touch within the zone?
    if (touch.clientY > crossMark + shoeSize || touch.clientY <= crossMark - shoeSize) {
        console.log('ouch');
    }
});

addEventListener('touchmove', function (event) {
    let touch = event.touches;
});

addEventListener('touchend', function (event) {
    let touch = event.touches;
});


//LOOK: Utilities


function logPosition() {
    console.log(Tone.Transport.position);
}


function crossMarkDraw() {
    strokeWeight(5);
    stroke(255, 200);
    strokeCap(SQUARE);
    setLineDash([5, 10]);
    line(0, crossMark, width, crossMark);
    line(width / 2, 0, width / 2, height);
}

//draw the hashmarks as dotted lines like on a football field.
function setLineDash(list) {
    drawingContext.setLineDash(list);
}

//WebAudio is linked to the ringer volume in iOS, so create a blank htmlaudio element so users don't have to unmute
function htmlaudio() {
    var silenceDataURL = "data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
    var tag = document.createElement("AUDIO");
    tag.controls = false;
    tag.preload = "auto";
    tag.loop = false;
    tag.src = silenceDataURL;
    tag.play();
}

function buttonSetup() {

    sopranoButton = createButton('Team Soprano', 'soprano');
    sopranoButton.size(width, height * 0.25);
    sopranoButton.position(0, 0);
    sopranoButton.id('sopranoButton');

    altoButton = createButton('Team Alto', 'alto');
    altoButton.size(width, height * 0.25);
    altoButton.position(0, height * 0.25);
    altoButton.id('altoButton');

    tenorButton = createButton('Team Tenor', 'tenor');
    tenorButton.size(width, height * 0.25);
    tenorButton.position(0, height * 0.5);
    tenorButton.id('tenorButton');

    bariButton = createButton('Team Bari', 'bari');
    bariButton.size(width, height * 0.25);
    bariButton.position(0, height * 0.75);
    bariButton.id('bariButton');

    document.getElementById('sopranoButton').addEventListener('click', function () { teamAssign('soprano'); });
    document.getElementById('altoButton').addEventListener('click', function () { teamAssign('alto'); });
    document.getElementById('tenorButton').addEventListener('click', function () { teamAssign('tenor'); });
    document.getElementById('bariButton').addEventListener('click', function () { teamAssign('bari'); });
}

function teamAssign(_team) {
    assignedTeam = _team;
    console.log(assignedTeam);

    socket.emit('myTeam', assignedTeam);
    //assign the teams and then remove all the buttons.
    document.getElementById('sopranoButton').remove();
    document.getElementById('altoButton').remove();
    document.getElementById('tenorButton').remove();
    document.getElementById('bariButton').remove();
}

function initializeButton() {
    initButton = createButton('Tap to start!', 'init');
    //initButton.size(width, height * 0.25);
    initButton.position(centerX, height * 0.75);
    initButton.id('initButton');
    document.getElementById('initButton').addEventListener('click', function () { initializeMe() });
}

function initializeMe() {
    if (initialized == false) {
        Tone.start();
        initialized = true;
        socket.emit('initializeMe');
        console.log('initialized');
        document.getElementById('initButton').remove();
    }
}