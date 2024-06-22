//Sax Hero Client - Player

let socket = io('/saxUser');
let latency;

let sentTime = Date.now();
socket.emit("sentTime",JSON.stringify({sentTime}));
console.log(sentTime);

let centerX, centerY;

let playerChooser;

let playerAssigned = 0;

let scorePages = [];

let numLevels = 2;

let currentLevel;

const metronomeSynth = new Tone.MembraneSynth().toDestination();
metronomeSynth.pitchDecay = 0;
metronomeSynth.release = 0.01;

function preload() {
    for (let i = 0; i < numLevels; i++) {
        scorePages[i] = loadImage('assets/' + i.toString() + '.png');
        console.log(i.toString());
    }
}

function setup() {
    frameRate(60);
    createCanvas(window.innerWidth, window.innerHeight);
    centerX = width / 2;
    centerY = height / 2;

    //resize loaded images to the current display screen
    for (let i = 0; i < scorePages.length; i++) {
        scorePages[i].resize(width, height);//keep aspect ratio
    }

    playerChooserDisplay();

}

function draw() {
    background(255);
    showScore(scorePages[currentLevel]);
    drawMetronome(convertBeat(Tone.Transport.position));
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

//LOOK: Listeners
socket.on('latency', function(msg){
    latency = msg;
});

socket.on('changeLevel', function (msg) {
    currentLevel = msg;
});

socket.on('transportState', function (msg) {
    if (msg == 1) {
        let latencySeconds = latency * 0.001;
        Tone.Transport.start("+"+JSON.stringify(latencySeconds));
        //playMetronome(msg);
    }
    if (msg == 0) {
        Tone.Transport.stop();
        //playMetronome(msg);
    }
});

function chooseSaxVoice() {

    playerAssigned = playerChooser.selected();

    if (playerAssigned != 0) {
        socket.emit('myVoice', playerAssigned);
        //loop();
        removeElements();
        Tone.start();
    }

    console.log(playerAssigned);
}

function showScore(_page) {
    if (playerAssigned !== 0 && currentLevel !== undefined) {
        image(_page, 0, 0);
    }
}

function playerChooserDisplay() {
    playerChooser = createSelect();
    playerChooser.position(0, centerY);
    //playerChooser.size(120);
    playerChooser.option('Select saxophone:')
    playerChooser.option('soprano');
    playerChooser.option('alto');
    playerChooser.option('tenor');
    playerChooser.option('bari');
    playerChooser.changed(chooseSaxVoice);
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

//LOOK: Utilities

//function to extract the current beat from BeatsBarsSixteenths string
function convertBeat(_bbs) {
    const parts = _bbs.split(':');
    return parseInt(parts[1], 10);
}

function calculateLatency(){

}
