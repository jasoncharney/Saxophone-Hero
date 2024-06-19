
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

// for (var i = 0; i < soprano1.tracks[0].notes.length; i++){
//     notes.push({notesObject[i].midi,notesObject[i].ticks[i],notesObject[i].durationTicks});
// }

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    ticksY = totalTicks / window.innerHeight;
    hashWidth = width*0.25;

    calcTrackHeight(notesObject);
    leftTrack = createGraphics(hashWidth, trackHeight);
    rightTrack = createGraphics(hashWidth, trackHeight);

    createNoteSquares();
    // createThumblines();
    image(leftTrack, width * 0.33, 0);
    image(rightTrack, width * 0.66, 0);
}

function draw() {
    background('green');
    progress = Tone.Transport.toTicks(Tone.Transport.position) / totalTicks;
    crossMarkDraw(0.66);
    moveNoteSquares(1 - progress);
}

function mousePressed() {
    if (initialized == 0) {
        Tone.start();
        Tone.Transport.start();
        initialized = 1;
    }
    // if (initialized == 1) {
    //     progress = Tone.Transport.toTicks(Tone.Transport.position)/totalTicks;
    //     console.log(progress);
    // }
}

function crossMarkDraw(_pos) {
    let pos = _pos * height; //where to draw the center line (by percentage)
    strokeWeight(5);
    stroke(255,100);
    strokeCap(SQUARE);
    setLineDash([5,10]);
    line(0, pos, width, pos);
    line(width / 2, 0, width / 2, height);
}

function calcTrackHeight( _notesObject){
let tempNotes = _notesObject;  //search the notes object for the last note + its duration

trackHeight = height + ((tempNotes[tempNotes.length-1].durationTicks/totalTicks) * height);
console.log(height,trackHeight);
}

function calcProgress() {
    progress = Tone.Transport.toTicks(Tone.Transport.position) / totalTicks;
}

function moveNoteSquares(_progress) {
    let pos = height - _progress * height;
    image(leftTrack, width * 0.125, pos);
    image(rightTrack, width * 0.625, pos);
}


function createNoteSquares() {
    for (var i = 0; i < notesObject.length; i++) {
        let yPos = height - (notesObject[i].ticks / totalTicks) * height;
        let yHeight = (notesObject[i].durationTicks / totalTicks) * height;

        if (notesObject[i].midi == 72) {
            leftTrack.fill(random(255), random(255), random(255));
            leftTrack.rectMode(CORNER);
            leftTrack.rect(0, yPos, hashWidth, yHeight);
        }
        if (notesObject[i].midi == 69) {
            rightTrack.fill(random(255), random(255), random(255));
            rightTrack.rectMode(CORNER);
            rightTrack.rect(0, yPos, hashWidth, yHeight);
        }
    }
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