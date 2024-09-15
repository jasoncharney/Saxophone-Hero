//Functions for controlling the transport. And other audio playback functions.

//Eight Bar Timer - for synchronizing level changes

function toggleLoop() {
    Tone.Transport.schedule(function () {
        if (currentLevel == 0) {
            currentLevel = 1;
            nextLevel = 1;
            setTransportPosition(1);
            Tone.Transport.loop = true;
            introFlag = false;
            pointsLoop = 0;
        }
    }, "8:0:0");
}




const eightBarTimer = new Tone.Loop((time) => { //runs at the top of each loop

    // if (thumblineArray.length == 0) { //if it's empty to start with, let's populate with the current level notes.
    //     thumblineArray.push(new ThumblineBlock(noteObject, calculateTransportRange(currentLevel), 0));
    // }

    // let nextPositionInThumblineArray = thumblineArray.length;

    // thumblineArray.push(new ThumblineBlock(noteObject, calculateTransportRange(nextLevel), nextPositionInThumblineArray));



    if (currentLevel == 0 && nextLevel == 1) {
        advanceLevelOnNextLoop = false;
        victoryLap = false;
    }

    if (introFlag == false) {
        addToThumblineBuffer(nextLevel, 16);
        accuracyLoop = pointsLoop / notesPerLevel[currentLevel];
        pointsnotification = new Pointsnotification(accuracyLoop, 1);
        pointsLoop = 0;
        accuracyLoop = 0;
        numberOfLoops++;//increase the number of loops by one

        if (advanceLevelOnNextLoop == true) { //this is actually the beginning of a new level.
            currentLevel = nextLevel;
            setTransportPosition(currentLevel);

            if (currentLevel == 17) {
                hudnotification = new Hudnotification(winner + ' team wins!', 0.25);
            }
            dimShoeVolume(); //decrease shoe volume
            numberOfLoops = 0;
            advanceLevelOnNextLoop = false;
            victoryLap = false;
        }

        if (victoryLap == true) {
            advanceLevelOnNextLoop = true;
            hudnotification = new Hudnotification('Victory Lap!', 5);
        }

    }

}, "8m");

const endOfEightBarTimer = new Tone.Loop((time) => { //runs on the last 8th note of each loop

    for (let i = 0; i < thumblines.length; i++) {
        thumblines[i].fill = [255, 255, 255];
    }
    sendAccuracy();
    console.log('points: ' + points);
}, "8m");

// function scheduleStart(targetTime) {
//     const currentTime = Date.now();
//     const delay = targetTime - currentTime;

//     if (delay > 0) {
//         return delay;
//     }
// }

function setTransportPosition(_level) {
    //set the transport position to a multiple of 8 (for which page we're on).
    let newStartBar = _level * 8;
    let newStart = newStartBar.toString() + ":0:0";
    let newEnd = (newStartBar + 8).toString() + ":0:0";

    let newStartBarTime = new Tone.Time(newStart).toSeconds(); //convert to seconds
    let newEndBarTime = new Tone.Time(newEnd).toSeconds();

    //populateLoop(1)
    Tone.Transport.position = newStart;
    Tone.Transport.setLoopPoints(newStart, newEnd);
    if (_level == 17) {
        Tone.Transport.loop = false;
        Tone.Transport.stop("+8");
    }
}

//just for getting the time ranges for new transport loop
function calculateTransportRange(_level) {
    let newStartBar = _level * 8;
    let newStart = newStartBar.toString() + ":0:0";
    let newEnd = (newStartBar + 8).toString() + ":0:0";

    let newStartBarTime = new Tone.Time(newStart).toSeconds(); //convert to seconds
    let newEndBarTime = new Tone.Time(newEnd).toSeconds();

    return [newStartBarTime, newEndBarTime];
}


function setTransportState(_state) {
    console.log(_state);
    let newStart = performance.now() + performance.timeOrigin;
    console.log(newStart);
    console.log(Date.now());
    let state = _state[0];
    let _targetTime = parseInt(_state[1]);
    if (state == 1) {
        taps = []; //to keep any taps out of the calculation that occured before the timer started
        hudnotification = new Hudnotification('Get ready!', 0.5);
        //the difference between the Max designated time and the browser's time, converted to seconds
        let del = '+' + (((_targetTime - Date.now()) * 0.001)).toString();
        console.log(del);
        Tone.Transport.start(del);
        eightBarTimer.start();
        endOfEightBarTimer.start("+7:3:2");
        toggleLoop();
    }
    if (state == 0) {
        resetTransport();
    }
}

function getHighPrecisionTime() {
    let baseTime = Date.now();
    //let preciseTime = baseTime + (performance.now() % 1000);
    return baseTime + (performance.now() % 1000);
}


function resetTransport() {
    Tone.Transport.loop = false;
    Tone.Transport.stop();
    eightBarTimer.stop();
    eightBarTimer.cancel();
    playhead.reset();
}

function demoLoop() {
    setTransportPosition(0);
    Tone.Transport.loop = true;
    Tone.Transport.start();
}

function shoePlay(shoeSoundChoose) {
    //play the left shoe sound if the touch is to the left of the center, otherwise play right
    if (shoeSoundChoose < centerX) {
        shoeSampler.triggerAttackRelease("C#4", 0.2);
    }
    if (shoeSoundChoose >= centerX) {
        shoeSampler.triggerAttackRelease("C4", 0.2);
    }
}

function dimShoeVolume() {
    if (currentLevel <= 1) {
        shoeVolume = 0;
    }
    else {
        shoeVolume = -currentLevel * 3; //-6 dB each level.
    }
    shoeSampler.volume.value = shoeVolume;
}

//Metronome functions.

const metronomeSynth = new Tone.MembraneSynth().toDestination();
metronomeSynth.pitchDecay = 0;
metronomeSynth.release = 0.01;

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



function readableTime(epochTime) {
    // Create a new Date object using the epoch time
    let date = new Date(epochTime);

    // Extract date and time components
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    let milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Format the date and time as a string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}
