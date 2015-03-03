
var stage, w, h, loader;
var background, sheep, ball, superball, score, scoreText, combo, score_waiting, score_updateframes;

function init() {

    canvas = document.getElementById("easel");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stage = new createjs.Stage("easel");
    
    createjs.Touch.enable(stage);
    
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
    ball.desireX=sheep.desireX/1.5;
    ball.desireY=ball.desireX;
    ball.scaleX=ball.desireX / ball.image.width;
    ball.scaleY=ball.scaleX;
    ball.regX=ball.image.width / 2;
    ball.regY=ball.image.height;
    ball.x=w/2;
    ball.y=h/2;
    ball.visible = true;

    superball = new createjs.Bitmap(loader.getResult("ball2"));
    superball.desireX=sheep.desireX/1.5;
    superball.desireY=ball.desireX;
    superball.scaleX=ball.desireX / ball.image.width;
    superball.scaleY=ball.scaleX;
    superball.regX=ball.image.width / 2;
    superball.regY=ball.image.height;
    superball.x=w/2;
    superball.y=h/2;
    superball.visible = false;

    createjs.Ticker.framerate = 60;
    setPhysics();

    combo=0;
    score=0;
    score_waiting=0;
    score_updateframes=0;
    scoreText = new createjs.Text("分数: " + score, "bold 64px Hiragino Sans GB", "#FFF");
    scoreText.x = canvas.width / 20;
    scoreText.y = canvas.height / 20;

    stage.addChild(background, sheep, ball, superball, scoreText);
    stage.addEventListener("stagemousedown", handleJump);
    
    createjs.Ticker.addEventListener("tick", tick);
}

function gameover() {
    window.alert("Game Over.");
}

function setPhysics() {
    sheep.v = 0;
    sheep.state = "stay";
    sheep.maxHeight = h - sheep.desireX/1.3;
    sheep.criticalH = h - sheep.desireX/1.4;
    sheep.initV = sheep.maxHeight / (createjs.Ticker.framerate * 1.2);

    ball.maxHeight = h/1.8;
    ball.initV = sheep.initV * 2.5;
    ball.superV = ball.initV * 1.5;
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
        if ((sheep.state == "down" || sheep.y>sheep.criticalH)&&sheep.state=="stay") {
            gameover();
        }
        if (sheep.y<=sheep.criticalH) {
            ball.state="superUp";
            ball.v=ball.superV;
            superball.visible = true;
            ball.visible = false;
            combo += 1;
            score_waiting += 10 * combo;
        } else {
            ball.state = "up";
            ball.v = ball.initV;
            superball.visible = false;
            ball.visible = true; 
            combo = 0;   
            score_waiting += 1;   
        }
    }

    ball.y-=ball.v;
    superball.y=ball.y;
    ball.v-=ball.a;
    if (ball.v<0) {
        ball.state="down"
    }

    if (score_updateframes < 3) {
        score_updateframes += 1;
    } else {
        score_updateframes = 0;
        if (score_waiting>0) {
            score += 1;
            score_waiting -= 1;
        }
        scoreText.text = "分数：" + score;
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
