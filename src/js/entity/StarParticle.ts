import GameObject from "./GameObject";
import Global from "../global";
import Utils from "../utils";
import Canvas from "./Canvas";
import { CollisionType } from "../constants/constants";

class StarParticle extends GameObject {
    private collisions;
    private lines;

    constructor(x = 0, y = 0) {
        super(x, y, [CollisionType.SELF]);
        this.radius = 3;
        this.colors = [
            [128, 48, 231, 0.3],
            [17, 3, 36, 0.3]
        ];
        this.collisions = [];
        this.lines = [];
        this.speed = 0.5;
    }

    draw() {
        Canvas.context.beginPath();
        Canvas.context.fillStyle = this.color;
        Canvas.context.lineWidth = 3;
        Canvas.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        Canvas.context.fill();
    }

    checkCollision(star) {
        const distance = Utils.getDistance(this, star);
        return star != this && distance < this.radius + star.radius && this.collisions.find(c => c === star);
    }

    onCollision() {
        Global.game.getCollisionObjects(CollisionType.SELF, this).forEach(star => {
            if (this.checkCollision(star)) {
                star.collisions.push(this);
                star.direction = this.direction;
                star.moveByDirection();
                this.direction += Math.PI;
                this.moveByDirection();
            }
            const distance = Utils.getDistance(this, star);
            const maxDistance = 30;
            if (star != this && distance < maxDistance && this.lines.indexOf(star) == -1) {
                star.lines.push(this);
                Canvas.context.beginPath();
                let grad = Canvas.context.createLinearGradient(this.x, this.y, star.x, star.y);
                grad.addColorStop(0, `rgba(128, 0, 128, ${1 - distance / maxDistance})`);
                grad.addColorStop(1, `rgba(255, 192, 203, ${1 - distance / maxDistance})`);
                Canvas.context.strokeStyle = grad;
                Canvas.context.lineWidth = 2;
                Canvas.context.moveTo(this.x, this.y);
                Canvas.context.lineTo(star.x, star.y);
                Canvas.context.stroke();
            }
        });
        this.lines = [];
        this.collisions = [];
    }

    update() {
        this.moveByDirection();
        this.updateColor();
        this.onCollision();
    }
}

export default StarParticle;