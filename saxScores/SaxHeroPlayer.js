//Sax Hero Client - Player

let socket = io('/saxUser');

let centerX, centerY;

let playerChooser;

let playerAssigned = 0;

// function preload(){
//     bg = loadImage('assets/grass.jpeg');
// }

function setup(){
    frameRate(60);
    createCanvas(window.innerWidth, window.innerHeight);
    centerX = width/2;
    centerY = height/2;

    playerChooser = createSelect();
    playerChooser.position(centerX,centerY);
    playerChooser.size(120);
    playerChooser.option('Select saxophone:')
    playerChooser.option('soprano');
    playerChooser.option('alto');
    playerChooser.option('tenor');
    playerChooser.option('bari');
    noLoop();

    playerChooser.changed(chooseSaxVoice);
}

function draw(){
}

function chooseSaxVoice(){    

    playerAssigned = playerChooser.selected();

    if (playerAssigned != 0){
        socket.emit('myVoice', playerAssigned);
        loop();
        removeElements();
    }

    console.log(playerAssigned);
}