//All of the scripts for creating the thumb notated lines on the screen.

class Playhead {

    constructor(zeroPoint, pixelsPerSecond) {
        this.zeroPoint = zeroPoint;
        this.pixelsPerSecond = pixelsPerSecond;
    }

    reset() {
        this.ypos = Playhead.zeroPoint;
    }
    update(_time) {
        let positionCalculation = this.pixelsPerSecond * _time; //how much to scroll up each second
        this.ypos = this.zeroPoint - positionCalculation; //start at zero point and draw the line
    }
    draw() {
        line(0, this.ypos, 1000, this.ypos);
    }

}

class Thumbline {
    static pixelsPerSecond;
    static zeroPoint;

    constructor(timing, duration, midi, offset) {
        this.timing = timing;
        this.zeroPoint = zeroPoint;
        this.position = this.zeroPoint - (Thumbline.pixelsPerSecond * (this.timing + offset));
        this.fill = [255, 255, 255];
        this.opacity = 255;
        this.fadeFlag = false;
        this.screenHalf;

        if (0.25 < duration < 1) {
            this.duration = -1; //placeholder value. Anything shorter than a half note will display as the same height rectangle
        }
        if (duration < 0.25) {
            this.duration = -2; //anything shorter than a 16th note will be slightly thinner too.
        }
        if (duration >= 1) {
            this.duration = duration;
        }
        if (midi == 61) {
            this.thumb = 0; //left thumb
            this.rectCenter = 0.25;
            this.screenHalf = 0;
        }
        if (midi == 60) {
            this.thumb = 1; //right thumb
            this.rectCenter = 0.75;
            this.screenHalf = centerX;
        }
    }

    update(_time) {
        this.ypos = this.position + Thumbline.pixelsPerSecond * _time;
    }

    display() {
        fill(this.fill[0], this.fill[1], this.fill[2], this.opacity);
        rectMode(CENTER);
        stroke(0);
        strokeWeight(0.25);
        setLineDash([]); //TODO: as score gets long, will it be more efficient to only render hashes on screen? Or does it not matter?
        rect(this.rectCenter * width, this.ypos, this.hashWidth, this.rectHeight);
    }

    fadeToggle() {
        this.fadeFlag = true;
    }

    fade(amt) {
        if (this.fadeFlag == true) {
            this.opacity -= amt;
        }
    }

    isFaded() {
        return this.opacity === 0;
    }
}


//LOOK: OLD THUMBLINE
// class Thumbline {

//     static pixelsPerSecond;
//     static zeroPoint;

//     constructor(timing, duration, note) {
//         this.pixelsPerSecond = Thumbline.pixelsPerSecond;
//         this.zeroPoint = Thumbline.zeroPoint;
//         this.timing = timing;
//         this.position = this.zeroPoint - (this.pixelsPerSecond * timing); //offset initial position with crossmark as the top of the score
//         this.ypos = this.position;
//         this.fill = [255, 255, 255];
//         this.opacity = 255;
//         this.fadeFlag = false;
//         this.hashWidth = hashWidth;

//         // if (this.timing % 2 == 0 && this.timing % 4 == 0){
//         //     this.hashWidth = (hashWidth * 1.5);
//         // }

//         if (0.25 < duration < 1) {
//             this.duration = -1; //placeholder value. Anything shorter than a half note will display as the same height rectangle
//         }
//         if (duration < 0.25) {
//             this.duration = -2; //anything shorter than a 16th note will be slightly thinner too.
//         }
//         if (duration >= 1) {
//             this.duration = duration;
//         }
//         if (note == 61) {
//             this.thumb = 0; //left thumb
//             this.rectCenter = 0.25;
//         }
//         if (note == 60) {
//             this.thumb = 1; //right thumb
//             this.rectCenter = 0.75;
//         }
//         if (this.duration == -1) {
//             this.rectHeight = shoeSize * 0.3;
//         }
//         if (this.duration == -2) {
//             this.rectHeight = shoeSize * 0.2;
//         }
//         else {
//             this.rectHeight = shoeSize; // TODO: fix it so it's the whole length for a hold, need to calculate
//         }
//     }

//     print() {
//         console.log(this.position, this.duration, this.thumb);
//     }
//     update(_time) {
//         this.ypos = this.position + this.pixelsPerSecond * _time;
//     }

//     draw(_hashWidth) {
//         if (this.fadeFlag == true) {
//             this.opacity -= 10;
//         }
//         fill(this.fill[0], this.fill[1], this.fill[2], this.opacity);
//         rectMode(CENTER);
//         stroke(0);
//         strokeWeight(0.25);
//         setLineDash([]); //TODO: as score gets long, will it be more efficient to only render hashes on screen? Or does it not matter?
//         rect(this.rectCenter * width, this.ypos, this.hashWidth, this.rectHeight);
//     }

//     fade() {
//         this.fadeFlag = true;
//     }


// }

// class ThumblineBlock extends Thumbline {

//     constructor(notes, range, blockNumber) {
//         this.range = range;
//         this.blockNumber = blockNumber;
//         this.notes = offsetNotesInRange(notes, range[0], range[1]);
//         this.thumblines = []; //hold the thumblines
//         //translate off the screen by the number of blocks there are
//     }

//     populate(){
//         for (let i = 0; i < this.notes.length; i++){
//             this.thumblines.push(new Thumbline(this.notes[i].time, this.notes[i].duration, this.notes[i].midi, pixelsPerSecond, zeroPoint));
//         }
//     }



// }