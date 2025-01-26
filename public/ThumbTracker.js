//All of the scripts for creating the thumb notated lines on the screen.
class Thumbline {
    static pixelsPerSecond;
    static zeroPoint;
    static hashWidth;

    constructor(timing, duration, midi, offset) {
        this.timing = timing;
        this.position = Thumbline.zeroPoint - (Thumbline.pixelsPerSecond * (this.timing + offset));
        this.fill = [255, 255, 255];
        this.opacity = 255;
        this.fadeFlag = false;
        this.screenHalf;
        this.downbeat = false;

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

        if (this.duration == -1) {
            this.rectHeight = shoeSize * 0.3;
        }
        if (this.duration == -2) {
            this.rectHeight = shoeSize * 0.2;
        }
        else {
            this.rectHeight = shoeSize;
        }
    }

    update(_time) {
        this.ypos = this.position + Thumbline.pixelsPerSecond * _time;
    }

    print() {
        this.ypos;
    }

    display() {
        fill(this.fill[0], this.fill[1], this.fill[2], this.opacity);
        rectMode(CENTER);
        //stroke(0);
        noStroke();
        setLineDash([]); //TODO: as score gets long, will it be more efficient to only render hashes on screen? Or does it not matter?
        rect(this.rectCenter * width, this.ypos, Thumbline.hashWidth, this.rectHeight);
    }

    fadeToggle() {
        this.fadeFlag = true;
        return this.fadeFlag;
    }

    fade(amt) {
        if (this.fadeFlag == true) {
            this.opacity -= amt;
        }
    }

    isFaded() {
        return this.opacity === 0;
    }

    isOffScreen() {
        return this.position >= height;
    }
}

class DownbeatHash {
    static pixelsPerSecond;
    static zeroPoint;
    constructor(timing) {
        this.timing = timing;
        this.position = DownbeatHash.zeroPoint - DownbeatHash.pixelsPerSecond * this.timing;
    }

    update(_time) {
        this.ypos = this.position + DownbeatHash.pixelsPerSecond * _time;
    }
    display() {
        strokeWeight(0.25);
        setLineDash([2]);
        stroke(255);
        line(0, this.ypos, width, this.ypos);
    }
}