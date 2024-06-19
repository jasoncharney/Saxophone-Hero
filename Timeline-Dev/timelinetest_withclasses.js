
let initialized = 0;
let progress = 0;

var totalTicks = soprano1.tracks[0].endOfTrackTicks;
var trackHeight; //the height from the top of the screen to the cross hash where the current note passes the timeline
let ticksY; //the height divided by number of ticks: convert ticks to vertical pixels.
let crossMark = 0.66; //the point at which the lines cross the playhead, where you tap each thumb (percentage down the vertical area from the top).
let notesObject = soprano1.tracks[0].notes;
let thumblines = [];
let leftTrack, rightTrack; //empty graphics buffers for the scrolling notes

//the midi note numbers that correspond to each thumb (left or right)
let noteL = 72;
let noteR = 69;

var hashWidth; //the width of the graphics buffer to draw hashmarks

// for (var i = 0; i < soprano1.tracks[0].notes.length; i++){
//     notes.push({notesObject[i].midi,notesObject[i].ticks[i],notesObject[i].durationTicks});
// }

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    ticksY = Math.round(totalTicks / (crossMark * height));
    createThumblines();
    rectMode(CORNER);
}

function draw() {
    background('green');
    progress = calcProgress();
    drawThumblines(calcProgress());
    crossMarkDraw(crossMark);
}

function mousePressed() {
    if (initialized == 0) {
        Tone.start();
        Tone.Transport.start();
        initialized = 1;
    }
    if (initialized == 1){
        console.log(progress);
    }

}

function crossMarkDraw(_pos) {
    let pos = _pos * height; //where to draw the center line (by percentage down the vertical screen)
    strokeWeight(5);
    stroke(255,100);
    strokeCap(SQUARE);
    setLineDash([5,10]);
    line(0, pos, width, pos);
    line(width / 2, 0, width / 2, height);
}

function calcProgress() {
    if (initialized == 0){
        return 0;
    }
    else {
    return (Tone.Transport.toTicks(Tone.Transport.position) / totalTicks % 1);
    }
}


// function createNoteSquares() {
//     for (var i = 0; i < notesObject.length; i++) {
//         let yPos = height - (notesObject[i].ticks / totalTicks) * height;
//         let yHeight = (notesObject[i].durationTicks / totalTicks) * height;

//         if (notesObject[i].midi == 72) {
//             leftTrack.fill(random(255), random(255), random(255));
//             leftTrack.rectMode(CORNER);
//             leftTrack.rect(0, yPos, hashWidth, yHeight);
//         }
//         if (notesObject[i].midi == 69) {
//             rightTrack.fill(random(255), random(255), random(255));
//             rightTrack.rectMode(CORNER);
//             rightTrack.rect(0, yPos, hashWidth, yHeight);
//         }
//     }
// }

//draw the hashmarks as dotted lines like on a football field.
function setLineDash(list) {
    drawingContext.setLineDash(list);
  }

function createThumblines(){
    for (let i = 0; i < notesObject.length; i++){
        thumblines[i] = new Thumbline(notesObject[i].ticks, notesObject[i].durationTicks, notesObject[i].midi);
    }
}

function drawThumblines(_progress) {
    for (let i = 0; i < thumblines.length; i++){
        thumblines[i].draw(_progress);
    }
}

class Thumbline {

    constructor(tickPosition, tickDuration, note){ //get the timeline position, duration, and midi note number from each event
        this.position = tickPosition;
        this.duration = tickDuration;
        this.note = note;
    }

    get thumb(){ //which thumb should the drawing go?
        return this.chooseThumb();
    }
    chooseThumb(){ //0 = left thumb, 1 = right thumb
        if (this.note == noteL){
            return 0;
        }
        if (this.note == noteR){
            return 1;
        }
    }

    get durationProp(){ //how much of the total sequence the note takes up
        return this.durationPropCalc();
    }
    durationPropCalc(){
        return this.duration/totalTicks;
    }

    draw(progress){
        push();
        translate(this.thumb*width,this.position*totalTicks);//set drawing location top corner of box
        rect(0,0,hashWidth,this.durationProp,trackHeight);
        pop();
    }
}