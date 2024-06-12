var titleDisplay = 'SAXOPHONE HERO!' + '\n' + '\n' + 'Tap anywhere to join.'
var displayInstruction = 'Turn up your volume.' + '\n' + '\n' + 'Wait for instructions.';
var orientationInstruction = 'Turn to landscape mode!';

function welcomeScreen() {
    if (initialized == false) {
        titleSize = width * 0.05;
        textSize(titleSize);
        fill(255);
        stroke(0);
        strokeWeight(1);
        textAlign(CENTER);
        text(titleDisplay, centerX, centerY);
    }

    if (initialized == true && choosePlayerStatus == 0) {
        instructionSize = width * 0.03;
        textSize(instructionSize);
        fill(255);
        stroke(0);
        strokeWeight(1);
        textAlign(CENTER);
        text(displayInstruction, centerX, centerY);
        if (deviceOrientation == 'portrait') {
            text(orientationInstruction, centerX, centerY + textSize * 2);
        }
    }

    if (initialized == true && choosePlayerStatus == 1) {
        sopranoButton.show();
        sopranoButton.mousePressed(console.log('soprano'));

        altoButton.show();
        tenorButton.show();
        bariButton.show();


        // const sopranoButton = document.createElement('button');
        // sopranoButton.textContent = 'Soprano';
        // document.body.appendChild(sopranoButton);
        //sopranoButton.addEventListener('click', teamAssign('soprano'));
    }
}
