var titleDisplay = 'SAXOPHONE HERO!';
var displayInstruction = 'Wait for instructions.';
var orientationInstruction = 'Turn to landscape mode!';
var hudStrokeWeight = 2;
var hudSize = 0.02;

function playerHUD() {
    if (initialized == false) {
        titleSize = height * 0.1;
        textSize(titleSize);
        fill(255);
        stroke(0);
        strokeWeight(2);
        textAlign(CENTER);
        text(titleDisplay, centerX, centerY);
    }

    if (initialized == true && choosePlayerStatus == 0) {
        instructionSize = height * 0.1;
        textSize(instructionSize);
        fill(255);
        stroke(0);
        strokeWeight(2);
        textAlign(CENTER);
        text(displayInstruction, centerX, centerY);
        if (deviceOrientation == 'portrait') {
            text(orientationInstruction, centerX, centerY + textSize * 2);
        }
    }
    if (initialized && assignedTeam){
        teamDisplay(assignedTeam);
    }
    if (initialized == true && choosePlayerStatus == 1) {
        if (displayTime){
            timeDisplay(Tone.Transport.position);
        }
             if (level !== -1){
            levelDisplay(level);
        }
    }

}

function levelDisplay(_level){
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(RIGHT);
    let levelString = 'Level ' + _level;
    text(levelString, width,height-0.5*hudSize);
}

function teamDisplay(_assignedTeam){
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(LEFT);
    text('team '+ _assignedTeam,10,height-0.5*hudSize);

}

function timeDisplay(_currentPosition){
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(CENTER);
    text(_currentPosition,centerX,centerY);
}