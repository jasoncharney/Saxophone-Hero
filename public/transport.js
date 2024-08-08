//Functions for controlling the transport.

function scheduleStart(targetTime) {
    const currentTime = Date.now();
    const delay = targetTime - currentTime;

    if (delay > 0) {
        return delay;
    }
}

function setTransportPosition(_level) {
    //set the transport position to a multiple of 8 (for which page we're on). TODO: get the victorylap logic in here though
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
        Tone.Transport.loop = true;
        //the difference between the Max designated time and the browser's time, converted to seconds
        let del = '+' + ((_targetTime - Date.now()) * 0.001).toString();
        Tone.Transport.start(del);
        eightBarTimer.start();
    }
    if (state == 0) {
        Tone.Transport.stop();
        eightBarTimer.stop();
        eightBarTimer.cancel();
        playhead.reset();
    }
}

