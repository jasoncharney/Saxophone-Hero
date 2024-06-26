var titleDisplay = 'SAXOPHONE HERO!';
var titleFont;
var hudFont;
var displayInstruction = 'Wait for instructions.';
var orientationInstruction = 'Turn to landscape mode!';
var hudStrokeWeight = 2;
var hudSize = 0.02;

function playerHUD() {
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
    if (Tone.Transport.state == 'started' && accuracy != undefined){
        accuracyDisplay(accuracy);
    }

}

function levelDisplay(_level){
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(RIGHT);
    let levelString = 'Level ' + _level;
    text(levelString, width-10,height-0.5*hudSize);
}

function teamDisplay(_assignedTeam){
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(LEFT);
    text('team '+ _assignedTeam,10,height-0.5*hudSize);

}

function timeDisplay(_currentPosition){
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(CENTER);
    text(_currentPosition,centerX,centerY);
}

function accuracyDisplay(_accuracy){
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(CENTER);
    text((_accuracy*100).toString()+'%', centerX, height-0.5*hudSize);
}

function pingDisplay(_myLatency){
    textFont(hudFont);
    textSize(hudSize);
    stroke(0);
    strokeWeight(hudStrokeWeight);
    textAlign(RIGHT);
    text('ping: '+round(_myLatency), width - 10, hudSize);
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

    document.getElementById('sopranoButton').addEventListener('click', function () { teamAssign('soprano'); });
    document.getElementById('altoButton').addEventListener('click', function () { teamAssign('alto'); });
    document.getElementById('tenorButton').addEventListener('click', function () { teamAssign('tenor'); });
    document.getElementById('bariButton').addEventListener('click', function () { teamAssign('bari'); });
}

function teamAssign(_team) {
    assignedTeam = _team;
    populateNotes(assignedTeam);
    socket.emit('myTeam', assignedTeam);
    //assign the teams and then remove all the buttons.
    document.getElementById('sopranoButton').remove();
    document.getElementById('altoButton').remove();
    document.getElementById('tenorButton').remove();
    document.getElementById('bariButton').remove();
}

function initializeButton() {
    initButton = createButton('Tap to start!', 'init');
    //initButton.size(width, height * 0.25);
    initButton.position(centerX, height * 0.75);
    initButton.id('initButton');
    document.getElementById('initButton').addEventListener('click', function () { initializeMe() });
}

function initializeMe() {
    if (initialized == false) {
        Tone.start();
        initialized = true;
        socket.emit('initializeMe');
        console.log('initialized');
        document.getElementById('initButton').remove();
    }
}