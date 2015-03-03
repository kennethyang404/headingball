
var stage, w, h, loader;
var background, sheep, ball, vball1, vball2, g;

function init() {

    canvas = document.getElementById("easel");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stage = new createjs.Stage("easel");

    // grab canvas width and height for later calculations
    w = stage.canvas.width;
    h = stage.canvas.height;

    manifest = [
        {src: "sheep.png", id: "sheep"},
        {src: "background.png", id: "background"},
        {src: "white1.png", id: "ball1"},
        {src: "white2.png", id: "ball2"},
    ];

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest, true, "img/");
}

function handleComplete() {
    background = new createjs.Bitmap(loader.getResult("background"));
    background.setTransform(0,0, w / background.image.width, h / background.image.height);
    background.alpha = 0.9;

    sheep = new createjs.Bitmap(loader.getResult("sheep"));
    sheep.desireX=w/5;
    sheep.desireY=sheep.desireX;
    sheep.scaleX=sheep.desireX / sheep.image.width;
    sheep.scaleY=sheep.scaleX;
    sheep.regX=sheep.image.width / 2;
    sheep.regY=sheep.image.height;
    sheep.x=w/2;
    sheep.y=h-1;

    ball = new createjs.Bitmap(loader.getResult("ball1"));
    ball.desireX=sheep.desireX/2;
    ball.desireY=ball.desireX;
    ball.scaleX=ball.desireX / ball.image.width;
    ball.scaleY=ball.scaleX;
    ball.regX=ball.image.width / 2;
    ball.regY=ball.image.height;
    ball.x=w/2;
    ball.y=h/2;

    createjs.Ticker.framerate = 30;
    setPhysics();

    stage.addChild(background, sheep, ball);
    stage.addEventListener("stagemousedown", handleJump);
    
    createjs.Ticker.addEventListener("tick", tick);
}

function gameover() {
  
}

function setPhysics() {
    sheep.v = 0;
    sheep.state = "stay";
    sheep.maxHeight = h - sheep.desireX/1.3;
    sheep.initV = sheep.maxHeight / (createjs.Ticker.framerate * 1.2);

    ball.maxHeight = h/1.8;
    ball.initV = sheep.initV * 2.5;
    ball.a = ball.initV * ball.initV / (2 * ball.maxHeight);
    ball.v = -Math.sqrt(2*ball.a*(ball.maxHeight/2));
    ball.maxHeight += sheep.desireY;
    ball.state = "down";
}


function handleJump() {
    if (sheep.state=="stay") {
        sheep.state="up";
        sheep.v=sheep.initV;
    }
}

function move() {
    if (ball.state=="down" && ball.y>=sheep.y-sheep.desireY) {
        ball.state="up";
        ball.v=ball.initV;
    }
    ball.y-=ball.v;
    ball.v-=ball.a;
    if (ball.v<0) {
        ball.state="down"
    }

    if (sheep.state=="up" && sheep.y<=sheep.maxHeight) {
        sheep.state="down";
        sheep.v=-sheep.initV;
    }
    if (sheep.state=="down" && sheep.y>=h-1) {
        sheep.state="stay";
        sheep.v=0;
    }    
    sheep.y-=sheep.v;
}

function tick(event) {
    move();
    stage.update();
}
