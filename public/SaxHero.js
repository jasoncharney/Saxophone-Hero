//Sax Hero Client - Audience Member

var socket = io('/client');

var centerX, centerY;

var audioContextStarted = false; //audio context for Tone - need to start with tap

let initialized = false; //user must tap "I'm ready!" event to allow sound/device orientation access.
let choosePlayerStatus = 0; //brings up the buttons to select which team they're on

let shoeLimg, shoeRimg;

let sopranoButton, altoButton, tenorButton, bariButton;

let assignedTeam;

let shoeL, shoeR;


let touchArray = new Array(2); //only two touches on the screen at a time, please!

function preload() {
    bg = loadImage('assets/grass.jpeg');
    shoeLimg = loadImage('assets/shoeL.png');
    shoeRimg = loadImage('assets/shoeR.png');
    shoeL = new Tone.Player('assets/leftStep.wav').toDestination();
    shoeR = new Tone.Player('assets/rightStep.wav').toDestination();
    shoeL.autostart = true;
}

function setup() {
    frameRate(60);
    buttonSetup();
    createCanvas(window.innerWidth, window.innerHeight);
    
    bg.resize(window.innerWidth, 0);
    shoeLimg.resize(50,0);
    shoeRimg.resize(50,0);

    centerX = width / 2;
    centerY = height / 2;

    socket.on('hi', function () {
        console.log('hi');
    });
    noLoop();
}

function draw() {
    background(0);
    imageMode(CORNER);
    image(bg,0,0);
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
    centerLine();
    welcomeScreen();
}
//LOOK: Listeners

socket.on('choosePlayer', function (msg) {
    choosePlayerStatus = 1;
});

// function touchStarted() {
//     Tone.loaded().then(() => {
//         shoeL.start();
//     });
// }

addEventListener('touchstart', function (event) {
    if (initialized == false){
        initialized = true;
    }

    if (audioContextStarted == true) {
        shoeL.start();
        console.log(Tone.Transport.position);
        // if (event.touches[0].clientX < centerX) { //LOOK: figured this one out....now to limit the number in the X array.
        //     console.log('hi');
        //     // }
    }
    console.log(touches);
});

addEventListener('touchend', function (ev) {
    console.log(touches);
});


//LOOK: Utilities

function centerLine() {
    stroke(255); //TODO: incorporate scribble.js library to get this looking rougher
    strokeWeight(1);
    line(centerX, 0, centerX, height);
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

// function initButtonCallback(){
//     initializeAudio();
//     initButton.hide();
//     initialized = true;
//     console.log(deviceOrientation);
// }

function initializeAudio() {
    StartAudioContext(Tone.context);
    Tone.context.resume();
    Tone.Transport.start();
    audioContextStarted = true;
    //htmlaudio();
}
function buttonSetup() {

    //TODO: Script these NOT through P5's button functions...need more specific event listeners.
    // initButton = createButton('click');

    // initButton.mousePressed(initButtonCallback);

    // initButton.position(centerX, centerY);

    // if (initialized == false){
    //     initButton.show();
    // }
    sopranoButton = createButton('Team Soprano', 'soprano');
    sopranoButton.size(width, height * 0.25);
    sopranoButton.position(0, 0);


    altoButton = createButton('Team Alto', 'alto');
    altoButton.size(width, height * 0.25);
    altoButton.position(0, height * 0.25);

    tenorButton = createButton('Team Tenor', 'tenor');
    tenorButton.size(width, height * 0.25);
    tenorButton.position(0, height * 0.5);

    bariButton = createButton('Team Bari', 'bari');
    bariButton.size(width, height * 0.25);
    bariButton.position(0, height * 0.75);

    sopranoButton.hide();
    altoButton.hide();
    tenorButton.hide();
    bariButton.hide();

    sopranoButton.mousePressed(console.log('soprano'));

}


function teamAssign(_team) {
    assignedTeam = _team;
    console.log(assignedTeam);
}


