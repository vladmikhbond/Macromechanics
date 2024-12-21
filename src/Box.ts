import { Geometry as G, Point} from "./Geometry.js"; 
import { Ball } from "./Ball.js"
import { Line } from "./Line.js";
import { glo } from "./globals.js"; 
import { Link } from "./Link.js";
import { Mechanics } from "./Mechanics.js";

export enum Mode {Stop, Play};
export enum CreateMode {Ball, Line, Link};

export class Box {
    x: number;
    y: number;
    height: number;
    width: number;
    balls: Ball[] = [];
    lines: Line[] = [];
    border: Line[];
    links: Link[] = [];
    mech: Mechanics;
    intervalId = 0;
    scriptFunc: Function = function t() {};

    selected: Ball | Line | Link | null = null;

    createMode = CreateMode.Ball; 

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
        this.mech = new Mechanics(this);
    }

    setScriptFunc(body: string) {
        if (!body) body = "";
        this.scriptFunc = new Function("t", body);
    }

    // 0-stop, 1-play
    set mode(v: Mode) {
        if (v) {
            this.intervalId = setInterval(this.mech.step, glo.INTERVAL);
        } else {
            clearInterval(this.intervalId);
            glo.intervalId = null;
        }
    }
    get mode(): Mode {
        return this.intervalId ? Mode.Play : Mode.Stop;
    }

    get sumEnergy() {
        let e = 0;
        this.balls.forEach( b => e += b.Energy);
        return e | 0;
    }

    get sumMomentum() {
        let e = 0;
        this.balls.forEach( b => e += b.momentum);
        return e | 0;
    }


//#region  Ball Suit

    addBall(b: Ball) {
        b.box = this;
        this.balls.push(b);
    }

    deleteBall(b: Ball) {
        let idx = this.balls.indexOf(b);
        if (idx === -1)
            return;
        this.balls.splice(idx, 1);
        if (this.selected === b)
            this.selected = null;
        // delete boll's links
        for (let i = this.links.length - 1; i >= 0; i--) {
            if (this.links[i].b1 === b || this.links[i].b2 === b)
                this.links.splice(i, 1);
        }

    }

    clearLostBalls() {
        for (let i = this.balls.length; i >= 0; i--) {
            let b = this.balls[i];
            if (b.x < -b.radius || b.x > this.width + b.radius ||
                b.y < -b.radius || b.y > this.height + b.radius)
                this.balls.splice(i, 1);
        }
        for (let i = this.links.length; i >= 0; i--) {
            let link = this.links[i];
            if (this.balls.indexOf(link.b1) === -1 || this.balls.indexOf(link.b2) === -1)
                this.links.splice(i, 1);
        }
    }


    // find a ball under a point
    ballUnderPoint(p: Point) {
        for (let b of this.balls) {
            if (G.distance(p, b) < b.radius) {
                return b;
            }
        }
        return null;
    }

    // find a ball which velocity is under a point
    ballVeloUnderPoint(p: Point) {
        for (let b of this.balls) {
            let q = {x: b.x + b.vx * glo.Kvelo, y: b.y + b.vy * glo.Kvelo};
            if (G.distance(p, q ) < 3) {
                return b;
            }
        }
        return null;
    }
    

//#endregion

//#region Line Suit

    addLine(l: Line) {
        this.lines.push(l);
    }

    deleteLine(line: Line) {
        let idx = this.lines.indexOf(line);
        if (idx === -1)
            return;
        this.lines.splice(idx, 1);
        if (this.selected === line)
            this.selected = null;
    }


//#endregion

//#region Link Suit
    addLink(link: Link) {
        this.links.push(link);
    }

    deleteLink(link: Link) {
        let idx = this.links.indexOf(link);
        if (idx === -1)
            return;
        this.links.splice(idx, 1);
    }


//#endregion

}
