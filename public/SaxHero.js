//Sax Hero Client - Audience Member

var socket = io('/client');

var centerX, centerY;

var audioContextStarted = false; //audio context for Tone - need to start with tap

let initialized = false; //user must tap "I'm ready!" event to allow sound/device orientation access.
let choosePlayerStatus = 0; //brings up the buttons to select which team they're on

let shoeLimg, shoeRimg;

let assignedTeam;

let shoeL, shoeR;

let crossMark; //the point at which the lines cross the playhead, where you tap each thumb

let touchArray = new Array(2); //only two touches on the screen at a time, please!

let canvas;//reference the created canvas for using JS without p5

function preload() {
    bg = loadImage('assets/grass.jpeg');
    shoeLimg = loadImage('assets/shoeL.png');
    shoeRimg = loadImage('assets/shoeR.png');
    //soundFormats('wav', 'mp3');
    //shoeL = loadSound('assets/leftStep');
}

function setup() {
    frameRate(60);

    canvas = createCanvas(window.innerWidth, window.innerHeight);

    canvas.position(0, 0);

    bg.resize(window.innerWidth, window.innerHeight);


    shoeLimg.resize(50, 0);
    shoeRimg.resize(50, 0);

    centerX = width / 2;
    centerY = height / 2;

    crossMark = height * 0.66;

    initializeButton();



    //     socket.on('choosePlayer', function () {
    //         console.log('Choose Player!');
    //     });
}


function draw() {
    background(0);
    imageMode(CORNER);
    image(bg, 0, 0);
    for (let touch of touches) {
        if (touch.x < centerX) {
            imageMode(CENTER);
            image(shoeLimg, touch.x, touch.y);
        }
        if (touch.x >= centerX) {
            imageMode(CENTER);
            image(shoeRimg, touch.x, touch.y);
        }
    }
    if (initialized == true) {
        crossMarkDraw();
    }
    playerHUD();
}

//LOOK: Listeners

socket.on('choosePlayer', function (msg) {
    choosePlayerStatus = msg;
    console.log(choosePlayerStatus);
    if (choosePlayerStatus == 1) {
        buttonSetup();
    }
});

socket.on('phrase', function (msg) {
    Tone.Transport.bpm.value = 120;
    console.log(Tone.Transport.position);
    Tone.Transport.stop();
    Tone.Transport.start();
    Tone.Transport.scheduleRepeat(function (time) {
        //gridNoteSynth.triggerAttackRelease("C4", "16n", time);
        console.log('hi');
    }, "4n");
});

function logPosition() {
    console.log(Tone.Transport.position);
}
// function touchStarted() {
//     Tone.loaded().then(() => {
//         shoeL.start();
//     });
// }


addEventListener('touchstart', function (event) {
    let touchY = event.touches[0].clientY;

    if (initialized == true) {
        //shoeL.play();
        // if (event.touches[0].clientX < centerX) { //LOOK: figured this one out....now to limit the number in the X array.
        //     console.log('hi');
        //     // }
    }
    //before even calculating accuracy, was the touch within the zone?
    if (touchY > crossMark + 50 || touchY <= crossMark - 50) { //TODO: don't hard-code the zone - make percentage of screen
        console.log('ouch');
    }
});

addEventListener('touchend', function (ev) {
    console.log(touches);
});


//LOOK: Utilities

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

    //TODO: have these reaappear if the game has restarted!!! maybe just at the end of each level?

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