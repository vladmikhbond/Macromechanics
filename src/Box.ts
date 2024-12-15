import {Ball} from "./Ball.js"
import { Line } from "./Line.js";
import { Geometry, Point} from "./Geometry.js";  

import {drawAll} from "./View.js";

export class Box {
    x: number;
    y: number;
    height: number;
    width: number;
    balls: Ball[] = [];
    lines: Line[] = [];
    border: Line[];

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        this.border = [
            new Line(0, 0, w, 0), // top
            new Line(w, 0, w, h), // right
            new Line(w, h, 0, h), // bottom
            new Line(0, h, 0, 0), // left
        ];
    }

    get SumEnergy() {
        let e = 0;
        this.balls.forEach( b => e += b.Energy);
        return e | 0;
    }

    addBall(b: Ball) {
        b.box = this;
        this.balls.push(b);
    }

    addLine(l: Line) {
        this.lines.push(l);
    }

    start() {
        setInterval( () => {
            drawAll(this);
            this.balls.forEach( b => b.step() );
        }, Geometry.INTERVAL);
    }


}
