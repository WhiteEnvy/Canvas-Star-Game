import Canvas from "./Canvas";
import Global from "../global";
import Utils from "../utils";
import Meteor from "./Meteor";
import Rectangle from "./Rectangle";
import GameObject from "./GameObject";
import { CollisionType } from "../constants/constants";

class Player extends GameObject {
  public meteors: Array<Meteor>;
  public fireParticles: Array<Rectangle>;
  private triangles;
  private keys = {
    left: {
      action: () => (this.direction += (Math.PI / 180) * 3),
      active: false,
    },
    right: {
      action: () => (this.direction -= (Math.PI / 180) * 3),
      active: false,
    },
    top: {
      action: () => {
        if (this.speed < 10) this.speed += 0.1;
      },
      active: false,
    },
    bottom: {
      action: () => {
        if (this.speed > 0) this.speed -= 0.05;
      },
      active: false,
    },
  };
  private leftSideColor;
  private rightSideColor;
  private dropRectanglesAnim;

  constructor(x, y) {
    super(x, y, [CollisionType.PLAYER]);
    this.radius = 20;
    this.direction = 0;
    this.speed = 0;
    this.meteors = [];
    this.fireParticles = [];
    this.leftSideColor = "#51c7f9";
    this.rightSideColor = "#3eaaf8";
    this.triangles = {
      left: [
        { x: 0, y: -20 },
        { x: 0, y: 15 },
        { x: -15, y: 20 },
      ],
      right: [
        { x: 0, y: -20 },
        { x: 0, y: 15 },
        { x: 15, y: 20 },
      ],
    };
    this.init();
  }

  init() {
    this.setPlayerActions();
    this.dropRectangles();
  }

  setPlayerActions() {
    $(window).keydown((e) => {
      switch (e.which) {
        case 38:
          this.keys.top.active = true;
          break;
        case 40:
          this.keys.bottom.active = true;
          break;
        case 37:
          this.keys.left.active = true;
          break;
        case 39:
          this.keys.right.active = true;
          break;
      }
    });

    $(window).keyup((e) => {
      switch (e.which) {
        case 38:
          this.keys.top.active = false;
          break;
        case 40:
          this.keys.bottom.active = false;
          break;
        case 37:
          this.keys.left.active = false;
          break;
        case 39:
          this.keys.right.active = false;
          break;
      }
    });
  }

  updateControls() {
    Object.values(this.keys).forEach((key) => {
      if (key.active) key.action();
    });
  }

  draw() {
    this.drawFireParticles();
    this.drawMeteors();
    Canvas.context.shadowBlur = 20;
    this.drawTriangle(this.leftSideColor, this.triangles.left);
    this.drawTriangle(this.rightSideColor, this.triangles.right);
    Canvas.context.shadowColor = this.leftSideColor;
    Canvas.context.shadowBlur = 0;
  }

  drawMeteors() {
    this.meteors.forEach((meteor) => {
      meteor.update();
    });
  }

  drawFireParticles() {
    this.fireParticles.forEach((particle, index) => {
      particle.update();
      if (particle.alpha <= 0) {
        this.fireParticles.splice(index, 1);
      }
    });
  }

  drawTriangle(color, triangle) {
    Canvas.context.beginPath();
    Canvas.context.fillStyle = color;
    this.rotatedTriangle(triangle).forEach((point, index) => {
      if (index == 0) {
        Canvas.context.moveTo(point.x + this.x, point.y + this.y);
      } else {
        Canvas.context.lineTo(point.x + this.x, point.y + this.y);
      }
    });
    Canvas.context.fill();
  }

  rotatedTriangle(triangle) {
    return triangle.map((point) => {
      return {
        x: point.x * Math.cos(this.direction) + point.y * Math.sin(this.direction),
        y: point.y * Math.cos(this.direction) - point.x * Math.sin(this.direction)
      };
    })
  }

  update() {
    this.updateControls();
    this.moveByDirection();
    this.updateColor();
    this.onCollision();
  }

  createMeteor() {
    const meteor = new Meteor(this);
    this.meteors.push(meteor);
  }

  createFireParticle(x, y, direction, color?) {
    const rectangle = new Rectangle(x, y, direction, color);
    this.fireParticles.push(rectangle);
  }

  dropRectangles() {
    this.dropRectanglesAnim = setInterval(() => {
      this.createFireParticle(this.x, this.y, this.direction);
    }, 50);
  }

  checkCollision(obj) {
    const distance = Utils.getDistance(this, obj);
    return obj != this && distance < this.radius + obj.radius;
  }

  onCollision() {
    Global.game.getCollisionObjects(CollisionType.ACTIVE).forEach((obstacle) => {
      if (this.checkCollision(obstacle) && obstacle.isDead == false) {
        if (obstacle.state < 0) {
          if (this.meteors.length) {
            this.meteors.splice(0, 1);
            this.onObstacleDestroy(obstacle);
          } else {
            Global.game.killPlayer(this);
            this.die();
          }
        } else {
          this.onObstacleDestroy(obstacle);
          this.createMeteor();
        }
      }
    });
  }

  die() {
    let angle = 0;
    for (let i = 0; i < 180; i++) {
      this.createFireParticle(this.x, this.y, angle);
      angle += (Math.PI * 2) / 180;
    }

    clearInterval(this.dropRectanglesAnim);
  }

  onObstacleDestroy(obstacle) {
    Global.game.increseScore();
    let angle = 0;
    for (let i = 0; i < 30; i++) {
      this.createFireParticle(obstacle.x, obstacle.y, angle, obstacle.colorArr);
      angle += (Math.PI * 2) / 30;
    }
    obstacle.die();
  }
}

export default Player;
