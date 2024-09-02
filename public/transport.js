//Functions for controlling the transport. And other audio playback functions.

//Eight Bar Timer - for synchronizing level changes

const eightBarTimer = new Tone.Loop((time) => {
    if (currentLevel != 0) {
        Tone.Transport.loop = true; //start looping after level 0.
        numberOfLoops++;//increase the number of loops by one
        console.log('Level' + currentLevel + ': ' + numberOfLoops);
    }
    if (advanceLevelOnNextLoop == true) {
        numberOfLoops = 0;
        setTransportPosition(nextLevel);
        levelUpOpacity = 255;
        advanceLevelOnNextLoop = false;
        victoryLap = false;
        currentLevel = nextLevel;
    }
    if (victoryLap == true) {
        levelUpOpacity = 255;
        advanceLevelOnNextLoop = true;
    }
    for (let i = 0; i < thumblines.length; i++){
        thumblines[i].fill = [255,255,255]; //TODO: if on the first part of the beat, how to get around?
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
        taps = []; //to keep any taps out of the calculation that occured before the timer started
        levelUpOpacity = 255;
        //the difference between the Max designated time and the browser's time, converted to seconds
        let del = '+' + ((_targetTime - Date.now()) * 0.001).toString();
        Tone.Transport.start(del);
        eightBarTimer.start(); //TODO: Is this blocking?
    }
    if (state == 0) {
        Tone.Transport.loop = false;
        Tone.Transport.stop();
        eightBarTimer.stop();
        eightBarTimer.cancel();
        playhead.reset();
    }
}

function shoePlay(shoeSoundChoose) {
    //play the left shoe sound if the touch is to the left of the center, otherwise play right
    //TODO: Fade out sound over a 3 levels.
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
        shoeVolume -= 12; //decrease every level up
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
