import { Ball } from "./Ball.js";
import { Geometry as G} from "./Geometry.js"; 

export class Link 
{
    b1: Ball;
    b2: Ball;
    len0: number;  // довжина ненапруженого зв'язку
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

}

