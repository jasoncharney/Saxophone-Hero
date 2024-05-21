//Sax Hero Client - Audience Member

var socket = io('/client');

var centerX, centerY;

function preload(){
    bg = loadImage('assets/grass.jpeg');
}

function setup(){
    frameRate(60);
    createCanvas(window.innerWidth, window.innerHeight);
    image(bg,0,0);

        socket.on('hi',function(){
        console.log('hi');
    });
}