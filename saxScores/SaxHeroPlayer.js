//Sax Hero Client - Player

let socket = io('/saxUser');
let latency;
let displayTime = false; //draw transport location for debugging

let centerX, centerY;

let playerChooser;

let playerAssigned = 0;

let scorePages = [];

let scorePopulated = false; //change flag when score images are loaded.

let numLevels = 18; //including intro and coda + blank for the last half page (loading image)

let introFlag; //when joining, query the introFlag state from the server.

let currentLevel = 0; //initialize with level 0, always.
let nextLevel; //"on deck" for when the victory lap ends

let connectedDisplayFlag = false; //only display "connected" if this is  true. When reloading page, need to get this triggered from the server
let progressDisplayFlag = false; //only display the progress bar if the transport is running
let advanceLevelOnNextLoop = false; //if true, the current loop is a "victory lap" and the next loop will be the next currentLevel.
let victoryLap = false; //this current loop is a victory lap. We will do the loop one more time. Toggled in the currentLevel listener function.

let imageLocations = [0, 0]; // top left X location of the current score page/next score page

let centerText; //shows notifications in the middle of the progress bar (connected, audience choosing teams, start, level up, victory lap!, '')
let winner; //the name of the winning voice. NULL until received from server (TODO: cleared on reset)

let currentMeasure; //the current measure of the loop

let scoreBuffer; //graphics buffersto hold the current page

const metronomeSynth = new Tone.MembraneSynth().toDestination();
metronomeSynth.pitchDecay = 0;
metronomeSynth.release = 0.01;

let scoreWidth;
let scoreHeight;

function preload() {
}

function setup() {
    frameRate(60);
    createCanvas(window.innerWidth, window.innerHeight);

    scoreWidth = width;
    scoreHeight = height;

    centerX = width / 2;
    centerY = height / 2;

    imageLocations[1] = centerY;

    scoreBuffer = createGraphics(scoreWidth, scoreHeight);


    playerChooserDisplay();

}

//LOOK: Instead of the p5 draw method...

function draw() {
    if (scorePopulated == true) {
        if (currentLevel == 17) {
            background(255);
            image(scoreBuffer, 0, 0);
            if (playerAssigned == winner) {
                centerText = 'You win! Take your solo!';
            }
            else {
                centerText = 'Game Over...maybe next time?';
            }
            return;
        }
        else {
            //showScore(scorePages[currentLevel], imageLocations[0]);
            image(scoreBuffer, 0, 0);
        }
        if (currentLevel < 17) { //don't display on coda level
            //showScore(scorePages[currentLevel + 1], imageLocations[1]);
            image(scoreBuffer, 0, 0);
        }
    }

    centerTextDisplay(centerText);

    // if (displayTime) {
    //     timeDisplay(Tone.Transport.position);
    // }

    if (progressDisplayFlag && currentLevel != 17) {
        progressDisplay(progressTimer.progress);
    }
}


// function syncWithTransport() {
//     if (Tone.Transport.state == 'started') {
//         requestAnimationFrame(drawMethods);
//     }
// }

//SECTION: Listeners

socket.on('level', function (msg) {
    if (msg != 1) {
        nextLevel = msg;
    }

    console.log('Next Level: ' + nextLevel);
    //ignore the next block if it's intro mode. Intro flag toggled off in timer.
    if (introFlag == false && victoryLap == false) {

        if (nextLevel == currentLevel) {
            advanceLevelOnNextLoop = false;
        }
        if (nextLevel == currentLevel + 1) {
            advanceLevelOnNextLoop = false;
            victoryLap = true;
        }
        if (nextLevel > currentLevel + 1) {
            victoryLap = true;
            advanceLevelOnNextLoop = false;
        }
        //see 8-bar timer function for flipping states
        if (nextLevel != currentLevel && nextLevel != 1) {
            centerText = 'level up!';
        }
    }
});

socket.on('winner', function (msg) {
    nextLevel = 17; //everyone advances to Level 17 when the winner is delcared
    advanceLevelOnNextLoop = false;
    victoryLap = true;
    winner = msg;
    console.log('winner is: ' + msg);
});

socket.on('reset', function () {
    location.reload();
});

socket.on('gameStartedFlag', function () {

})

socket.on('introFlag', function (msg) {
    if (msg == 0) {
        introFlag = false;
        nextLevel = 1;
    }
    if (msg == 1) {
        currentLevel = 0;
        introFlag = true;
    }
});

socket.on('transportState', function (msg) {
    setTransportState(msg);
});

function chooseSaxVoice() {
    playerAssigned = playerChooser.selected();
    if (playerAssigned != 0) {
        socket.emit('myVoice', playerAssigned);
        removeElements();
        loadScore();
        Tone.start();
        document.title = "Player: " + playerAssigned;
        connectedDisplayFlag = true;

    }
}

function loadScore() {
    let loading = new Promise(function (resolve, reject) {
        let p = playerAssigned.slice(0, 1); //the first letter of the voice name
        let imagePromises = []; //array to store promises for loading images

        for (i = 0; i < numLevels; i++) {
            let path = 'assets/' + p + i.toString() + '.png';
            imagePromises.push(new Promise((resolve) => {
                scorePages[i] = loadImage(path);
                scorePages[i].resize(scoreWidth, scoreHeight / 2);
                resolve(); //resolve promise for this image

            }));
        }

        Promise.all(imagePromises).then(resolve).catch(reject);
    });

    return loading.then(function () {
        updateScoreBuffer(0);
        scorePopulated = true;
        console.log('score loaded');
    }).catch(function (error) {
        console.error("Error loading images: ", error);
    });
}

//background(255);
//requestAnimationFrame(drawMethods);


function updateScoreBuffer(p) { //update the score image.
    scoreBuffer.clear();
    scoreBuffer.background(255);
    scoreBuffer.image(scorePages[p], 0, imageLocations[0], scoreWidth, scoreHeight / 2);
    if (p < 17) {
        scoreBuffer.image(scorePages[p + 1], 0, imageLocations[1], scoreWidth, scoreHeight / 2);
    }
}

// function showScore(_page, imgLocation) {
//     //if (playerAssigned !== 0 && currentLevel !== undefined) {
//     image(_page, 0, imgLocation, width, height / 2);
//     //}
// }

function centerTextDisplay(_centerText) {
    let centertext = _centerText;

    if (connectedDisplayFlag == true) {
        centertext = 'Connected: ' + playerAssigned;
    }

    if (winner && advanceLevelOnNextLoop == true) {
        centertext = ('Winner: ' + winner);
    }
    if (centertext) {
        noStroke();
        fill(0);
        textSize(32);
        textAlign(CENTER);
        text(centertext, width / 2, height / 2);
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
    //let endYPos = width * prog; //This is for a smooth scrolling bar (original design).
    //rect(0, centerY - 20, endYPos, centerY + 20);
    let eighthWidth = width * 0.125;
    rect(eighthWidth * currentMeasure, centerY - 20, eighthWidth * (currentMeasure + 1), centerY + 20);
    if (introFlag == false) {
        levelDisplay(progressColor);
    }
}

function levelDisplay(_progressColor) {
    let levelColor = _progressColor;
    let rightLevelDisplay = currentLevel;
    //current level display
    textSize(48);
    fill(levelColor[0], levelColor[1], levelColor[2], 255);
    stroke(0);
    strokeWeight(3);
    textAlign(LEFT);
    text(currentLevel, 10, centerY);

    //next level display
    textAlign(RIGHT);
    if (advanceLevelOnNextLoop == true) {
        rightLevelDisplay = nextLevel;
    }
    text(rightLevelDisplay, width - 10, centerY);
}



//SECTION: Transport functions


const eightBarTimer = new Tone.Loop((time) => { //runs at the beginning of every 8 bar loop.

    if (currentLevel == 0 && nextLevel == 1) {
        advanceLevelOnNextLoop = false;
        victoryLap = false;
    }

    if (introFlag == false) {
        if (victoryLap == false) {
            centerText = '';
        }

        if (advanceLevelOnNextLoop == true) {
            currentLevel = nextLevel;
            updateScoreBuffer(currentLevel);
            setTransportPosition(currentLevel);
            advanceLevelOnNextLoop = false;
            victoryLap = false;
            if (currentLevel == 17) {
                Tone.Transport.stop('+0.25');
                centerText = ' ';
            }
        }

        if (victoryLap == true) {
            centerText = 'victory lap';
            advanceLevelOnNextLoop = true;
        }
    }
}, "8m");

const progressTimer = new Tone.Loop((time) => {
    //always loop 8 measure segments, regardless of the other timer loop being on or off
    //nothing happens in here, just use to track progress for drawing the little display
    currentMeasure = -1; //reset the current measure. -1 so that progressTimerBeats can advance it to 0.

}, "8m");

const progressTimerBeats = new Tone.Loop((time) => {
    currentMeasure++; //increase the measure count
}, "1m");

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
        toggleLoop();
        updateScoreBuffer(0);
        //drawLoop.start();
        eightBarTimer.start();
        progressTimer.start();
        progressTimerBeats.start();
        progressDisplayFlag = true;
        connectedDisplayFlag = 0;
        //requestAnimationFrame(syncWithTransport); //kick off the request animation frame recursion
        //resetIntroFlag();
    }
    if (state == 0) {
        Tone.Transport.loop = false;
        progressDisplayFlag = false;
        Tone.Transport.stop();
        eightBarTimer.stop();
        eightBarTimer.cancel();
        progressTimer.stop();
        progressTimer.cancel();
        progressTimerBeats.stop();
        progressTimerBeats.cancel();
    }
}
// function resetIntroFlag(){ //if we start over (at beginning), the intro flag should reset to true.
//     Tone.Transport.schedule(function(){
//         introFlag = true;
//     }, "0:0:1");
// }
// const drawLoop = new Tone.Loop((time) => {
//     drawMethods();
// }, "8n").start(0);



function toggleLoop() {
    Tone.Transport.schedule(function () {
        if (currentLevel == 0) { //after we enter level 1, should already be looping.
            currentLevel = 1;
            nextLevel = 1;
            setTransportPosition(1);
            Tone.Transport.loop = true;
            introFlag = false;
            victoryLap = false;
            advanceLevelOnNextLoop = false;
        }
    }, "8:0:0"); //start looping at 8:0:0, stop looping at (coda)
}

//LOOK: Utilities

//function to extract the current beat from BeatsBarsSixteenths string
function convertBeat(_bbs) {
    const parts = _bbs.split(':');
    return parseInt(parts[1], 10);
}