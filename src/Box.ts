import { glo } from "./globals.js"; 
import { Geometry as G, Point} from "./Geometry.js"; 
import { Ball, Dot } from "./Ball.js"
import { Line } from "./Line.js";
import { Link } from "./Link.js";

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

    selected: Ball | Line | Link | null = null;

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

    get sumEnergy() {
        let ek = 0, ep  =0;
        this.balls.forEach( b => { ek += b.kinEnergy; ep += b.potEnergy; });
        return [ek, ep]
    }

    get sumImpulse() {
        let e = 0;
        this.balls.forEach( b => e += b.impulse);
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

    step() {
        
        for (let i = 0; i < glo.REPEATER; i++) {
            this.balls.forEach(b => b.dots = []);

            this.dotsFromLines();
            this.dotsFromBalls();
            this.dotsAboutLinks();
            this.dotsFromLinks();

            this.balls.forEach( b => b.move(0, glo.g) )
        }
        glo.chronos++;
    }

    // собирает на шары точки касания с отрезками (в т.ч. с границами)
    // dotsFromLines() {
    //     for (let ball of this.balls) {
    //         for (let line of this.lines.concat(this.border)) {
    //             if (G.distToInfiniteLine(ball, line) < ball.radius) {
    //                 let point = G.cross(ball, line);
    //                 if (point) {
    //                     // точка пересечения перпендикуляра лежит на отрезке
    //                     ball.dots.push(new Dot(point.x, point.y));
    //                 } else {
    //                     // точка пересечения за пределами отрезка
    //                     if (G.distance(ball, line.p1) < ball.radius) {
    //                         // касание 1-го конца отрезка
    //                         ball.dots.push(new Dot(line.p1.x, line.p1.y));
    //                     }
    //                     if (G.distance(ball, line.p2) < ball.radius) {
    //                         // касание 2-го конца отрезка
    //                         ball.dots.push(new Dot(line.p2.x, line.p2.y));
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    dotsFromLines() {
        for (let ball of this.balls) {
            for (let line of this.lines.concat(this.border)) {
                let r = G.lineBallIntersect(line, ball);
                if (r) {
                    let [x1, y1, x2, y2] = r;
                    ball.dots.push(new Dot((x1 + x2) / 2, (y1 + y2) / 2));
                }
            }
        }
    }

    // собирает на шары точки касания с шарами
    dotsFromBalls() {
        let balls = this.balls;
        for (let i = 0; i < balls.length - 1; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                let b1 = balls[i], b2 = balls[j];
                let dot = Box.touchBallDot(b1, b2);
                if (dot) {
                    b1.dots.push(dot);
                    b2.dots.push(dot);
                }
            }
        }
    }


    private static touchBallDot(b1: Ball, b2: Ball): Dot | null
    {
        let dist = G.distance(b1, b2);
        // шары далеко
        if (dist > b1.radius + b2.radius)
            return null;
        
        // ширина области деформации (области пересечения окружностей)
        let intersection = b1.radius + b2.radius - dist;

        // отношение расстояние от b1 до точки касания к расстоянию между шарами
        let k = (dist - b2.radius + intersection / 2) / dist;

        // координаты точки касания
        let x = b1.x + (b2.x - b1.x) * k;
        let y = b1.y + (b2.y - b1.y) * k;

        return new Dot(x, y);
    }

    setLinkDots(link: Link, currentLen: number) 
    {    
        let b1 = link.b1, b2 = link.b2;
        let u = G.unit(b2, b1, currentLen);
        
        let shift = currentLen < link.len0 
            ? link.len0 - b1.radius - b2.radius  // compression
            : link.len0 + b1.radius + b2.radius; // extention

        // shift second ball
        b2.x += shift * u.x;
        b2.y += shift * u.y;

        let dot1 = Box.touchBallDot(b1, b2)!;
        dot1.fromLink = true;
        b1.dots.push(dot1);

        // shift second ball back
        b2.x -= shift * u.x;
        b2.y -= shift * u.y;
        let dot2 = new Dot(dot1.x - shift * u.x, dot1.y - shift * u.y, true)
        b2.dots.push(dot2);
    }

    // Збирає на кулі віртуальні точки стикання, зумовлені зв'язками
    // точки зв'язків мають властивість fromLink = true
    dotsFromLinks() {
        for (let link of this.links) {
            let currentLen = link.len;
            if (Math.abs(currentLen - link.len0) > 0.000001) {
                this.setLinkDots(link, currentLen);
            }
        }
    }

    // Збирає на кулі точки стикання від ударів по зв'язкам
    dotsAboutLinks()
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
                
                // розподіл деформації між шарами гантелі
                let len1 = G.distance(link.b1, p), len2 = link.len0 - len1;
                let common = delta / link.len0;
                let delta1 = len2 * common;
                let delta2 = len1 * common;
                // точка касания для шара
                let k = d / (ball.radius - delta);
                let x = (p.x - ball.x) / k + ball.x;
                let y = (p.y - ball.y) / k + ball.y;
                ball.dots.push({x, y, fromLink: false});

                // точки касания для шаров гантели
                // u - единичный векор перпедикуляра к связи
                let u = G.unit(p, ball, d);
                // b1
                let r1 = link.b1.radius - delta1;
                let dot = new Dot(link.b1.x + r1 * u.x, link.b1.y + r1 * u.y);
                link.b1.dots.push(dot);
                // b2
                let r2 = link.b2.radius - delta2;
                dot = new Dot(link.b2.x + r2 * u.x, link.b2.y + r2 * u.y);
                link.b2.dots.push(dot);
            }
        }
    }

//#endregion

//#region Json

    toJson() {
        this.balls.forEach(b => b.box = null);
        let o = {
            balls: this.balls,
            lines: this.lines,
            links: this.links.map(l => [l.b1.x, l.b1.y, l.b2.x, l.b2.y]),
            g: glo.g, W: glo.W,  Wl: glo.Wl, K: glo.K, 
        };
        let json = JSON.stringify(o);
        this.balls.forEach(b => b.box = this);  
        return json;  
    }

    fromJson(json: string) {
        const o = JSON.parse(json);
        // restore balls
        this.balls = o.balls.map((b: any) => new Ball(b.x, b.y, b.radius, b.color, b.vx, b.vy, b.m));
        this.balls.forEach(b => b.box = this);
        // restore lines
        this.lines = o.lines.map((l: any) => new Line(l.x1, l.y1, l.x2, l.y2));
        // restore links
        this.links = [];
        o.links.forEach((arr: number[]) => {
            let b1 = this.ballUnderPoint({ x: arr[0], y: arr[1] });
            let b2 = this.ballUnderPoint({ x: arr[2], y: arr[3] });
            if (b1 && b2) {
                this.links.push(new Link(b1, b2));
            }
        });
        // restore globals
        glo.g = o.g;
        glo.W = o.W;
        glo.Wl = o.Wl;
        glo.K = o.K;
    }
//#endregion
}

