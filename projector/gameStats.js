
let sketch = (p) => {
    let canvasWidth = document.getElementById('gameStatsContainer').clientWidth-20;
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

    p.preload = function () {
        feetimg = p.loadImage('assets/two-shoes.png');
        varsityfont = p.loadFont('assets/VarsityTeam-Bold.otf');
        creatofont = p.loadFont('assets/CreatoDisplay-Regular.otf');
    }

    p.setup = function () {
        p.createCanvas(canvasWidth, canvasHeight);
        feetResizeW = p.width/17;
        feetimg.resize(feetResizeW, 0);
        feetResizeH = feetimg.height; //after resizing, declare this height
        let meterLaneHeight = p.height*0.25;
        meters[0] = new TeamMeter('soprano', 0);
        meters[1] = new TeamMeter('alto', meterLaneHeight);
        meters[2] = new TeamMeter('tenor', meterLaneHeight*2);
        meters[3] = new TeamMeter('bari', meterLaneHeight*3);
    };

    p.draw = function () {
        p.clear();

        for (let i = 0; i < 4; i++) {
            meters[i].teamtitle(varsityfont);
            meters[i].numPlayers(creatofont);
            meters[i].meter();
            meters[i].liner();
        }
    };

    //4 lanes for each team, each stacked on one another
    class TeamMeter {

        static feetResizeH;
        static titleSize = titleSize;
        static playerNumberSize = playerNumberSize;
        static padding = padding;

        constructor(name, locy) {
            this.name = name;
            this.locy = locy;
            this.playerNumber = playerNumbers[this.name];
            this.myLevel = levels[this.name];
            // this.titleSize = 50; //size of the "team" text
            // this.playerNumberSize = 25; //size of the player number indicator text
            // this.padding = 10; //vertical padding between elements
        }

        teamtitle(fontSet) {
            p.fill(255);
            p.noStroke();
            p.drawingContext.shadowOffsetX = 2;
            p.drawingContext.shadowOffsetY = 2;
            p.drawingContext.shadowColor = 'black';
            p.textSize(TeamMeter.titleSize);
            p.textFont(fontSet);
            p.textAlign(p.LEFT, p.TOP);
            p.text('team ' + this.name, 0, this.locy);
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
        }

        liner(){
            let x = 0;
            let y = this.locy + TeamMeter.titleSize + TeamMeter.playerNumberSize + TeamMeter.padding * 4 + feetResizeH;
            p.stroke(255);
            p.strokeWeight(5);
            p.drawingContext.setLineDash([10,15]);
            p.strokeCap(p.SQUARE);
            p.line(x,y,p.width,y);
        }
    }
};

new p5(sketch, 'gameStatsContainer');

//each meter is a different instance of the TeamMeter class...4 stack on top of each other on the projector screen

