import { glo } from "./globals.js"; 
import { Geometry as G, Point} from "./Geometry.js"; 
import { Ball, Dot } from "./Ball.js"
import { Line } from "./Line.js";
import { Link } from "./Link.js";

export enum Mode {Stop, Play};
export enum CreateMode {Ball, Line, Link};

type Element = Ball | Line | Link | null;

export class Box {
    x: number;
    y: number;
    height: number;
    width: number;
    balls: Ball[] = [];
    lines: Line[] = [];
    border: Line[];
    links: Link[] = [];

    
    selected: Element = null;

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

    get energy() {
        let eKin = 0, ePot = 0, eDef = 0;
        for(let b of this.balls) {
            eKin += b.kinEnergy;
            ePot += b.potEnergy;
            eDef += b.defEnergy;
        }
        return [eKin, ePot, eDef];
    }

    objectUnderPoint(p: Point): Element {
        return this.ballUnderPoint(p) || this.lineUnderPoint(p) || this.linkUnderPoint(p);
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


    // find a ball under point
    ballUnderPoint(p: Point) {
        for (let b of this.balls) {
            let d = G.distance(p, b);
            if (d < Math.max(5, b.radius) ) {
                return b;
            }
        }
        return null;
    }

    // find a ball which velocity is under a point
    ballVeloUnderPoint(p: Point) {
        for (let b of this.balls) {
            let q = {x: b.x + b.vx * glo.Kvelo, y: b.y + b.vy * glo.Kvelo};
            if (G.distance(p, q ) <= 3) {
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

    // find a line under point
    lineUnderPoint(p: Point) {
        for (let l of this.lines) {
            if (G.distToInfiniteLine(p, l) < 5 && G.cross(p, l)) {
                return l;
            }
        }
        return null;
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

    // find a link under point
    linkUnderPoint(point: Point) {
        for (let link of this.links) {
            let line = new Line(link.x1, link.y1, link.x2, link.y2);
            if (G.distToInfiniteLine(point, line) < 5 && G.cross(point, line)) {
                return link;
            }
        }
        return null;
    }

//#endregion

//#region Mechanics

    // step() {        
    //     this.collectDots();
    //     this.balls.forEach( b => b.move() )
    //     glo.chronos++;
    // }

    collectDots() {
        this.balls.forEach(b => b.clearDots());

        this.dotsFromLines();
        this.dotsFromBalls();
        this.dotsFromLinksStrikes();
        this.dotsFromLinksReactions();

    }


    // Збирає на кулі точки стикання з лініями (в т.ч. із межами).
    dotsFromLines() {
        for (let ball of this.balls) {
            for (let line of this.lines.concat(this.border)) {
                let r = G.lineBallIntersect(line, ball);
                if (r) {
                    let [x1, y1, x2, y2] = r;
                    ball.addDot((x1 + x2) / 2, (y1 + y2) / 2, line);
                }
            }
        }
    }

    // Збирає на кулі точки стикання з іншими кулями.
    dotsFromBalls() {
        let balls = this.balls;
        for (let i = 0; i < balls.length - 1; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                let b1 = balls[i], b2 = balls[j];
                let point = Box.getStrikeTwoBallsPoint(b1, b2);
                if (point) {
                    b1.addDot(point.x, point.y, b2);
                    b2.addDot(point.x, point.y, b1);
                }
            }
        }
    }


    private static getStrikeTwoBallsPoint(b1: Ball, b2: Ball): Point | null
    {
        let dist = G.distance(b1, b2);
        // шары далеко
        if (dist > b1.radius + b2.radius)
            return null;
        
        // ширина області деформації 
        let deform = (b1.radius + b2.radius - dist) / 2;

        // співвідношення відстані від b1 до точки дотику до відстані між кулями
        let ratio = (b1.radius - deform) / dist;

        // координати спільної точки стикання двох куль
        let x = b1.x + (b2.x - b1.x) * ratio;
        let y = b1.y + (b2.y - b1.y) * ratio;

        return new Point(x, y);
    }

    private setLinkReactionDots(link: Link, currentLen: number) 
    {    
        let b1 = link.b1, b2 = link.b2;
        let u = G.unit(b2, b1, currentLen);
        
        let shift = currentLen < link.len0 
            ? link.len0 - b1.radius - b2.radius  // link compression
            : link.len0 + b1.radius + b2.radius; // link extention

        // shift second ball forward
        b2.x += shift * u.x;
        b2.y += shift * u.y;
        // add dot for first ball
        let point = Box.getStrikeTwoBallsPoint(b1, b2)!;
        b1.addDot(point.x, point.y, link);

        // shift second ball back
        b2.x -= shift * u.x;
        b2.y -= shift * u.y;
        // add dot for second ball
        b2.addDot(point.x - shift * u.x, point.y - shift * u.y, link);
    }

    // Збирає на кулі віртуальні точки стикання, зумовлені зв'язками
    // точки зв'язків мають властивість fromLink = true
    dotsFromLinksReactions() {
        for (let link of this.links) {
            let currentLen = link.len;
            if (Math.abs(currentLen - link.len0) > 0.000001) {
                this.setLinkReactionDots(link, currentLen);
            }
        }
    }

    // Збирає на кулі точки стикання від ударів по зв'язкам
    dotsFromLinksStrikes()
    {
        for (let ball of this.balls) {
            for (let link of this.links) {
                if (ball === link.b1 || ball === link.b2 || link.transparent)
                    continue;
                let line = new Line(link.x1, link.y1, link.x2, link.y2);
                let d = G.distToInfiniteLine(ball, line);
                if (d > ball.radius)
                    continue;
                let p = G.cross(ball, line);  // на самом деле отрезок короче
                // точка пересечения за пределами связи
                if (!p)
                    continue;

                // загальний розмір деформції 
                let delta = ball.radius - d;
                
                // розподіл деформації між кулями гантелі
                let len1 = G.distance(link.b1, p), len2 = link.len0 - len1;
                let common = delta / link.len0;
                let delta1 = len2 * common;
                let delta2 = len1 * common;
                // точка касания для шара
                let k = d / (ball.radius - delta);
                let x = (p.x - ball.x) / k + ball.x;
                let y = (p.y - ball.y) / k + ball.y;
                ball.dots.push({x, y, from: link});

                // точки дотику на кулях гантелі
                // u - единичный векор перпедикуляра к связи
                let u = G.unit(p, ball, d);
                // b1
                let r1 = link.b1.radius - delta1;
                link.b1.addDot(link.b1.x + r1 * u.x, link.b1.y + r1 * u.y, ball)
                // b2
                let r2 = link.b2.radius - delta2;
                link.b2.addDot(link.b2.x + r2 * u.x, link.b2.y + r2 * u.y, ball)
            }
        }
    }

//#endregion
}


