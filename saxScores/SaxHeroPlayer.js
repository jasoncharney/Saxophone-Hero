//Sax Hero Client - Player

let socket = io('/saxUser');
let latency;

let centerX, centerY;

let playerChooser;

let playerAssigned = 0;

let scorePages = [];

let scorePopulated = false; //change flag when score images are loaded.

let numLevels = 6; //including intro

let currentLevel;

const metronomeSynth = new Tone.MembraneSynth().toDestination();
metronomeSynth.pitchDecay = 0;
metronomeSynth.release = 0.01;

function preload() {
    // for (let i = 0; i < numLevels; i++) {
    //     scorePages[i] = loadImage('assets/' + i.toString() + '.png');
    // }
}

function setup() {
    frameRate(60);
    createCanvas(window.innerWidth, window.innerHeight);
    centerX = width / 2;
    centerY = height / 2;

    //resize loaded images to the current display screen
    // for (let i = 0; i < scorePages.length; i++) {
    //     scorePages[i].resize(width, height);//keep aspect ratio
    // }

    playerChooserDisplay();

}

function draw() {
    background(255);
    if (scorePopulated == true) {
        showScore(scorePages[1]);
    }
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

socket.on('level', function (msg) {
    console.log(msg);
    currentLevel = msg;
});

socket.on('transportState', function (msg) {
    if (msg == 1) {
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
        populateScore();
        removeElements();
        Tone.start();
    }

    console.log(playerAssigned);
}

function populateScore() {
    let p = playerAssigned.slice(0, 1); //the first letter of the voice name
    for (i = 0; i < numLevels; i++) {
        let path = 'assets/' + p + i.toString() + '.png';
        scorePages[i] = new Image(window.innerWidth,window.innerHeight);
        scorePages[i].src = path;
    }
    scorePopulated = true;
    console.log(scorePages);
}
//TODO: START HEREEEEE. async function
function loadScore(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Failed to load image: ${url}`);
        img.src = url;
    });
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