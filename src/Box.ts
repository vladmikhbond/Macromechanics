import { glo } from "./globals.js"; 
import { Geometry as G, Point} from "./Geometry.js"; 
import { Ball } from "./Ball.js"
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
    }

    setScriptFunc(body: string) {
        if (!body) body = "";
        this.scriptFunc = new Function("t", body);
    }

    // 0-stop, 1-play
    set mode(v: Mode) {
        if (v) {
            this.intervalId = setInterval(() => {this.step()}, glo.INTERVAL);
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

//#region Mechanics

    // деформация  шара тем больше, чем больше масса противоположного шара
    // деформации задают не силы (силы должны быть равны), а ускорения шаров
    //
    private static touchBallDot(b1: Ball, b2: Ball): Point | null
    {
        let d = G.distance(b1, b2);
        // шары далеко
        if (d > b1.radius + b2.radius)
            return null;
        // ширина области деформации (области пересечения окружностей)
        let delta = b1.radius + b2.radius - d;
        // доля деформации для шара b2
        let delta2 = delta * b1.m / (b1.m + b2.m);

        // отношение расстояние от b1 до точки касания к расстоянию между шарами
        let k = (d - b2.radius + delta2) / d;

        // координаты точки касания
        let x = b1.x + (b2.x - b1.x) * k;
        let y = b1.y + (b2.y - b1.y) * k;
        return new Point (x, y);
    }


    
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

        // fire events
        glo.canvas.dispatchEvent(new Event("changed"));

        // invoke scriptFunc 2 times per sec
        if (glo.chronos % (500/glo.INTERVAL | 0) === 0 && this.scriptFunc)
            this.scriptFunc(glo.chronos / 500 * glo.INTERVAL | 0);
    }

    // собирает на шары точки касания с отрезками (в т.ч. с границами)
    dotsFromLines() {
        let balls = this.balls;
        let lines = this.lines;
        for (let b of balls) {
            for (let l of lines.concat(this.border)) {
                if (G.distToInfiniteLine(b, l) < b.radius) {
                    let p = G.cross(b, l);
                    if (p) {
                        // p - точка пересечения перпендикуляра в пределах отрезка
                        b.dots.push(p);
                    } else {
                        // точка пересечения за пределами отрезка
                        if (G.distance(b, l.p1) < b.radius) {
                            // касание 1-го конца отрезка
                            b.dots.push(l.p1);
                        }
                        if (G.distance(b, l.p2) < b.radius) {
                            // касание 2-го конца отрезка
                            b.dots.push(l.p2);
                        }
                    }
                }
            }
        }
    }

    // собирает на шары точки касания с шарами
    dotsFromBalls()
    {
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

    // собирает на шары виртуальные точки касания, обусловленные своей связью
    // точки связей имеют свойство w != undefined
    dotsFromLinks()
    {
        let links = this.links;
        for (let link of links) {
            let b1 = link.b1, b2 = link.b2, deX, deY;
            // придвинуть второй шар к первому
            let len = G.distance(b1, b2);
            let alpha = Math.atan2(b2.y - b1.y, b2.x - b1.x);

            let r = b1.radius + b2.radius;
            if (len < link.len0) {
                // compression
                deX = (link.len0 - r) * Math.cos(alpha);
                deY = (link.len0 - r) * Math.sin(alpha);
            } else if (len > link.len0) {
                // extension
                deX = (link.len0 + r) * Math.cos(alpha);
                deY = (link.len0 + r) * Math.sin(alpha);
            } else {
                continue;
            }
            b2.x -= deX;
            b2.y -= deY;
            // найти точку касания
            let dot: Point = Box.touchBallDot(b1, b2)!;
            // вернуть на место второй шар
            b2.x += deX;
            b2.y += deY;
            if (dot) {
                dot.w = 1;
                // поместить точку касания на 1 шар
                b1.dots.push(dot);
                // отодвинуть точку касания и поместить на 2 шар
                let dot2 = {x: dot.x + deX, y: dot.y + deY, w: 1};
                b2.dots.push(dot2);
            }
        }
    }

    // собирает на шары точки касания от ударов о связи
    dotsAboutLinks()
    {
        for (let b of this.balls) {
            for (let l of this.links) {
                if (b === l.b1 || b === l.b2 || l.transparent)
                    continue;
                let line = new Line(l.x1, l.y1, l.x2, l.y2);
                let d = G.distToInfiniteLine(b, line);
                if (d > b.radius)
                    continue;
                let p = G.cross(b, line);  // на самом деле отрезок короче
                // точка пересечения за пределами связи
                if (!p)
                    continue;

                // общий размер области деформации
                let delta = b.radius - d;
                // доля деформации для шара и для гантели (dumbbell)
                let M = l.b1.m + l.b2.m;
                let deltaB = delta * M / (b.m + M);
                let deltaD = delta - deltaB;
                let len1 = G.distance(l.b1, p), len2 = l.len0 - len1;
                // распределение деформации гантели по шарам
                let delta1 = deltaD * len2 / l.len0;
                let delta2 = deltaD * len1 / l.len0;
                // точка касания для шара
                let k = d / (b.radius - deltaB);
                let x = (p.x - b.x) / k + b.x;
                let y = (p.y - b.y) / k + b.y;
                b.dots.push({x, y});

                // точки касания для шаров гантели
                // u - единичный векор перпедикуляра к связи
                let u = G.unit(p, b, d);
                // b1
                let r1 = l.b1.radius - delta1;
                let dot = {x: l.b1.x + r1 * u.x, y: l.b1.y + r1 * u.y};
                l.b1.dots.push(dot);
                // b2
                let r2 = l.b2.radius - delta2;
                dot = {x: l.b2.x + r2 * u.x, y: l.b2.y + r2 * u.y};
                l.b2.dots.push(dot);
            }
        }
    }

//#endregion
}
