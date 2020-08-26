import GameObject from "./GameObject";
import Utils from "../utils";
import Canvas from "./Canvas";
import Global from "../global";
import { CollisionType } from "../constants/constants";

class Obstacle extends GameObject {
    public collisions;
    public lines;
    private updateRadiusStep;
    public isDead: boolean;

    constructor(x, y) {
        super(x, y, [CollisionType.ACTIVE, CollisionType.SELF]);
        this.updateRadiusStep = 0.5;
        this.collisions = [];
        this.lines = [];
        this.isDead = false;
    }
    
    checkCollision(obstacle) {
        const distance = Utils.getDistance(this, obstacle);
        return obstacle != this && distance < this.radius + obstacle.radius && this.collisions.find(c => c === obstacle)
    }

    onCollision() {
        Global.game.getCollisionObjects(CollisionType.SELF, this).forEach(obstacle => {
            if (this.checkCollision(obstacle)) {
                obstacle.collisions.push(this);
                obstacle.direction = this.direction;
                obstacle.moveByDirection();
                this.direction += Math.PI;
                this.moveByDirection();
            }
            const distance = Utils.getDistance(this, obstacle);
            const maxDistance = 400;

            if (obstacle != this && distance < maxDistance && this.lines.indexOf(obstacle) == -1) {
                obstacle.lines.push(this);
                Canvas.context.beginPath();
                let grad = Canvas.context.createLinearGradient(this.x, this.y, obstacle.x, obstacle.y);
                grad.addColorStop(0, `rgba(202, 10, 241, ${1 - distance / maxDistance})`);
                grad.addColorStop(1, `rgba(241, 10, 99, ${1 - distance / maxDistance})`);
                Canvas.context.strokeStyle = grad;
                Canvas.context.lineWidth = 2;
                Canvas.context.moveTo(this.x, this.y);
                Canvas.context.lineTo(obstacle.x, obstacle.y);
                Canvas.context.stroke();
            }
        });
        this.collisions = [];
        this.lines = [];
    }

    die() {
        this.isDead = true;
        Global.game.scene.remove(this);
    }

    changeRadius() {
        this.radius += this.updateRadiusStep;
        if (this.radius > 30 || this.radius < 5) this.updateRadiusStep = -this.updateRadiusStep;
    }

    update() {
        super.update();
        this.updateColor();
        if(this.isDead == false){
            this.changeRadius();
            this.onCollision();
        }
    }
}
export default Obstacle;