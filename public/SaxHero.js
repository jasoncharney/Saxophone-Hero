//Sax Hero Client - Audience Member

var socket = io('/client');

var centerX, centerY; //middle of the screen

var audioContextStarted = false; //audio context for Tone - need to start with tap

let initialized = false; //user must tap "I'm ready!" event to allow sound/device orientation access.
let choosePlayerStatus; //brings up the buttons to select which team they're on

let shoeLimg, shoeRimg; //images for shoe taps

let assignedTeam; //string holding the team name

let shoeSampler;//object for holding shoe samples
let shoeVolume = 0;//dBFS - decreases per level
let shoeSize = 0.1; //the size of the shoe graphic

let crossMark = window.innerHeight * 0.66; //the point at which the lines cross the playhead, where you tap each thumb. 2/3 of the way down the screen

let touchArray = new Array(2); //LOOK: only two touches on the screen at a time, please! this might be a problem, actually

let canvas; //reference the created canvas for using JS without p5

let currentLevel = 0; //the current level we're on!
let nextLevel; //the level we'll advance to on the next loop

let advanceLevelOnNextLoop = false; //if true, the current loop is a "victory lap" and the next loop will be the next level.
let victoryLap = false; //this current loop is a victory lap. We will do the loop one more time. Toggled in the level listener function.
let introFlag; //special condition for start of game
let displayTime = false; //draw the transport position at the bottom of the screen for troubleshooting

let notesObject; //reassign this from the single score file at team assignment time
let noteTimings = []; //single array that only contains the "seconds" of note events from the assigned voice.
let taps = []; //array that stores all the taps for a level (hits and misses)
let accuracy; //accuracy percentage for current level
let numberOfLoops = 0; //the number of times we've been through a level.
let sendAccuracyFlag = 0; //flip to 1 once a loop to send the accuracy to the server just once.

let thumblines = []; //notes as hash marks
let playhead; //the invisible line that moves all hashmarks
let hashWidth; //calculated width of each hashmark based on the screen

const secondsPerWindow = 4; //seconds of time displayed vertically
let pixelsPerSecond; //how fast to scroll
let zeroPoint;//where the playhead is = crossing the bar

let winner; //set when a winner is declared

let originalTransportStartTime; //if you join after it starts, you know when it started so you can rejoin at the beginning of the 8 bar loop. //TODO: revisit this
//TODO: get an actual loop start time from the server. Every 8 bars?

let myStartTime = performance.now();

//Metronome for testing
let metronomeEnabled = false; //change to false to turn it off. Just here for diagnostics.




function preload() {
    bg = loadImage('assets/grass.jpeg');
    titleFont = loadFont('/assets/VarsityTeam-Bold.otf');
    hudFont = loadFont('/assets/CreatoDisplay-Bold.otf');
    shoeLimg = loadImage('assets/shoeL.png');
    shoeRimg = loadImage('assets/shoeR.png');
    shoeSampler = new Tone.Sampler({
        urls: {
            "C4": 'assets/leftStep.wav',
            "C#4": 'assets/rightStep.wav'
        }
    }).toDestination();
    shoeSampler.volume.value = shoeVolume;
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

    //set the static fields for the Playhead and Thumbline classes

    pixelsPerSecond = height / secondsPerWindow;
    zeroPoint = crossMark;
    hashWidth = width * 0.33;


    playhead = new Playhead(crossMark, window.innerHeight / secondsPerWindow);

    playhead.reset();
    setTimeout(function(){setInterval(console.log(readableTime(Date.now())))},1000);
}

//LOOK: P5 Draw function.

function draw() {
    background(0);
    imageMode(CORNER);
    image(bg, 0, 0);
    if (initialized) {
        crossMarkDraw();
    }
    if (Tone.Transport.state == 'started') {
        for (let thumbline of thumblines) {
            thumbline.update(Tone.Transport.seconds);
            thumbline.draw(hashWidth);//TODO: loop around to reflect the Transport loop.
        }
    }
    if (initialized) {
        drawShoes();
    }
    playerHUD();
}

//Notes functions
function populateNotes(team) {
    notesObject = score[team];
    for (let i = 0; i < notesObject.length; i++) {
        thumblines.push(new Thumbline(notesObject[i].time, notesObject[i].duration, notesObject[i].midi, pixelsPerSecond, zeroPoint)); //make the thumblines
        noteTimings.push(notesObject[i].time); //just collect all the timings into a single array
    }
}

function populateDemoNotes() {
    notesObject = score[demo];
    for (let i = 0; i < notesObject.length; i++) {
        thumblines.push(new Thumbline(notesObject[i].time, notesObject[i].duration, notesObject[i].midi, pixelsPerSecond, zeroPoint)); //make the thumblines
        noteTimings.push(notesObject[i].time); //just collect all the timings into a single array
    }
}

//Shoe draw and sound functions.


function drawShoes() {
    //draw shoes for only the first two touches
    let firstTwoTouches = touches;
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


//LOOK: Listeners

//Each player requests the status of the game upon joining (received via WebSocket in response to message)

// socket.on('connectionTime', function(msg){
//     console.log(msg);
//     myStartTime = performance.timeOrigin - msg;
//     console.log(myStartTime);
// });
socket.on('choosePlayer', function (msg) {

    choosePlayerStatus = msg;
    if (choosePlayerStatus == 1) {
        buttonSetup();
        resetTransport();
    }
});

socket.on('originalTransportStartTime', function (msg) {
    if (!originalTransportStartTime && Tone.Transport.state == 'started') {
        originalTransportStartTime = msg;
        console.log(originalTransportStartTime);
    }
});

socket.on('transportState', function (msg) {
    if (metronomeEnabled) {
        playMetronome(msg);
    }
    setTransportState(msg);
});

// socket.on('nextEightBarTime', function (msg) { //catch them up with the current position!
//     let nextLoopStart = parseInt(msg[1]) + 16000;//8 bars from now!
//     setTransportState([1, nextLoopStart]);
//     setTransportPosition(nextLevel);
// });

socket.on('introFlag', function (msg) {
    console.log(msg);
    if (msg == 0) {
        introFlag = false;
        //taps = []; //clear taps buffer when intro turns off, or rejoining!
    }
    if (msg == 1) {
        introFlag = true;
    }
});

socket.on('reset', function () { //reload the page if we get the reset message.
    location.reload();
});


//LOOK: Level advancing

socket.on('level', function (msg) {
    nextLevel = msg;
    if (nextLevel == 17) { //look at setTransportPosition function for stopping loop.
        advanceLevelOnNextLoop == true;
    }
    if (introFlag == false) {
        if (nextLevel == currentLevel) {
            advanceLevelOnNextLoop = false;
        }

        if (nextLevel == currentLevel + 1) {
            advanceLevelOnNextLoop = false;
            victoryLap = true;
            hudnotification = new Hudnotification('Level up!', 3);
        }

        if (nextLevel > currentLevel + 1) {
            victoryLap = true;
            advanceLevelOnNextLoop = true;
        }
    }

    //if (nextLevel != currentLevel) {
    //nextLevel = msg;
    //console.log('Advance to level ' + nextLevel + '!');

    //advanceLevelOnNextLoop = false; //probably redundant
    //victoryLap = true; //
    //taps = []; //clear the taps buffer and then calculate accuracy!
    //accuracy = undefined; //should be zero, now.
    //}
});

socket.on('winner', function (msg) { //winner is sent from the server, but everyone gets told it's level 17 next regardless
    winner = msg;
});




//TODO: If transport is going after they rejoin, then ask for the original scheduled start time from Max...
//make sure that you don't start until you're at an 8 bar multiple of the original scheduled time.
//Need to echo the transport state to new joiners.
//Function that checks if original start time is in the past
//If it is, loop through multiples of 16 seconds (8 bar loop) offset to the original start time and check their future/past
//When you hit one in the future, then schedule that multiple as the target time.
//Then your own transport should be at the beginning of an 8-bar loop. Test this idea!!!

addEventListener('touchstart', function (event) {
    let touch = event.touches[event.touches.length - 1];
    if (initialized) {
        shoePlay(touch.clientX); //TODO: why is this sluggish on mobile? Is it because of the draw frame lineup? Use Tone to draw the frames?
    }
    if (assignedTeam != undefined && Tone.Transport.state == 'started' && introFlag == false) {
        judgeTap(Tone.Transport.seconds);
        accuracy = calculateAccuracy();
    }
    if (assignedTeam == undefined && Tone.Transport.state == 'started') {
        judgeTap(Tone.Transport.seconds);
    }

});


function judgeTap(tapTime) {

    //how accurate was the tap?
    //PROCESS: 1. Look up time of tap relative to the transport. 
    // 2. Look up the time in the score object.
    // 3. If there's a thumbline that is crossing the line ±margin of error,
    // then it's deemed accurate. Otherwise: not accurate.
    // Extra taps decrease the accuracy.

    //If you don't tap, your accuracy does not diminish. So you can join a team and just watch without playing.
    //Also, a little secret here...it doesn't matter which thumb goes where!

    let timingMargin = 0.125; //seconds by which the tap can deviate and still count
    let matchedIndex = -1;

    noteTimings.forEach((noteTiming, index) => {
        if (Math.abs(tapTime - noteTiming) <= timingMargin) {
            taps.push(1);
            matchedIndex = index;
            return; //if we matched, then exit
        }
    });

    //IMPORTANT: //TODO: add some calculation here for position on screen...needs to be at least a little close vertically...

    if (matchedIndex !== -1) {
        thumblines[matchedIndex].fill = [255, 215, 0]; //make it gold if it was right
    }

    if (matchedIndex == -1) {
        taps.push(0); // or push a 0 to the taps array.
    }


}

function calculateAccuracy() {
    const hitInit = 0;
    const hitSum = taps.reduce(
        (accumulator, currentValue) => accumulator + currentValue, hitInit
    );
    return ((hitSum / taps.length).toFixed(2));
}

//send my current accuracy value to the sever only once per 8 bars, at the end of each loop.
//Reset the flag to 0 after the loop resets.
function sendAccuracy() {
    socket.emit('accuracy', [assignedTeam, accuracy]);
    console.log('accuracy: ' + accuracy);
}

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
    strokeWeight(10);
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

//look for only the last part of the beat. Arguments: _bbs is the Transport position, sub is Bar/Beat/Sixteenths.
//0 = bar, 1 = beat, 2 = 16ths
function convertBeat(_bbs, sub) {
    const parts = _bbs.split(':');
    return parseInt(parts[sub], 10);
}

//create and play blank audio object to make sound even if iOS ringer switch is muted.
function unblockPlayback() {
    const silence = document.createElement("AUDIO");
    silence.setAttribute("x-webkit-airplay", "deny");//prevent AirPlay connection
    silence.preload = "auto";
    silence.loop = true;
    silence.src = "assets/silence.wav";
    silence.play();
}

