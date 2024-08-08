var titleDisplay = 'SAXOPHONE HERO!';
var titleFont;
var hudFont;
var displayInstruction = 'Wait for instructions.';
var orientationInstruction = 'Turn to landscape mode!';
var hudStrokeWeight = 2;
var hudSize = 0.02;

function playerHUD() {
    if (initialized == false) {
        titleSize = height * 0.2;
        textFont(titleFont);
        textSize(titleSize);
        fill(255);
        stroke(0);
        strokeWeight(2);
        textAlign(CENTER);
        text(titleDisplay, centerX, centerY);
    }

    if (initialized == true && choosePlayerStatus == 0) {
        instructionSize = height * 0.1;
        textFont(hudFont);
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
    if (initialized && assignedTeam) {
        teamDisplay(assignedTeam);
    }
    if (initialized == true && choosePlayerStatus == 1) {
        if (displayTime) {
            timeDisplay(Tone.Transport.position);
        }
        if (level !== -1) {
            levelDisplay(level);
        }
    }
    if (Tone.Transport.state == 'started' && accuracy != undefined) {
        accuracyDisplay(accuracy);
    }
    if (advanceLevelOnNextLoop == true) {
        if (frameCount % 2 == 0 || frameCount % 3 == 0) {
            levelUpDisplay();
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
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(LEFT);
    text('team ' + _assignedTeam, 10, height - 0.5 * hudSize);

}

function timeDisplay(_currentPosition) {
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(CENTER);
    //text(_currentPosition, centerX, centerY);
}

function accuracyDisplay(_accuracy) {
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(CENTER);
    text((_accuracy * 100).toString() + '%', centerX, height - 0.5 * hudSize);
}

function levelUpDisplay() {
    textFont(titleFont);
    textSize(titleSize);
    stroke(0);
    strokeWeight(2);
    textAlign(CENTER);
    text('Level Up!', centerX, titleSize + 20);

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
    localStorage.setItem('storedTeam', assignedTeam);
    //assign the teams and then remove all the buttons.
    document.getElementById('sopranoButton').remove();
    document.getElementById('altoButton').remove();
    document.getElementById('tenorButton').remove();
    document.getElementById('bariButton').remove();
}

function teamAssign(_team) {
    assignedTeam = _team;
    populateNotes(assignedTeam);
    socket.emit('myTeam', assignedTeam);
}

function initializeButton() {
    initButton = createButton('Tap to start!', 'init');
    initButton.size(width*0.25, height * 0.25);
    initButton.position(centerX, height * 0.75);
    initButton.id('initButton');
    document.getElementById('initButton').addEventListener('click', function () { initializeMe() });
    // document.getElementById('initButton').addEventListener('click', function () { enterFullScreen() });
}

function initializeMe() {
    if (initialized == false) {
        Tone.start();
        unblockPlayback();
        initialized = true;
        socket.emit('initializeMe');
        console.log('initialized');
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
