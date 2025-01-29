
let sketch = (p) => {
    let canvasWidth = document.getElementById('gameStatsContainer').clientWidth - 20;
    let topOfDiv = document.getElementById('gameStatsContainer').getBoundingClientRect(top);
    let canvasHeight = window.innerHeight - topOfDiv.top - 20;
    //let canvasHeight = document.getElementById('gameStatsContainer').clientHeight;
    let feetimg;
    let feetResizeW, feetResizeH; //resize the feetimage to a percentage of the screen height.
    let varsityfont;
    let creatofont;
    let meters = [];
    let titleSize = 50;
    let playerNumberSize = 25;
    let padding = 20;
    let saxImages = {};
    let saxConfettiImage; //this will be set when the winner is chosen!
    let saxConfetti = [];

    p.preload = function () {
        feetimg = p.loadImage('assets/two-shoes.png');
        varsityfont = p.loadFont('assets/VarsityTeam-Bold.otf');
        creatofont = p.loadFont('assets/CreatoDisplay-Regular.otf');
        saxImages['soprano'] = p.loadImage('assets/soprano.png');
        saxImages['alto'] = p.loadImage('assets/alto.png');
        saxImages['tenor'] = p.loadImage('assets/tenor.png');
        saxImages['bari'] = p.loadImage('assets/bari.png');
    }

    p.generateConfetti = function (_winner) {
        if (saxConfetti.length <= 0) {
            saxConfettiImage = saxImages[_winner];
            for (let i = 0; i < 200; i++) {
                saxConfetti.push(new SaxConfetti(p.random(p.width), p.random(-1000, 0)));
            }
        }
    }

    p.setup = function () {
        p.createCanvas(canvasWidth, canvasHeight);
        feetResizeW = p.width / 17;
        feetimg.resize(feetResizeW, 0);
        feetResizeH = feetimg.height; //after resizing, declare this height
        let meterLaneHeight = p.height * 0.25;
        TeamMeter.laneHeight = meterLaneHeight;
        Object.keys(saxImages).forEach(key => {
            let saxToBeResized = saxImages[key];
            saxToBeResized.resize(0, feetResizeH * 2);
        });
        meters[0] = new TeamMeter('soprano', 0);
        meters[1] = new TeamMeter('alto', meterLaneHeight);
        meters[2] = new TeamMeter('tenor', meterLaneHeight * 2);
        meters[3] = new TeamMeter('bari', meterLaneHeight * 3);
    };

    p.draw = function () {
        p.clear();
        if (winner && endFlag == false) {
            p.textFont(varsityfont);
            p.textSize(100);
            p.textAlign(p.CENTER);
            p.text('A winner emerges...', p.width / 2, p.height / 2);
            p.generateConfetti(winner);
        }
        if (!winner) {
            for (let i = 0; i < 4; i++) {
                meters[i].teamtitle(varsityfont, creatofont);
                meters[i].numPlayers(creatofont);
                meters[i].meter();
                meters[i].liner();
            }
        }
        if (endFlag == true) {
            for (let i = 0; i < saxConfetti.length; i++) {
                saxConfetti[i].fall();
                saxConfetti[i].show();
            }
            p.textFont(varsityfont);
            p.textSize(100);
            p.textAlign(p.CENTER);
            p.drawingContext.shadowOffsetX = 2;
            p.drawingContext.shadowOffsetY = 2;
            p.drawingContext.shadowColor = 'black';
            p.text('TEAM ' + winner + ' wins!', p.width / 2, p.height / 2);
        }
    };

    //4 lanes for each team, each stacked on one another
    class TeamMeter {

        static feetResizeH;
        static titleSize = titleSize;
        static playerNumberSize = playerNumberSize;
        static padding = padding;
        static laneHeight;

        constructor(name, locy) {
            this.name = name;
            this.locy = locy;
            this.playerNumber = playerNumbers[this.name];
            this.myLevel = levels[this.name];
            this.mySaxImage = saxImages[this.name];
            this.lowerLineDisplay = true;

            if (this.name == 'bari') {
                this.lowerLineDisplay = false;
            }

            // this.titleSize = 50; //size of the "team" text
            // this.playerNumberSize = 25; //size of the player number indicator text
            // this.padding = 10; //vertical padding between elements
        }

        teamtitle(fontSet1, fontSet2) {
            p.fill(255);
            p.noStroke();
            p.drawingContext.shadowOffsetX = 5;
            p.drawingContext.shadowOffsetY = 5;
            p.drawingContext.shadowColor = 'black';
            p.textSize(TeamMeter.titleSize);
            p.textFont(fontSet1);
            p.textAlign(p.LEFT, p.TOP);
            let teamString = 'team ' + this.name;
            p.text(teamString, 0, this.locy);
            //uncomment to display points on the projector
            // if (teamPoints) {
            //     p.fill(255);
            //     p.noStroke();
            //     p.textFont(fontSet2);
            //     p.textSize(TeamMeter.titleSize);
            //     p.textAlign(p.RIGHT, p.TOP);
            //     p.text(teamPoints[this.name] + ' points', p.width-20, this.locy);
            // }
        }

        numPlayers(fontSet) {
            this.playerNumber = playerNumbers[this.name];
            p.noStroke();
            p.textSize(TeamMeter.playerNumberSize);
            p.textFont(fontSet);
            p.textAlign(p.LEFT, p.CENTER);
            p.text(this.playerNumber.toString() + ' players', 0, this.locy + TeamMeter.titleSize + TeamMeter.padding);
        }

        meter() {
            let x = 0;
            let y = this.locy + TeamMeter.titleSize + TeamMeter.playerNumberSize + TeamMeter.padding * 2;

            this.myLevel = levels[this.name];

            for (let i = 0; i < this.myLevel; i++) {
                p.image(feetimg, x + i * feetimg.width, y);
            }
            p.imageMode('CENTER');

            p.image(saxImages[this.name], x + this.myLevel * feetimg.width, y - TeamMeter.padding);
        }

        liner() {
            if (this.lowerLineDisplay == true) {
                let x = 0;
                //let y = this.locy + TeamMeter.titleSize + TeamMeter.playerNumberSize + TeamMeter.padding * 4 + feetResizeH;
                const y = this.locy + TeamMeter.laneHeight; //twice the heighto f
                p.stroke(255);
                p.strokeWeight(5);
                p.drawingContext.setLineDash([10, 15]);
                p.strokeCap(p.SQUARE);
                p.line(x, y, p.width, y);
            }
        }
    }
    // Confetti class
    class SaxConfetti {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.speed = p.random(1, 5);
            //this.size = p.random(100, 200); // Set the size for the confetti
            this.angle = p.random(p.TWO_PI); // Random starting angle for rotation
            this.rotationSpeed = p.random(-0.05, 0.05); // Speed at which confetti rotates
        }

        fall() {
            this.y += this.speed; // Move confetti down
            //this.x += p.random(-1, 1); // Slight horizontal sway
            this.angle += this.rotationSpeed; // Rotate confetti
            if (this.y > p.height + 100) {
                this.y = p.random(-100, 0); // Reset to top if it goes off-screen
                this.x = p.random(p.width);
            }
        }

        show() {
            p.push();
            p.translate(this.x, this.y); // Move to confetti position
            p.rotate(this.angle); // Rotate confetti
            p.imageMode(p.CENTER);
            //p.image(saxConfettiImage, 0, 0, this.size, this.size); // Draw tiny version of the image
            p.image(saxConfettiImage, 0, 0);
            p.pop();
        }
    }
};

new p5(sketch, 'gameStatsContainer');

//each meter is a different instance of the TeamMeter class...4 stack on top of each other on the projector screen

