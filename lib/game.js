const Thruster = require('./objects/thruster');
const RightTriangle = require('./objects/right_triangle');
const LeftTriangle = require('./objects/left_triangle');
const Ball = require('./ball');
const RightFlipper = require('./right_flipper');
const LeftFlipper = require('./left_flipper');
const BumperOne = require('./objects/bumper1');
const BumperTwo = require('./objects/bumper2');
const BumperThree = require('./objects/bumper3');
const LeftBump = require('./objects/left_bump');
const RightBump = require('./objects/right_bump');

let sPressed = false;

document.addEventListener("keydown", SpaceHandler, false);
document.addEventListener("keyup", SpaceHandlerUp, false);

function SpaceHandler(e) {
    if(e.keyCode === 32) {
        sPressed = true;
    }
}
function SpaceHandlerUp(e) {
    if(e.keyCode === 32) {
        sPressed = false;
    }
}

class Game {
  constructor(cjs = null) {
    this.thruster = new Thruster();
    this.ball = new Ball();
    this.rightTriangle = new RightTriangle();
    this.leftTriangle = new LeftTriangle();
    this.rightFlipper = new RightFlipper();
    this.leftFlipper = new LeftFlipper();
    this.bumperOne = new BumperOne();
    this.bumperTwo = new BumperTwo();
    this.bumperThree = new BumperThree();
    this.leftBump = new LeftBump();
    this.rightBump = new RightBump();
    this.score = 0;
    this.highscore = 0;
    this.sPressed = false;

    cjs ? this.cjs = cjs : this.cjs = new cionicjs.Cionic({
      streamLogger: function(msg, cls) {
        var logDiv = document.getElementById('log');
        logDiv.innerHTML += '<div class="'+cls+'">&gt;&nbsp;' + msg + '</div>';
        logDiv.scrollTop = logDiv.scrollHeight;
      }});

    this.cjs.Stream.registerListener('lPress', function(isPressed) {
      isPressed == "OFF" ? this.leftFlipper.lPressed = false : this.leftFlipper.lPressed = true;
    }.bind(this));

    this.cjs.Stream.registerListener('rPress', function(isPressed) {
      isPressed == "OFF" ? this.rightFlipper.rPressed = false : this.rightFlipper.rPressed = true;
    }.bind(this));

    this.cjs.Stream.registerListener('sPress', function(isPressed) {
      isPressed == "ON" ? this.sPressed = true : this.sPressed = false;
      this.thruster.downPressed = !this.thruster.downPressed;
    }.bind(this));

    // custom BLE handlers
    this.cjs.BLE.registerHandler('1', function() {
      console.log(new Date().getTime());
      this.leftFlipper.lPressed = true;
    }.bind(this));

    this.cjs.BLE.registerHandler('2', function() {
      this.leftFlipper.lPressed = false;
    }.bind(this));

    this.cjs.BLE.registerHandler('3', function() {
      this.rightFlipper.rPressed = true;
    }.bind(this));

    this.cjs.BLE.registerHandler('4', function() {
      this.rightFlipper.rPressed = false;
    }.bind(this));

    this.websocket = this.websocket.bind(this);
    this.ble = this.ble.bind(this);
  }

  draw(ctx){
    ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);

    this.thruster.draw(ctx);
    this.ball.draw(ctx);
    this.rightTriangle.draw(ctx);
    this.leftTriangle.draw(ctx);
    this.rightFlipper.draw(ctx);
    this.leftFlipper.draw(ctx);
    this.bumperOne.draw(ctx);
    this.bumperTwo.draw(ctx);
    this.bumperThree.draw(ctx);
    this.leftBump.draw(ctx);
    this.rightBump.draw(ctx);

    if (this.score > this.highscore) {
      this.highscore = this.score;
    }

    document.getElementById("test").innerHTML = this.score;
    document.getElementById("high").innerHTML = this.highscore;

    if (sPressed === true || this.sPressed === true) {
      this.ball.ballPosX = 445;
      this.ball.ballPosY = 384;
      this.ball.ballVelX = 0;
      this.ball.ballVelY= 0;
      this.score = 0;
      document.getElementById("test").innerHTML = this.score;
      sPressed = false;
      this.sPressed = false;
    }
  }

  step(delta){
    // Thruster Ball Starting Movement
    if (this.ball.ballPosX === 445 &&
        this.ball.ballPosY + 15 > this.thruster.tposY) {
      this.ball.thrust(delta);
    } else if (this.ball.ballPosX === 445 && this.ball.ballPosY < 80) {
      this.ball.firstReflect(delta);
    }

    this.checkCollisions();
  }

  checkCollisions(){
    // Flipper Collision
    const flippers = this.flippers();
    for (var i = 0; i < flippers.length; i++) {
      let ball = {x: this.ball.ballPosX - this.ball.radius, y: this.ball.ballPosY - this.ball.radius, height: this.ball.radius * 2, width: this.ball.radius * 2};
      let flipper1 = {x: flippers[i].pos1.x, y: flippers[i].posY, height: flippers[i].halfheight * 2, width: flippers[i].halfwidth * 2};
      let flipper2 = {x: flippers[i].pos2.x, y: flippers[i].posY, height: flippers[i].halfheight * 2, width: flippers[i].halfwidth * 2}; 
      if (this.ball.isCollidedWithLine(flippers[i]) || this.ball.isCollide(ball, flipper1) || this.ball.isCollide(ball, flipper2)) {
          this.ball.hitbackFlipper(flippers[i]);
        }
    }

    // Wall Collision
    if (this.ball.ballPosY <= (0 + this.ball.radius)) {
      this.ball.collidewithTopWall();
    } else if (this.ball.ballPosX >= (Game.DIM_X - this.ball.radius)) {
      this.ball.collidewithRightWall();
    } else if (this.ball.ballPosX <= this.ball.radius) {
      this.ball.collidewithLeftWall();
    }

    // BumperCollision
    const bumpers = this.bumpers();
    for (var j = 0; j < bumpers.length; j++) {
      if (this.ball.isCollidedWithBumpers(bumpers[j])) {
        this.ball.hitbackBumper(bumpers[j]);
        if (j===2) {
          this.score += 7;
        } else {
          this.score += 5;
        }
      }
    }

    const bumps = this.bumps();
    for (var i = 0; i < bumps.length; i++) {
      let ball = {x: this.ball.ballPosX - this.ball.radius, y: this.ball.ballPosY - this.ball.radius, height: this.ball.radius * 2, width: this.ball.radius * 2};
      let bump1 = {x: bumps[i].pos1.x, y: bumps[i].pos1.y, height: bumps[i].halfheight * 2, width: bumps[i].halfwidth * 2};
      let bump2 = {x: bumps[i].pos2.x, y: bumps[i].pos2.y, height: bumps[i].halfheight2 * 2, width: bumps[i].halfwidth2 * 2}; 
      // if (this.ball.isCollidedWithLine(bumps[i]) || this.ball.isCollide(ball, bump1) || this.ball.isCollide(ball, bump2)) {
        if (this.ball.isCollidedWithLine(bumps[i])) {
        this.ball.hitbackBump(bumps[i]);
        this.score += 3;
      } else if (this.ball.isCollidedwithSideBump(bumps[i]) || this.ball.isCollide(ball, bump2)) {
        this.ball.collidewithSideBump();
        this.score += 3;
      }
    }

    const triangles = this.triangles();
    for (var l = 0; l < triangles.length; l++) {
      if (this.ball.isCollidedWithLine(triangles[l])) {
        this.ball.hitbackTriangle(triangles[l]);
      }
    }

  }

  flippers() {
    return [].concat(this.rightFlipper, this.leftFlipper);
  }

  bumpers() {
    return [].concat(this.bumperOne, this.bumperTwo, this.bumperThree);
  }

  bumps(){
    return [].concat(this.leftBump, this.rightBump);
  }

  triangles(){
    return [].concat(this.leftTriangle, this.rightTriangle);
  }

  websocket(){
    var host = document.getElementById('host').value;
    this.cjs.Stream.socket(host);
  }
  
  ble(){
    this.cjs.ble();
  }

}

module.exports = Game;

Game.DIM_X = 470;
Game.DIM_Y = 570;
Game.BG_COLOR = 'white';
