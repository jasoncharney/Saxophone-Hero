let initialized = 0;
let progress = 0;
let notesObject = soprano.notes;
let currentLevel = 1;//current 8 bars to loop, corresponds to the player's level
let thumblines = [];

let playHead; //the position in ticks of the timeline. Used for drawing hashes for the
let playWindow; //the span of time we're viewing in the window right now

adjustLoop(currentLevel);

Tone.Transport.bpm.value = 120;
Tone.Transport.PPQ.value = 480;
Tone.Transport.loop = true;

let playWindowLength =  Tone.Time("1m").toSeconds(); //adjust the window length

console.log(playWindowLength);

let printPosition = new Tone.Loop(function (time) {
    console.log(Tone.Transport.position);
}, "4n").start(0);


function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    for (let i = 0; i < notesObject.length; i++) {
        thumblines.push(new Thumbline(notesObject[i].time, notesObject[i].duration, notesObject[i].midi));
    }
    for (let thumbline of thumblines) {
        thumbline.print();
    }
}

function draw() {
    background(255);
    stroke(0);
    line(0, Tone.Transport.progress * height, width, Tone.Transport.progress * height);

}

function mousePressed() {
    if (initialized == 0) {
        Tone.start();

        Tone.Transport.start();
        //playLoop.start(0);
        initialized = 1;
    }
    if (initialized == 1) {
        calcProgress();
        console.log(progress, Tone.Transport.progress);
        adjustLoop(currentLevel);
        console.log(Tone.Transport.loopStart, Tone.Transport.loopEnd);
    }
}

function calcProgress() {
    progress = Tone.Transport.toTicks(Tone.Transport.position);
}

function adjustLoop(_level) {
    let levelIndex = currentLevel - 1;
    let newLoopStart = (levelIndex * 8).toString() + ":0:0";
    let newLoopEnd = (levelIndex * 8 + 8).toString() + ":0:0";
    Tone.Transport.setLoopPoints(newLoopStart, newLoopEnd);
    Tone.Transport.start();
}

function updateThumblines() {

}

class Thumbline {
    constructor(position, duration, note) {
        this.position = position;
        if (duration < 1) { //anything shorter than a half note will display as the same value - assigned from the size of the screen.
            this.duration = -1;
        }
        if (duration >= 1) {//holding longer than a half note, this duration will override
            this.duration = duration;
        }
        if (note == 60) {
            this.thumb = 0;
        }
        if (note == 61) {
            this.thumb = 1;
        }
    }

    print() {
        console.log(this.position, this.duration, this.thumb);
    }

    move(tick) {
        this.y = (tick / totalTicks) * trackHeight;
    }

    display(myNumber) {
        fill(0);
        rect(width / myNumber,)
    }
}
