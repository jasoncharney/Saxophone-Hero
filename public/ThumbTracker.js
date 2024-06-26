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

    constructor(timing, duration, note, pixelsPerSecond, zeroPoint) {
        this.pixelsPerSecond = pixelsPerSecond;
        this.zeroPoint = zeroPoint;
        this.timing = timing;
        this.position = this.zeroPoint - (this.pixelsPerSecond * timing); //offset initial position with crossmark as the top of the score
        this.ypos = this.position;

        if (duration < 1) {
            this.duration = -1; //placeholder value. Anything shorter than a half note will display as the same height rectangle
        }
        if (duration >= 1) {
            this.duration = duration;
        }
        if (note == 60) {
            this.thumb = 0; //left thumb
            this.rectCenter = 0.25;
        }
        if (note == 61) {
            this.thumb = 1; //right thumb
            this.rectCenter = 0.75;
        }
        if (this.duration == -1) {
            this.rectHeight = shoeSize * 0.5;
        }
        else {
            this.rectHeight = shoeSize; // TODO: fix it so it's the whole length for a hold, need to calculate
        }
    }

    print() {
        console.log(this.position, this.duration, this.thumb);
    }
    update(_time) {
        this.ypos = this.position + this.pixelsPerSecond * _time;
    }

    draw(_hashWidth) {
        fill(255);
        rectMode(CENTER);
        setLineDash([]); //TODO: as score gets long, will it be more efficient to only render hashes on screen? Or does it not matter?
        rect(this.rectCenter*width, this.ypos, _hashWidth, this.rectHeight);
    }
}