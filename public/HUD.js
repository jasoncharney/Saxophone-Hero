var titleDisplay = 'SAXOPHONE HERO!';
var titleFont;
var hudFont;
var displayInstruction = 'Step on the hashes with your left and right thumbs. \n Make sure you march in time!';
var orientationInstruction = 'Turn to landscape mode and refresh!';
var hudStrokeWeight = 2;
var hudSize = 0.02;
var levelUpOpacity = 0; //decrease over some frames
let hudnotification = null; //the big notification that appears at the top of the screen.

function playerHUD() {
    if (hudnotification) {
        hudnotification.fade();
        hudnotification.display();
        if (hudnotification.isFaded()) {
            hudnotification = null;
        }
    }

    if (initialized == false) {
        titleSize = height * 0.1;
        textFont(titleFont);
        textSize(titleSize);
        fill(255);
        stroke(0);
        strokeWeight(2);
        textAlign(CENTER);
        text(titleDisplay, centerX, centerY);
    }

    if (initialized == true && choosePlayerStatus == 0) {
        instructionSize = height * 0.075;
        textFont(hudFont);
        textSize(instructionSize);
        fill(255);
        stroke(0);
        strokeWeight(2);
        textAlign(CENTER);
        textWrap(WORD);
        text(displayInstruction, centerX, 100, width - 20);
        if (deviceOrientation == 'portrait') {
            text(orientationInstruction, centerX, centerY + textSize * 2);
        }
    }
    if (initialized && assignedTeam) {
        teamDisplay(assignedTeam);
    }
    if (initialized == true && choosePlayerStatus == 1) {
        if (displayTime) {
            timeDisplay(Tone.Transport.position);
        }
        if (currentLevel !== 0 && currentLevel !== 17) {
            levelDisplay(currentLevel);
        }
    }
    if (Tone.Transport.state == 'started' && accuracy != undefined && introFlag == false) {
        accuracyDisplay(accuracy);
    }
    if (currentLevel == 0) {
        //levelUpDisplay('Get ready!');
    }
    if (currentLevel > 0) {
        if (victoryLap == true && advanceLevelOnNextLoop == false) {
            //levelUpDisplay('Level up!');
        }

        if (advanceLevelOnNextLoop == true && currentLevel >= 1) {
            //levelUpDisplay('Victory lap!');
        }
    }

}

function levelDisplay(_level) {
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(RIGHT);
    let levelString = 'Level ' + _level;
    text(levelString, width - 10, height - 0.5 * hudSize);
}

function teamDisplay(_assignedTeam) {
    fill(255);
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(LEFT);
    text('team ' + _assignedTeam, 10, height - 0.5 * hudSize);

}

function timeDisplay(_currentPosition) {
    fill(255);
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(CENTER);
    text(_currentPosition, centerX, centerY);
}

function accuracyDisplay(_accuracy) {
    fill(255);
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(CENTER);
    let acc = _accuracy;
    if (acc == 'NaN') {
        acc = 0;
    }
    text((acc * 100).toString() + '%', centerX, crossMark);
}

function levelUpDisplay(disp) {
    if (levelUpOpacity > 0. && advanceLevelOnNextLoop == true || victoryLap == true) {
        levelUpOpacity -= 1;
    }
    fill(255, levelUpOpacity);
    textFont(titleFont);
    textSize(titleSize);
    stroke(0, levelUpOpacity);
    strokeWeight(2);
    textAlign(CENTER);
    text(disp, centerX, titleSize + 20);
}

function pingDisplay(_myLatency) {
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(RIGHT);
    text('ping: ' + round(_myLatency), width - 10, hudSize);
}

//Set up the buttons to appear on screen when triggered.

function buttonSetup() {

    sopranoButton = createButton('Team Soprano', 'soprano');
    sopranoButton.size(width, height * 0.25);
    sopranoButton.position(0, 0);
    sopranoButton.id('sopranoButton');

    altoButton = createButton('Team Alto', 'alto');
    altoButton.size(width, height * 0.25);
    altoButton.position(0, height * 0.25);
    altoButton.id('altoButton');

    tenorButton = createButton('Team Tenor', 'tenor');
    tenorButton.size(width, height * 0.25);
    tenorButton.position(0, height * 0.5);
    tenorButton.id('tenorButton');

    bariButton = createButton('Team Bari', 'bari');
    bariButton.size(width, height * 0.25);
    bariButton.position(0, height * 0.75);
    bariButton.id('bariButton');

    document.getElementById('sopranoButton').addEventListener('click', function () { teamAssignByTap('soprano'); });
    document.getElementById('altoButton').addEventListener('click', function () { teamAssignByTap('alto'); });
    document.getElementById('tenorButton').addEventListener('click', function () { teamAssignByTap('tenor'); });
    document.getElementById('bariButton').addEventListener('click', function () { teamAssignByTap('bari'); });
}

function teamAssignByTap(_team) {
    teamAssign(_team);
    resetTransport(); //reset transport after the demoloop
    //assign the teams and then remove all the buttons.
    document.getElementById('sopranoButton').remove();
    document.getElementById('altoButton').remove();
    document.getElementById('tenorButton').remove();
    document.getElementById('bariButton').remove();
}

//when you assign the team, populate notes with the assigned team's score and let the server know
function teamAssign(_team) {
    assignedTeam = _team;
    thumblines = [];
    noteTimings = [];
    populateNotes(assignedTeam);
    socket.emit('myTeam', assignedTeam);
}

function initializeButton() {
    initButton = createButton('Tap to start!', 'init');
    initButton.size(width * 0.25, height * 0.25);
    initButton.position(centerX - width * 0.125, height * 0.625);
    initButton.id('initButton');
    document.getElementById('initButton').addEventListener('click', function () { initializeMe() });
    //document.getElementById('initButton').addEventListener('click', function () { enterFullScreen() });
}

function initializeMe() {
    if (initialized == false) {
        Tone.start();
        unblockPlayback();
        populateNotes('demo');
        demoLoop();
        initialized = true;
        socket.emit('initializeMe');
        document.getElementById('initButton').remove();
    }
}


function enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}

class Hudnotification {
    constructor(text, fadeRate) {
        this.text = text;
        this.opacity = 255; //starting opacity
        this.isVisible = true; //tracking visibility
        this.fadeRate = fadeRate; //how much it decreases in opacity each frame
    }

    fade() {
        if (this.opacity > 0) {
            this.opacity -= this.fadeRate;
        } else {
            this.isVisible = false;
        }
    }

    isFaded() {
        return !this.isVisible;
    }

    display() {
        fill(255, this.opacity);
        textFont(titleFont);
        textSize(titleSize);
        stroke(0, this.opacity);
        strokeWeight(2);
        textAlign(CENTER);
        text(this.text, centerX, titleSize + 20);
    }


}