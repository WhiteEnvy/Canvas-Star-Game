import Obstacle from "./Obstacle";
import Canvas from "./Canvas";
import Scene from "./Scene";
import Player from "./Player";
import StarParticle from "./StarParticle";
import Utils from "../utils";
import { CollisionType } from "../constants/constants";
declare var Accelerometer;

class Game {
  public players: Array<Player>;
  public time: number;
  public scene: Scene;
  private isOver: boolean = false;
  private gameOverUI;
  private scoreUI;
  private score: number;
  private renderer;
  private player;
  public isMobile:boolean;

  constructor() {
    this.gameOverUI = $(".gameover-popup");
    this.scoreUI = $("#score");
    this.isMobile = Utils.mobilecheck();
  }
  init() {
    Canvas.updateSize();
    this.setActions();
    this.restart();
    this.render();
    this.generateObstacles();
    const accelerometer = new Accelerometer({ frequency: 60 });
    accelerometer.addEventListener("reading", (e) => {
      this.player.direction += (Math.PI / 180) * accelerometer.x * 3;
      this.player.speed = 5;
    });
    accelerometer.start();
  }

  play() {
    this.renderer = requestAnimationFrame(this.render.bind(this));
  }
  stop() {
    cancelAnimationFrame(this.renderer);
  }

  getCollisionObjects(type, object?) {
    switch(type){
        case CollisionType.ACTIVE: return this.scene.children.filter(child => child.collisionTypes.find(type => type == CollisionType.ACTIVE))
        case CollisionType.SELF: return this.scene.children.filter(child => Utils.getClass(child) == Utils.getClass(object));
    }
  }

  increseScore(value = 1) {
    this.score += value;
  }

  updateTime() {
    this.time += 0.005;
  }

  setActions() {
    $("#restart").click((event) => {
      this.restart();
    });

    $(window).resize(() => {
      Canvas.updateSize();
    });
  }

  generateStars(x = 0, y = 0) {
    let count = this.isMobile ? 20 : 100;
    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const star = new StarParticle(x, y);
      this.scene.add(star);
    }
  }

  generateObstacles() {
    const count = this.isMobile ? 5 : 20;
    setInterval(() => {
      if (this.scene.children.filter(c => c instanceof Obstacle).length == count || this.isOver) return;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      this.scene.add(new Obstacle(x, y));
    }, 2000);
  }

  createPlayer(x = 0, y = 0) {
    let player = new Player(x, y);
    this.player = player;
    this.scene.add(player);
    this.players.push(player);
  }

  killPlayer(player: Player) {
    this.scene.remove(player);
    this.players = this.players.filter(p => p != player);
    this.gameOver();
  }

  gameOver() {
    this.isOver = true;
    this.scoreUI.text(this.score);
    this.gameOverUI.addClass("game-over-active");
  }

  restart() {
    this.players = [];
    this.time = 0;
    this.scene = new Scene();
    this.generateStars();
    this.createPlayer(window.innerWidth / 2, window.innerHeight / 2);
    this.isOver = false;
    this.gameOverUI.removeClass("game-over-active");

    this.score = 0;
  }

  render() {
    this.renderer = requestAnimationFrame(this.render.bind(this));
    this.updateTime();
    Canvas.context.globalAlpha=0.7;
    Canvas.context.fillStyle = "#000000";
    Canvas.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.scene.draw();
  }
}
export default Game;
