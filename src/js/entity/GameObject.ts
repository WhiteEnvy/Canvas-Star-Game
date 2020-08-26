import Canvas from './Canvas';
import Global from '../global';
import SceneObject from '../interfaces/SceneObject';

class GameObject implements SceneObject {
    public x:number;
    public y:number;
    public radius:number;
    public direction:number;
    public speed:number;
    public color: string;
    public shiftColor:number;
    public state:number;
    public colors;
    public colorArr;
    public collisionTypes;
    
    constructor(x = 0, y = 0, collisionTypes) {
        this.x = x;
        this.y = y;
        this.collisionTypes = collisionTypes;
        this.radius = 15;
        this.direction = Math.random() * Math.PI * 2;
        this.state = 0;
        this.speed = 3;
        this.color = "rgb(36, 206, 167)";
        this.colors = [
            [36, 206, 167, 1],
            [226, 17, 142, 1]
        ];
        this.shiftColor = Math.random();
    }

    draw() {
        Canvas.context.beginPath();
        Canvas.context.strokeStyle = this.color;
        Canvas.context.lineWidth = 3;
        Canvas.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        Canvas.context.stroke();
    }
    
    move(x, y) {
        this.x = x;
        this.y = y;
    }

    moveByDirection() {
        const newX = this.x - this.speed * Math.sin(this.direction);
        const newY = this.y - this.speed * Math.cos(this.direction);
        const {x, y} = this.checkGameArea(newX, newY);
        this.move(x, y);
    }

    checkGameArea(x, y){
        if (x > window.innerWidth + this.radius) x = -this.radius;
        if (x < -this.radius) x = window.innerWidth + this.radius;
        if (y > window.innerHeight + this.radius) y = -this.radius;
        if (y < -this.radius) y = window.innerHeight + this.radius;
        return {x, y}
    }

    updateColor() {
        const color1 = this.colors[0];
        const color2 = this.colors[1];
        const time = Global.game.time;
        this.state = Math.cos(time + this.shiftColor);
        let color = () => {
            let c = i => Math.cos(time + this.shiftColor) * (color1[i] - color2[i]) / 2 + (color1[i] + color2[i]) / 2;
            return [c(0), c(1), c(2), c(3)];
        }
        this.colorArr = color();
        this.color = `rgba(${this.colorArr.join(',')})`;
    }

    update() {
        this.moveByDirection();
        this.updateColor();
    }
}
export default GameObject;