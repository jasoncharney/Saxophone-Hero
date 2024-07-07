//Sax Hero Client - Audience Member

var socket = io('/client');

var centerX, centerY; //middle of the screen

var audioContextStarted = false; //audio context for Tone - need to start with tap

let initialized = false; //user must tap "I'm ready!" event to allow sound/device orientation access.
let choosePlayerStatus = 0; //brings up the buttons to select which team they're on

let shoeLimg, shoeRimg; //images for shoe taps

let assignedTeam; //string holding the team name

let shoeSampler;//object for holding shoe samples
let shoeSize = 0.1; //the size of the shoe graphic

let crossMark = window.innerHeight * 0.66; //the point at which the lines cross the playhead, where you tap each thumb

let touchArray = new Array(2); //only two touches on the screen at a time, please!

let canvas; //reference the created canvas for using JS without p5

let level = -1; //the current level we're on! -1 is the initial level
let victorylap = false; //if true, the current loop is a "victory lap" and the next loop will be the next level.

let displayTime = true; //draw the transport position at the bottom of the screen for troubleshooting

let notesObject; //reassign this from the single score file at team assignment time
let noteTimings = []; //single array that only contains the "seconds" of note events from the assigned voice.
let taps = []; //array that stores all the taps for a level (hits and misses)
let accuracy; //accuracy percentage for current level
let sendAccuracyFlag = 0; //flip to 1 once a loop to send the accuracy to the server just once.

let thumblines = [];
let playhead;
let hashWidth;

let secondsPerWindow = 4; //seconds of time displayed vertically
let pixelsPerSecond;
let zeroPoint;

let myLatency; //make a running calculation of my latency from last received values.
let myLatencySamples = 100; //how many recent latency values to average
let myLatencyBuffer = [];

//Metronome for testing
let metronomeEnabled = true; //change to false to turn it off. Just here for diagnostics.
const metronomeSynth = new Tone.MembraneSynth().toDestination();
metronomeSynth.pitchDecay = 0;
metronomeSynth.release = 0.01;

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

    pixelsPerSecond = height / secondsPerWindow;
    zeroPoint = crossMark;
    hashWidth = width * 0.33;


    playhead = new Playhead(crossMark, window.innerHeight / secondsPerWindow);

    playhead.reset();


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
    sendAccuracy(Tone.Transport.progress);
    pingDisplay(myLatency);


}

//Notes functions
function populateNotes(team) {
    notesObject = score[team];
    for (let i = 0; i < notesObject.length; i++) {
        thumblines.push(new Thumbline(notesObject[i].time, notesObject[i].duration, notesObject[i].midi, pixelsPerSecond, zeroPoint)); //make the thumblines
        noteTimings.push(notesObject[i].time); //just collect all the timings into a single array
    }
}
//Shoe draw and sound functions.
function shoePlay(shoeSoundChoose) {
    //play the left shoe sound if the touch is to the left of the center, otherwise play right
    if (shoeSoundChoose < centerX) {
        shoeSampler.triggerAttackRelease("C4", 0.2);
    }
    if (shoeSoundChoose >= centerX) {
        shoeSampler.triggerAttackRelease("C#4", 0.2);
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
        let freq = random(220, 440);
        Tone.Transport.scheduleRepeat((time) => {
            metronomeSynth.triggerAttackRelease(freq, "8n", time);
        }, "4n"); // "4n" is a quarter note, adjust as needed for different beat intervals
    }
    if (_status == 0) {
        Tone.Transport.cancel();
    }
}


//LOOK: Listeners

//Each player requests the status of the game upon joining (received via WebSocket in response to message)
//Using LocalStorage to see if they've joined before.
socket.on('choosePlayer', function (msg) {
    choosePlayerStatus = msg;
    if (choosePlayerStatus == 1) {
        let isTeamStored = localStorage.getItem('storedTeam');
        if (isTeamStored) {
            teamAssign(isTeamStored);
        }
        else {
            buttonSetup();
        }
    }
});


socket.on('level', function (msg) {
    level = msg;
    //Tone.Transport.schedule(setTransportPosition(level),Tone.Transport.loopEnd.value);TODO: get this 
    setTransportPosition(level);
    //TODO: players who have joined since the previous level started can now join
    // if (Tone.Transport.state !== 'started' && assignedTeam !== null) {
    //     setTransportState(1);
    // }
    taps = [];
});

socket.on('ping', function (msg) {
    let myPing = Date.now() - parseInt(msg);
    calculateMyAverageLatency(myPing);
});


function scheduleStart(targetTime) {
    const currentTime = Date.now();
    const delay = targetTime - currentTime;

    if (delay > 0) {
        return delay;
    }
}

function calculateMyAverageLatency(pingTime) {
    //latency is an average of a stream of incoming pings.
    myLatencyBuffer.push(pingTime);
    if (myLatencyBuffer.length > myLatencySamples) {
        myLatencyBuffer.shift();
    }
    myLatency = myLatencyBuffer.reduce((a, b) => a + b) / myLatencyBuffer.length;
}

function setTransportPosition(_level) {
    //set the transport position to a multiple of 8 (for which page we're on). TODO: get the victorylap logic in here though
    let newStartBar = _level * 8;
    let newStart = newStartBar.toString() + ":0:0";
    let newEnd = (newStartBar + 8).toString() + ":0:0";
    Tone.Transport.position = newStart;
    Tone.Transport.setLoopPoints(newStart, newEnd);
}

socket.on('transportState', function (msg) {
    if (metronomeEnabled) {
        playMetronome(msg[0]);
    }
    console.log(msg);
    setTransportState(msg);
});

function setTransportState(_state) {
    let state = _state[0];
    let _targetTime = parseInt(_state[1]);
    if (state == 1) {
        Tone.Transport.loop = true;
        let del = '+' + ((_targetTime - Date.now()) * 0.001).toString();
        console.log(del);
        Tone.Transport.start(del);
    }
    if (state == 0) {
        Tone.Transport.stop();
        playhead.reset();
    }
}

addEventListener('touchstart', function (event) {
    let touch = event.touches[event.touches.length - 1];
    if (initialized) {
        shoePlay(touch.clientX);
    }
    if (assignedTeam != undefined && Tone.Transport.state == 'started') {
        judgeTap(Tone.Transport.seconds);
        accuracy = calculateAccuracy();

    }

});


function judgeTap(tapTime) {

    //how accurate was the tap?
    //PROCESS: 1. Look up time of tap relative to the transport. 
    // 2. Look up the time in the score object.
    // 3. If there's a thumbline that is crossing the line ±margin of error,
    // then it's deemed accurate. Otherwise: not accurate.
    // Extra taps decrease the accuracy.

    //LOOK: If you don't tap, your accuracy does not diminish. So you can join a team and just watch without playing.
    //Also, a little secret here...it doesn't matter which thumb goes where!

    let timingMargin = 0.125; //seconds by which the tap can deviate and still count
    for (let noteTiming of noteTimings) {
        if (Math.abs(tapTime - noteTiming) <= timingMargin) {
            taps.push(1);
            return;
        }
    }
    taps.push(0);
}

function calculateAccuracy() {
    const hitInit = 0;
    const hitSum = taps.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        hitInit,
    );
    return (hitSum / taps.length).toFixed(2);
}

//send my current accuracy value to the sever only once per 8 bars, at the end of each loop.
//Reset the flag to 0 after the loop resets.
function sendAccuracy(_progress) {
    if (_progress >= 0.99 && sendAccuracyFlag == 0) {
        socket.emit('accuracy', [assignedTeam, accuracy]);
        sendAccuracyFlag = 1;
    }
    if (_progress < 0.99 && sendAccuracyFlag == 1) {
        sendAccuracyFlag = 0;
    }
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

