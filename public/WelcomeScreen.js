var titleDisplay = 'SAXOPHONE HERO!';
var displayInstruction = 'Wait for instructions.';
var orientationInstruction = 'Turn to landscape mode!';

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

    if (initialized == true && choosePlayerStatus == 1) {
        playerSize = width * 0.02;
        textSize(playerSize);
        stroke(0);
        strokeWeight(5);
        textAlign(LEFT);
        text('team '+ assignedTeam,10,height-0.5*playerSize);
        if (level );
    }
}

function levelDisplay(_level){
    levelSize = width * 0.02;
    textSize(levelSize);
    stroke(0);
    strokeWeight(5);
    textAlign(RIGHT);
    let levelString = 'Level ' + _level.toString();
    text(levelString, width-textWidth(textWidth(levelString),height-0.5*levelSize));
}
