let graphics = [];
let trackHeight = 50;  // Example global variable
let totalTicks = 16;   // Example global variable
let hashWidth = 10;    // Example global variable
let initialized = 0;

function setup() {
  createCanvas(800, 600);
  Tone.Transport.start();
  for (let i = 0; i < 10; i++) {
    graphics.push(new Graphic(i * 50, i * 50));
  }

  Tone.Transport.scheduleRepeat(time => {
    updateGraphics();
  }, "16n");
}

function draw() {
  background(220);
  for (let graphic of graphics) {
    graphic.display();
  }
}

function updateGraphics() {
  let position = Tone.Transport.position.split(":");
  let measure = parseInt(position[0]);
  let beat = parseInt(position[1]);
  let tick = parseInt(position[2]);

  for (let graphic of graphics) {
    graphic.move(measure, beat, tick);
  }
}


function mousePressed() {
    if (initialized == 0) {
        Tone.start();

        Tone.Transport.start();
        intialized = 1;
    }
}

class Graphic {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 50;
  }

  move(measure, beat, tick) {
    this.y = (measure * 4 + beat + tick / totalTicks) * trackHeight;
  }

  display() {
    fill(0);
    ellipse(this.x, this.y, this.size, this.size);
  }
}