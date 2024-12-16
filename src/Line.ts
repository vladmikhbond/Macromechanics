import { Geometry } from "./Geometry.js";

export class Line 
{
    x1: number;
    y1: number;
    x2: number;
    y2: number;  
    len: number;  

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.len = Geometry.distance({x: x1, y: y1}, {x: x2, y: y2});
    }

    // вспомогательные параметры линии для разных формул
    get A() { return this.y2 - this.y1; }
    get B() { return this.x1 - this.x2; }
    get C() { return this.x2 * this.y1 - this.x1 * this.y2; }
    get k() { return (this.y1 - this.y2) / (this.x1 - this.x2); }
    get b() { return this.y1 + this.x1 * (this.y2 - this.y1) / (this.x1 - this.x2); }

    get p1() { return { x: this.x1, y: this.y1 } }
    get p2() { return { x: this.x2, y: this.y2 } }


    toString() {
        let l = this;
        return JSON.stringify({
            x1: +(l.x1.toFixed(2)), y1: +(l.y1.toFixed(2)),
            x2: +(l.x2.toFixed(2)), y2: +(l.y2.toFixed(2)) });
    }

    static fromString(s: string) {
        let o = JSON.parse(s);
        return new Line(o.x1, o.y1,o.x2, o.y2);
    }


}
