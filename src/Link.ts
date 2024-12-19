import { Ball } from "./Ball.js";
import { Geometry as G, Point} from "./Geometry.js"; 
import {Box} from "./Box.js";  

export class Link 
{
    b1: Ball;
    b2: Ball;
    len0: number;
    transparent: boolean;
        

    constructor(b1: Ball, b2: Ball, transparent=false) {
        this.b1 = b1;
        this.b2 = b2;
        this.len0 = G.distance(b1, b2);
        this.transparent = transparent;
    }

    get x1() {return this.b1.x}
    get y1() {return this.b1.y}
    get x2() {return this.b2.x}
    get y2() {return this.b2.y}
    get len() {return G.distance(this.b1, this.b2) }

    toString() {
        let l = this;
        return JSON.stringify({
            x1: +(l.x1.toFixed(2)), y1: +(l.y1.toFixed(2)),
            x2: +(l.x2.toFixed(2)), y2: +(l.y2.toFixed(2)),
            transparent: l.transparent });
    }

    fromString(s: string) {
        let box = this.b1.box!;
        let o = JSON.parse(s);
        let b1 = box.ballUnderPoint({x: o.x1, y: o.y1});
        let b2 = box.ballUnderPoint({x: o.x2, y: o.y2});
        return new Link(b1!, b2!, o.transparent);
    }
}

