var titleDisplay = 'SAXOPHONE HERO!';
var titleFont;
var hudFont;
var displayInstruction = 'Step on the hashes with your left and right thumbs. \n Make sure you march in time!';
var orientationInstruction = 'Turn to landscape mode and refresh!';
var hudStrokeWeight = 2;
var hudSize = 0.04;
var levelUpOpacity = 0; //decrease over some frames
let hudnotification = null; //the big notification that appears at the top of the screen.
let pointsnotification = null; //the number of points shown at the end of each loop

function playerHUD() {
    if (hudnotification) {
        hudnotification.fade();
        hudnotification.display();
        if (hudnotification.isFaded()) {
            hudnotification = null;
        }
    }

    if (pointsnotification) {
        pointsnotification.fade();
        pointsnotification.display();
        if (pointsnotification.isFaded()) {
            pointsnotification = null;
        }
    }

    if (initialized == false) {
        titleSize = height * 0.2;
        textFont(titleFont);
        textSize(titleSize);
        fill(255);
        stroke(0);
        strokeWeight(2);
        textAlign(CENTER);
        textWrap(WORD);
        rectMode(CENTER);
        text(titleDisplay, centerX, centerY, width - 20);
    }

    if (initialized == true && choosePlayerStatus == 0) {
        const instructionSize = height * 0.075;
        textFont(hudFont);
        textSize(instructionSize);
        fill(255);
        stroke(0);
        strokeWeight(2);
        textAlign(CENTER);
        textWrap(WORD);
        rectMode(CENTER);
        text(displayInstruction, centerX, centerY - centerY * 0.05, width - 20);
        textAlign(RIGHT);
        text('<--- Points you\'ve earned for your team this level', width - 20, instructionSize + 20);
        if (deviceOrientation == 'portrait') {
            text(orientationInstruction, centerX, centerY, width - 20);
        }
    }
    if (initialized && gameStartedFlag == true) {
       gameStartedDisplay();
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
        //accuracyDisplay();
        pointsDisplay(points, notesPerLevel[currentLevel]);
    }
    if (Tone.Transport.state == 'started' && choosePlayerStatus == 0) {
        pointsDisplay(points, 0);
    }
    textAlign(CENTER);
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

function pointsDisplay(_points, _numPoints) {
    fill(255);
    let pointsSize = hudSize * 2;
    textFont(hudFont);
    textSize(pointsSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(LEFT, BOTTOM);
    rectMode(CORNER);
    text(_points, 10, pointsSize + 10);
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

function gameStartedDisplay(){
    const instructionSize = height * 0.075;
    textFont(hudFont);
    textSize(instructionSize);
    fill(255);
    stroke(0);
    strokeWeight(2);
    textAlign(CENTER);
    textWrap(WORD);
    rectMode(CENTER);
    text('Game has started! Watch the projector or look over your neighbor\'s shoulder.', centerX, centerY, width - 20);
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
    notesPerLevel = score["notesPerLevel"][assignedTeam];
    populateNotes(assignedTeam); //create the one set of notes for which we'll create subsets for thumblines.
    thumblines = [];
    //countAllNoteEvents();
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
        document.getElementById('initButton').remove();
        initialized = true;
        if (gameStartedFlag == false) {
            demoShow(); //show the stuff for the demo screen.
            socket.emit('initializeMe');
        }

    }
}

function demoShow() {
    populateNotes('demo');
    for (let i = 0; i < 10; i++) { //add a bunch of thumblines for demo
        addToThumblineBuffer(0, i * 16);
    }
    points = 0;
    Tone.Transport.start();
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
        this.fontSize = titleSize * 0.5;
        textAlign(CENTER, BASELINE);
        textWrap(WORD);
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
        textAlign(CENTER, BASELINE);
        textWrap(WORD);
        text(this.text, centerX, titleSize + 20, width - 20);
    }


}

class Pointsnotification {
    constructor(accuracy, fadeRate) {
        this.accuracy = accuracy;
        this.opacity = 255; //starting opacity
        this.isVisible = true; //tracking visibility
        this.fadeRate = fadeRate; //how much it decreases in opacity each frame

        if (this.accuracy == 1) {
            this.text = 'perfect!';
        }
        if (this.accuracy >= 0.8 && this.accuracy < 1.) {
            this.text = 'great!';
        }
        if (this.accuracy >= 0.6 && this.accuracy < 0.8) {
            this.text = 'okay!';
        }
        if (this.accuracy >= 0.4 && this.accuracy < 0.6) {
            this.text = 'hmm...';
        }
        if (this.accuracy >= 0.2 && this.accuracy < 0.4) {
            this.text = 'you can do better!';
        }
        if (this.accuracy < 0.2) {
            this.text = 'zzz...';
        }

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
        fill(255, 215, 0, this.opacity);
        textFont(titleFont);
        textSize(titleSize);
        stroke(0, this.opacity);
        strokeWeight(2);
        textAlign(CENTER);
        text(this.text, centerX, centerY);
    }


}