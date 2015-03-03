
var stage, w, h, loader;
var background, sheep, ball, superball;
var game_ended, score, scoreText, combo, score_waiting, score_updateframes;

function init() {

    canvas = document.getElementById("easel");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stage = new createjs.Stage("easel");
    
    createjs.Touch.enable(stage);
    
    w = stage.canvas.width;
    h = stage.canvas.height;
    hh = h*9/10;

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

    game_ended = false;

    background = new createjs.Bitmap(loader.getResult("background"));
    background.setTransform(0,0, w / background.image.width, h / background.image.height);

    sheep = new createjs.Bitmap(loader.getResult("sheep"));
    sheep.desireX=w/3.5;
    sheep.desireY=sheep.desireX;
    sheep.scaleX=sheep.desireX / sheep.image.width;
    sheep.scaleY=sheep.scaleX;
    sheep.regX=sheep.image.width / 2;
    sheep.regY=sheep.image.height;
    sheep.x=w/2;
    sheep.y=hh-1;

    ball = new createjs.Bitmap(loader.getResult("ball1"));
    ball.desireX=sheep.desireX*0.75;
    ball.desireY=ball.desireX;
    ball.scaleX=ball.desireX / ball.image.width;
    ball.scaleY=ball.scaleX;
    ball.regX=ball.image.width / 2;
    ball.regY=ball.image.height;
    ball.x=w/2;
    ball.y=hh*2/3;
    ball.visible = true;

    superball = new createjs.Bitmap(loader.getResult("ball2"));
    superball.desireX=sheep.desireX/1.5;
    superball.desireY=ball.desireX;
    superball.scaleX=ball.desireX / ball.image.width;
    superball.scaleY=ball.scaleX;
    superball.regX=ball.image.width / 2;
    superball.regY=ball.image.height;
    superball.x=w/2;
    superball.y=hh/2;
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
    location.reload();
}

function setPhysics() {
    sheep.v = 0;
    sheep.state="up";
    sheep.maxHeight = hh - sheep.desireX * 0.4;
    sheep.criticalH = hh - sheep.desireX * 0.08;
    sheep.initV = sheep.maxHeight / (createjs.Ticker.framerate * 2.2);
    sheep.v=sheep.initV;

    ball.maxHeight = hh/3;
    ball.initV = sheep.initV * 2.5;
    ball.superV = ball.initV * 2.2;
    ball.a = 2 * ball.initV * ball.initV / (2 * ball.maxHeight);
    ball.v = -Math.sqrt(2*ball.a*(ball.maxHeight/2));
    ball.state = "down";
}


function handleJump() {
    if (sheep.state=="stay") {
        sheep.state="up";
        sheep.v=sheep.initV;
    } 
}

function move() {
    if (ball.state=="down" && ball.y>=sheep.y-sheep.desireY-20) {
        if (sheep.state == "down" || sheep.state=="stay") {
            game_ended = true;
            ball.vx = ball.initV / 3;
            ball.vy = ball.initV / 2;
        } else {
            if (sheep.y>sheep.criticalH) {
                ball.state="superUp";
                ball.v=ball.superV*(1+Math.random()/5);
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
    }

    ball.y-=ball.v;
    superball.y=ball.y;
    ball.v-=ball.a;
    if (ball.v<0) {
        ball.state="down"
    }

    if (sheep.state=="up" && sheep.y<=sheep.maxHeight) {
        sheep.state="down";
        sheep.v=-sheep.initV;
    }
    if (sheep.state=="down" && sheep.y>=hh) {
        sheep.state="stay";
        sheep.v=0;
    }    
    sheep.y-=sheep.v;
}

function drop() {

    if (ball.y<hh+w/10) {
        ball.y-=ball.vy;
        ball.x+=ball.vx;
        ball.vy-=ball.a;    
    } else {
        gameover();
    }
}

function updateScore() {
    if (score_updateframes < 4) {
        score_updateframes += 1;
    } else {
        score_updateframes = 0;
        if (score_waiting>0) {
            score += 1;
            score_waiting -= 1;
        }
        scoreText.text = "分数：" + score;
    }    
}

function tick(event) {

    updateScore();

    if (! game_ended) {
        move();
    } else {
        drop();
    }

    stage.update();
}
