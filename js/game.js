
var stage, w, h, loader;
var background, sheep, ball, superball, box;
var game_ended, score, scoreText, combo, score_waiting, score_updateframes, comboText, boxText;

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
        {src: "box.png", id: "box"},
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
    sheep.desireX=w/4;
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
    superball.desireX=ball.desireX;
    superball.desireY=ball.desireX;
    superball.scaleX=ball.scaleX;
    superball.scaleY=ball.scaleX;
    superball.regX=ball.regX;
    superball.regY=ball.regY;
    superball.x=ball.x;
    superball.y=ball.y;
    superball.visible = false;

    createjs.Ticker.framerate = 60;
    setPhysics();

    combo=0;
    score=0;
    score_waiting=0;
    score_updateframes=0;
    scoreText = new createjs.Text("分数: " + score, "bold 64px Hiragino Sans GB", "#EEF0F2");
    scoreText.x = w / 20;
    scoreText.y = h / 20;
    comboText = new createjs.Text("哇~", "100px Hiragino Sans GB", "#FFEFC2");
    comboText.x = w * 2 / 3;
    comboText.y = h * 2 / 3;   
    comboText.visible = false; 

    box = new createjs.Bitmap(loader.getResult("box"));
    box.desireX=w*4/5;
    box.scaleX=box.desireX / box.image.width;
    box.scaleY=box.scaleX;
    box.desireY=box.scaleY * box.image.height;
    box.regX=box.image.width / 2;
    box.regY=box.image.height / 2;
    box.x=w/2;
    box.y=hh/2;
    box.alpha=0.9;
    box.visible = false;

    boxText = new createjs.Text("你顶元宵的水平已经\n\n    ", "40px Hiragino Sans GB", "#000");
    boxText.x=box.x-box.image.width * 6 / 10;
    boxText.y=box.y-box.image.height / 2;    
    boxText.visible = false;   

    stage.addChild(background, sheep, ball, superball, scoreText, comboText, box, boxText);
    stage.addEventListener("stagemousedown", handleJump);
    
    createjs.Ticker.addEventListener("tick", tick);
}

function gameover() {
    score=1000;
    var t = "你能让元宵飞出屏幕吗";
    if (score>100) {
        t = "顶得漂亮";
    }
    if (score>300) {
        t = "你顶元宵的功力已经略有小成";
    }
    if (score>600) {
        t = "你顶元宵的功力已经炉火纯青";
    }
    if (score>1000) {
        t = "我打赌你在好友里一定是顶得最高的";
    }
    if (score>5000) {
        t = "中国足球未来的希望！";
    }    
    boxText.text = t+"\n\n去看看露馅的元宵里面藏了什么吧";
    box.visible = true;
    boxText.visible = true;   
}

function setPhysics() {
    sheep.v = 0;
    sheep.state="up";
    sheep.maxHeight = hh - sheep.desireX * 0.4;
    sheep.criticalH = hh - sheep.desireX * 0.05;
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
            comboText.visible = false;
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
                comboText.visible = true; 
            } else {
                ball.state = "up";
                ball.v = ball.initV;
                superball.visible = false;
                ball.visible = true; 
                combo = 0;   
                score_waiting += 1;   
                comboText.visible = false; 
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
