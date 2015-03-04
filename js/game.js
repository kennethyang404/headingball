
var stage, w, h, loader;
var background, sheep, ball, superball, box;
var game_ended, dropped, done, score, scoreText, combo, score_waiting, score_updateframes, comboText, boxText;

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
        {src: "button1.png", id: "button1"},
        {src: "button2.png", id: "button2"},
    ];

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest, true, "img/");
}

function handleComplete() {

    game_ended = false;
    dropped = false;
    done = false;

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

    stage.addChild(background, sheep, ball, superball, scoreText, comboText);
    stage.addEventListener("stagemousedown", handleJump);
    
    createjs.Ticker.addEventListener("tick", tick);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLink(i) {
    var arr = new Array("http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101939&idx=1&sn=1f952299850ab67414b0bb2a084c0243",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211099024&idx=1&sn=d5ea4af913545f845d7067ce17bf5d16",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211099638&idx=1&sn=4922b1074598d898af5ce9c66054a41a",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211099803&idx=1&sn=a52e716e81ea001c34d8424379a96d90",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101970&idx=1&sn=b5d8e8a1a5dc3c6ac32d4796b5af27fd",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211100510&idx=1&sn=b634b1bd3fa39bd9c8f0f8151cdc05d0",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211100594&idx=1&sn=81f33c7ec570183c4c700e96f7a9a60f",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211100730&idx=1&sn=3f09ec00fff538680f8a5cc95b766765",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211102072&idx=1&sn=aa20df6fc4a2b876e311c23480145f0a",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211100917&idx=1&sn=fc3a9b9bbe3033f0c2cef855f4842916",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211100981&idx=1&sn=42be74b1b51166f55de5b3fafc20e373",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101018&idx=1&sn=2a1b70e9bb059cb0cbd493314e32af35",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211102119&idx=1&sn=12c67d624daf3e09078e61ab7971d60b",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101289&idx=1&sn=a6b46e2176e6cf21b460ebf0a622079a",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101321&idx=1&sn=3249807af2e3b270c2393cd9196cd2e7",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101349&idx=1&sn=17bed4fc9b4ffbc9b566bc01771d479c",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211102164&idx=1&sn=803f63e055304f5d3de80c2842de74f2",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101432&idx=1&sn=b1489d0008febd6d2cd07263df4a1a5e",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101462&idx=1&sn=90aff91789e21c02a0dd8e595fd35150",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101515&idx=1&sn=ab4c7258021857b9a230dc557e02c2bb",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211102193&idx=1&sn=7cfce93bea2255bc57d5cfd199be73ae",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101635&idx=1&sn=35acc9ac9f6cc2dd148e4d5a44b15f68",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101671&idx=1&sn=feafe8a9f38601c8640991c0e3263a61",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101714&idx=1&sn=96dd8a656472d1d3d1e5b0ecbeffaf93",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211102216&idx=1&sn=16df8ece5abaab93c7d0b22b37d1deeb",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101757&idx=1&sn=d89536ba54675ce59d3ca61ea00c6f03",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101790&idx=1&sn=cf0cbb44666056f7effd1286de4ed48f",
                        "http://mp.weixin.qq.com/s?__biz=MjM5MTE0MzUyMQ==&mid=211101815&idx=1&sn=5e01384ce54b10377998aeaf23382643");
    return arr[getRandomInt(0,6)*4+i];
}

function gameover() {

    var t = "接下来试试让元宵冲上云霄吧！";
    var tt = 0;
    if (score>100) {
        t = "你顶元宵的功力已经略有小成！";
        tt = 1;
    }
    if (score>300) {
        t = "你顶元宵的功力已经炉火纯青！";
        tt = 2;
    }
    if (score>600) {
        t = "你顶元宵的功力已经出神入化！";
        tt = 3;
    } 

    var link = generateLink(tt);

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

    boxText = new createjs.Text(t+"\n\n去看看露馅的元宵里面藏了什么吧", "40px Hiragino Sans GB", "#000");
    boxText.x=box.x-box.image.width * 6 / 10;
    boxText.y=box.y-box.image.height / 2;    
    
    tryAgainButton = new createjs.Bitmap(loader.getResult("button1"));
    tryAgainButton.desireX=box.desireX/3;
    tryAgainButton.scaleX=tryAgainButton.desireX / tryAgainButton.image.width;
    tryAgainButton.scaleY=tryAgainButton.scaleX;
    tryAgainButton.desireY=tryAgainButton.scaleY * tryAgainButton.image.height;
    tryAgainButton.regX=tryAgainButton.image.width / 2;
    tryAgainButton.regY=tryAgainButton.image.height / 2;
    tryAgainButton.x=box.x-box.image.width/3;
    tryAgainButton.y=box.y+box.image.height/3;    
    tryAgainButton.addEventListener("click", function(event) { location.reload(); }); 

    redirectButton = new createjs.Bitmap(loader.getResult("button2"));
    redirectButton.desireX=box.desireX/3;
    redirectButton.scaleX=redirectButton.desireX / redirectButton.image.width;
    redirectButton.scaleY=redirectButton.scaleX;
    redirectButton.desireY=redirectButton.scaleY * redirectButton.image.height;
    redirectButton.regX=redirectButton.image.width / 2;
    redirectButton.regY=redirectButton.image.height / 2;
    redirectButton.x=box.x+box.image.width/3;
    redirectButton.y=box.y+box.image.height/3;     
    redirectButton.addEventListener("click", function(event) { window.location.replace(link); });  

    stage.addChild(box, boxText, tryAgainButton, redirectButton);

    done = true;
}

function setPhysics() {
    sheep.v = 0;
    sheep.state="up";
    sheep.maxHeight = hh - sheep.desireX * 0.3;
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
        ball.y=sheep.y-sheep.desireY;
        if (sheep.state == "down" || sheep.state=="stay") {
            comboText.visible = false;
            game_ended = true;
            ball.vx = ball.initV / 3;
            ball.vy = ball.initV / 2;
            superball.visible = true;
            ball.visible = false;
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
    if (ball.y<sheep.y+20) {
        ball.y-=ball.vy;
        ball.x+=ball.vx;
        ball.vy-=ball.a;
        superball.x=ball.x;    
        superball.y=ball.y;
    } else {
        dropped=true;
    }
}

function updateScore() {
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
    comboText.text = "哇"+Array(combo + 1).join("~")
}

function tick(event) {

    updateScore();

    if (! game_ended) {
        move();
        stage.update();
    } else {
        if (! dropped) {
            drop();
            stage.update();
        } else {
            if (! done) {
                gameover();
                stage.update();
            }
        }
    }
}
