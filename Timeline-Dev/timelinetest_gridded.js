
let initialized = 0;
let progress = 0;

let totalTicks = soprano1.tracks[0].endOfTrackTicks;
let ticksY; //the height divided by number of ticks: convert ticks to vertical pixels.
let crossMark; //the point at which the lines cross the playhead, where you tap each thumb.
let notesObject = soprano1.tracks[0].notes;
let notesConstruct = [];
let leftTrack, rightTrack; //empty graphics buffers for the scrolling notes

//the midi note numbers that correspond to each thumb (left or right)
let noteL = 72;
let noteR = 69;

let hashWidth; //the width of the graphics buffer to draw hashmarks

let trackHeight; //calculate the vertical height of the track image

let laneHeight; //height from the top of the screen to the crossmark (events scroll down)

const synth = new Tone.Synth().toDestination();

const playLoop = new Tone.Loop((time) => {
    synth.triggerAttackRelease("C4","8n",time);
}, "16n");

// for (var i = 0; i < soprano1.tracks[0].notes.length; i++){
//     notes.push({notesObject[i].midi,notesObject[i].ticks[i],notesObject[i].durationTicks});
// }

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    ticksY = totalTicks / window.innerHeight;
    hashWidth = width*0.25;
    crossMark = height * 0.66;

    calcTrackHeight(notesObject);
    leftTrack = createGraphics(hashWidth, trackHeight);
    rightTrack = createGraphics(hashWidth, trackHeight);

    createNoteSquares();
    //noLoop();
    // createThumblines();
    //image(leftTrack, width * 0.33, 0);
    //image(rightTrack, width * 0.66, 0);
}

function draw() {
    background('green');
    calcProgress();
    createNoteSquares();
    wrapNoteSquares();
    crossMarkDraw();
}

function mousePressed() {
    if (initialized == 0) {
        Tone.start();
        Tone.Transport.bpm.value = 120;
        Tone.Transport.start();
        playLoop.start(0);
        initialized = 1;
    }
    if (initialized == 1) {
        console.log(progress);
    }
}

function crossMarkDraw() {
    strokeWeight(5);
    stroke(255,100);
    strokeCap(SQUARE);
    setLineDash([5,10]);
    line(0, crossMark, width, crossMark);
    line(width / 2, 0, width / 2, height);
}

function calcTrackHeight( _notesObject){

let tempNotes = _notesObject;  //search the notes object for the last note + its duration

trackHeight = height + ((tempNotes[tempNotes.length-1].durationTicks/totalTicks) * height); //adjust the trackHeight so the last note square can extend the full length of the buffer
}

function calcProgress() {
    progress = (Tone.Transport.toTicks(Tone.Transport.position) / totalTicks) % 1;
}

function moveNoteSquares(_progress) {
    push();
    translate(0,_progress*trackHeight);
    push();
    translate(width/2,height);
    rotate(PI);
    image(leftTrack, 0, 0);
    pop();

    push();
    translate(width,height);
    rotate(PI);
    image(rightTrack, 0, 0);
    pop();
    pop();
}


function createNoteSquares() {

    for (var i = 0; i < notesObject.length; i++) {
        let yPos = (notesObject[i].ticks / totalTicks) * height;
        let yHeight = (notesObject[i].durationTicks / totalTicks) * height;

        if (yPos + yHeight > trackHeight){
            yPos = -yPos;
        }

        if (notesObject[i].midi == noteL) {
            leftTrack.fill(255);
            leftTrack.rectMode(CORNER);
            leftTrack.rect(0, yPos, hashWidth, yHeight);
        }
        if (notesObject[i].midi == noteR) {
            rightTrack.fill(255);
            rightTrack.rectMode(CORNER);
            rightTrack.rect(0, yPos, hashWidth, yHeight);
        }
    }

}
function wrapNoteSquares(){//wrap the whole image buffer around to follow the progress
push();
translate(0,progress*height);
image(leftTrack,width*0.33,0);
image(rightTrack,width*0.66,0);
pop();
push();
translate(0,progress*height);
image(leftTrack,width*0.33,-height);
image(rightTrack,width*0.66,-height); //wrap the image around!
pop();
}
//draw the hashmarks as dotted lines like on a football field.
function setLineDash(list) {
    drawingContext.setLineDash(list);
  }

// function createThumblines(){
//     for (let i = 0; i < notesObject.length; i++){
//         notesConstruct[i] = new Thumbline(notesObject[i].ticks, notesObject[i].durationTicks, notesObject[i].midi);
//         console.log(notesConstruct[i].position, notesConstruct[i].duration, notesConstruct[i].thumb, notesConstruct[i].durationProp);
//     }
// }



// class Thumbline {
//     constructor(tickPosition, tickDuration, note){ //get the timeline position, duration, and midi note number from each event
//         this.position = tickPosition;
//         this.duration = tickDuration;
//         this.note = note;
//     }

//     static leftLaneCenter = width * 0.25; //where's the center of the left thumb lane (vertically)
//     static rightLaneCenter = width * 0.75; //where's the center of the right thumb lane (vertically)

//     get thumb(){ //which thumb should the drawing go?
//         return this.chooseThumb();
//     }
//     chooseThumb(){ //0 = left thumb, 1 = right thumb
//         if (this.note == noteL){
//             return 0;
//         }
//         if (this.note == noteR){
//             return 1;
//         }
//     }

//     get durationProp(){ //how much of the total sequence the note takes up
//         return this.durationPropCalc();
//     }
//     durationPropCalc(){
//         return this.duration/totalTicks;
//     }

//     get rectPos(){//calculate the center of the box to draw
//         return this.rectPosCalc(this.thumb);
//     }

//     rectPosCalc(_thumb){
        
//     }

// }