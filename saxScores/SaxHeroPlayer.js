//Sax Hero Client - Player

let socket = io('/saxUser');
let latency;
let displayTime = true; //draw transport location for debugging

let centerX, centerY;

let playerChooser;

let playerAssigned = 0;

let scorePages = [];

let scorePopulated = false; //change flag when score images are loaded.

let numLevels = 6; //including intro

let level;

let advanceLevelOnNextLoop = false; //if true, the current loop is a "victory lap" and the next loop will be the next level.
let victoryLap = false; //this current loop is a victory lap. We will do the loop one more time. Toggled in the level listener function.

let imageLocations = [0,0]; // top left X location of the current score page/next score page

const metronomeSynth = new Tone.MembraneSynth().toDestination();
metronomeSynth.pitchDecay = 0;
metronomeSynth.release = 0.01;

function preload() {
}

function setup() {
    frameRate(60);
    createCanvas(window.innerWidth, window.innerHeight);
    centerX = width / 2;
    centerY = height / 2;
    imageLocations[1] = centerY;

    //resize loaded images to the current display screen
    // for (let i = 0; i < scorePages.length; i++) {
    //     scorePages[i].resize(width, height);//keep aspect ratio
    // }

    playerChooserDisplay();

}

//LOOK: Draw function

function draw() {
    background(255);
    if (scorePopulated == true) {
        showScore(scorePages[level], imageLocations[0]);
        showScore(scorePages[level+1], imageLocations[1]);
    }
    if (displayTime){
        timeDisplay(Tone.Transport.position);
    }
    progressDisplay(Tone.Transport.progress);
    //drawMetronome(convertBeat(Tone.Transport.position));
}



//LOOK: Listeners

socket.on('level', function (msg) {
    console.log(msg);
    level = msg;
});

socket.on('transportState', function (msg) {
    setTransportState(msg);
});

function chooseSaxVoice() {
    playerAssigned = playerChooser.selected();
    if (playerAssigned != 0) {
        socket.emit('myVoice', playerAssigned);
        loadScore();
        removeElements();
        Tone.start();
    }

    console.log(playerAssigned);
}

function loadScore() {
    return new Promise((resolve, reject) => {
        let p = playerAssigned.slice(0, 1); //the first letter of the voice name
        for (i = 0; i < numLevels; i++) {
            let path = 'assets/' + p + i.toString() + '.png';
            scorePages[i] = loadImage(path); //load the image
            scorePages[i].resize(width,height/2); //resize the image
        }
        scorePopulated = true;
    });
}

function showScore(_page, imgLocation) {
    if (playerAssigned !== 0 && level !== undefined) {
        image(_page, 0, imgLocation,width,height/2);
    }
}

function playerChooserDisplay() {
    playerChooser = createSelect();
    playerChooser.position(0, centerY);
    playerChooser.option('Select saxophone:')
    playerChooser.option('soprano');
    playerChooser.option('alto');
    playerChooser.option('tenor');
    playerChooser.option('bari');
    playerChooser.changed(chooseSaxVoice);
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


function timeDisplay(_currentPosition) {
    fill(0);
    //textFont(hudFont);
    textSize(20);
    stroke(0);
    strokeWeight(0);
    textAlign(CENTER);
    text(_currentPosition, 20, 20);
}

function progressDisplay(prog){
    fill(255,0,0);
    rectMode(CORNERS);
    let endYPos = width*prog;
    console.log(prog);
    rect(0,centerY-10,endYPos,centerY+10);
}

function drawMetronome(_beat) {
    let metronomeCircleSize = 20;
    strokeWeight(2);
    stroke(0);
    //draw empty circles for beats
    for (i = 0; i < 4; i++) {
        if (_beat == i) {
            fill(255, 0, 0);
        }
        else {
            noFill();
        }
        circle(metronomeCircleSize * i + metronomeCircleSize, height - metronomeCircleSize, metronomeCircleSize);
    }
}

//LOOK: Transport functions


const eightBarTimer = new Tone.Loop((time) => {
    if (level != 0){
        Tone.Transport.loop = true; //start looping after level 0.
    }
    if (advanceLevelOnNextLoop == true) {
        setTransportPosition(level);
        advanceLevelOnNextLoop = false;
        victoryLap = false;
    }
    if (victoryLap == true){
        advanceLevelOnNextLoop = true;
    }
}, "8m");

function scheduleStart(targetTime) {
    const currentTime = Date.now();
    const delay = targetTime - currentTime;

    if (delay > 0) {
        return delay;
    }
}

function setTransportPosition(_level) {
    //set the transport position to a multiple of 8 (for which page we're on).
    let newStartBar = _level * 8;
    let newStart = newStartBar.toString() + ":0:0";
    let newEnd = (newStartBar + 8).toString() + ":0:0";
    Tone.Transport.position = newStart;
    Tone.Transport.setLoopPoints(newStart, newEnd);
}

function setTransportState(_state) {
    let state = _state[0];
    let _targetTime = parseInt(_state[1]);
    if (state == 1) {
        //the difference between the Max designated time and the browser's time, converted to seconds
        let del = '+' + ((_targetTime - Date.now()) * 0.001).toString();
        Tone.Transport.start(del);
        eightBarTimer.start();
    }
    if (state == 0) {
        Tone.Transport.loop = false;
        Tone.Transport.stop();
        eightBarTimer.stop();
        eightBarTimer.cancel();
    }
}


//LOOK: Utilities

//function to extract the current beat from BeatsBarsSixteenths string
function convertBeat(_bbs) {
    const parts = _bbs.split(':');
    return parseInt(parts[1], 10);
}