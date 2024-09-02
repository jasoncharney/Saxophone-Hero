//Sax Hero Client - Player

let socket = io('/saxUser');
let latency;
let displayTime = false; //draw transport location for debugging

let centerX, centerY;

let playerChooser;

let playerAssigned = 0;

let scorePages = [];

let scorePopulated = false; //change flag when score images are loaded.

let numLevels = 18; //including intro and coda

let currentLevel;
let nextLevel; //"on deck" for when the victory lap ends

let connectedDisplayFlag = false; //only display "connected" if this is  true. When reloading page, need to get this triggered from the server
let progressDisplayFlag = false; //only display the progress bar if the transport is running
let advanceLevelOnNextLoop = false; //if true, the current loop is a "victory lap" and the next loop will be the next currentLevel.
let victoryLap = false; //this current loop is a victory lap. We will do the loop one more time. Toggled in the currentLevel listener function.

let imageLocations = [0, 0]; // top left X location of the current score page/next score page

let centerText; //shows notifications in the middle of the progress bar (connected, audience choosing teams, start, level up, victory lap!, '')
let winner; //the name of the winning voice. NULL until received from server (TODO: cleared on reset)

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


    playerChooserDisplay();

}

//LOOK: Draw function

function draw() {
    background(255);
    if (scorePopulated == true) {
        showScore(scorePages[currentLevel], imageLocations[0]);
        if (currentLevel < 17) { //don't display on coda level
            showScore(scorePages[currentLevel + 1], imageLocations[1]);
        }
    }

    centerTextDisplay(centerText);

    // if (displayTime) {
    //     timeDisplay(Tone.Transport.position);
    // }

    if (progressDisplayFlag) {
        progressDisplay(progressTimer.progress);
    }
}



//LOOK: Listeners

socket.on('level', function (msg) {
    console.log('next level: ' + msg);
    if (msg == 0) {
        currentLevel = 0;
    }
    nextLevel = msg;
    advanceLevelOnNextLoop = false;
    victoryLap = true;
    if (msg != 0) {
        centerText = 'level up!';
    }
});

socket.on('winner', function (msg) {
    nextLevel = 17;
    advanceLevelOnNextLoop = false;
    victoryLap = true;
    winner = msg;
    console.log('winner is: ' + msg);
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
        connectedDisplayFlag = true;
    }
    console.log(playerAssigned);
}

function loadScore() {
    return new Promise((resolve, reject) => {
        let p = playerAssigned.slice(0, 1); //the first letter of the voice name
        for (i = 0; i < numLevels; i++) {
            let path = 'assets/' + p + i.toString() + '.png';
            scorePages[i] = loadImage(path); //load the image
            scorePages[i].resize(width, height / 2); //resize the image
        }
        scorePopulated = true;
    });
}

function showScore(_page, imgLocation) {
    if (playerAssigned !== 0 && currentLevel !== undefined) {
        image(_page, 0, imgLocation, width, height / 2);
    }
}

function centerTextDisplay(_centerText) {
    let centertext = _centerText;

    if (connectedDisplayFlag == true) {
        centertext = 'connected';
    }

    if (winner && advanceLevelOnNextLoop == true) {
        centertext = ('Winner: ' + winner);
    }

    noStroke();
    fill(0);
    textSize(32);
    textAlign(CENTER);
    text(centertext, width / 2, height / 2);
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


function timeDisplay(_currentPosition) {
    fill(0);
    //textFont(hudFont);
    textSize(20);
    stroke(0);
    strokeWeight(0);
    textAlign(LEFT);
    text(_currentPosition, 30, 30);
}

function progressDisplay(prog) {
    //progress bar
    let progressColor;
    if (advanceLevelOnNextLoop == true) {
        progressColor = [0, 255, 0]; //green
    }
    if (advanceLevelOnNextLoop == false) {
        progressColor = [255, 0, 0]; //red
    }
    fill(progressColor[0], progressColor[1], progressColor[2], 127);
    noStroke();
    rectMode(CORNERS);
    let endYPos = width * prog;
    rect(0, centerY - 10, endYPos, centerY + 10);
    //current level display
    textSize(48);
    fill(progressColor[0], progressColor[1], progressColor[2], 255);
    stroke(0);
    strokeWeight(3);
    textAlign(LEFT);
    text(currentLevel, 10, centerY);
    //next level display
    textAlign(RIGHT);
    if (advanceLevelOnNextLoop == true) {
        text(nextLevel, width - 10, centerY);
    }
    else {
        text(currentLevel, width - 10, centerY);
    }

}



//LOOK: Transport functions


const eightBarTimer = new Tone.Loop((time) => {
    if (currentLevel != 0) {
        Tone.Transport.loop = true; //start looping after currentLevel 0.
    }
    if (advanceLevelOnNextLoop == true) {
        setTransportPosition(currentLevel);
        advanceLevelOnNextLoop = false;
        victoryLap = false;
        centerText = '';
        currentLevel = nextLevel;
    }
    if (victoryLap == true) {
        centerText = 'victory lap';
        advanceLevelOnNextLoop = true;
    }
}, "8m");

//always loop 8 measure segments, regardless of the other timer loop being on or off
const progressTimer = new Tone.Loop((time) => {
    //nothing happens in here, just use to track progress
}, "8m");

function scheduleStart(targetTime) {
    const currentTime = Date.now();
    const delay = targetTime - currentTime;

    if (delay > 0) {
        return delay;
    }
}

//TODO: stop the transport loop after everyone jumps to the coda

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
        progressTimer.start();
        progressDisplayFlag = true;
        connectedDisplayFlag = 0;
    }
    if (state == 0) {
        Tone.Transport.loop = false;
        progressDisplayFlag = false;
        Tone.Transport.stop();
        eightBarTimer.stop();
        eightBarTimer.cancel();
        progressTimer.stop();
        progressTimer.cancel();
    }
}


//LOOK: Utilities

//function to extract the current beat from BeatsBarsSixteenths string
function convertBeat(_bbs) {
    const parts = _bbs.split(':');
    return parseInt(parts[1], 10);
}