import { glo } from "./globals.js"; 
import { Geometry as G, Point } from "./Geometry.js"; 
import {Box} from "./Box.js";  
import { Ball } from "./Ball.js"
import { Line } from "./Line.js";

export class Mechanics
{
    box: Box;

    constructor(box: Box) {
        this.box = box;
    }

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


    // static because call from setInterval()
    step() {
        let box = this.box;
        for (let i = 0; i < glo.REPEATER; i++) {
            box.balls.forEach(b => b.dots = []);

            box.mech.dotsFromLines();
            box.mech.dotsFromBalls();
            box.mech.dotsAboutLinks();
            box.mech.dotsFromLinks();

            box.balls.forEach( b => b.move(0, glo.g) )
        }
        glo.chronos++;

        // fire events
        glo.canvas.dispatchEvent(new Event("changed"));

        // invoke scriptFunc 2 times per sec
        if (glo.chronos % (500/glo.INTERVAL | 0) === 0 && box.scriptFunc)
            box.scriptFunc(glo.chronos / 500 * glo.INTERVAL | 0);
    }

    // собирает на шары точки касания с отрезками (в т.ч. с границами)
    dotsFromLines() {
        let balls = this.box.balls;
        let lines = this.box.lines;
        for (let b of balls) {
            for (let l of lines.concat(this.box.border)) {
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
        let balls = this.box.balls;
        for (let i = 0; i < balls.length - 1; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                let b1 = balls[i], b2 = balls[j];
                let dot = Mechanics.touchBallDot(b1, b2);
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
        let links = this.box.links;
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
            let dot: Point = Mechanics.touchBallDot(b1, b2)!;
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
        for (let b of this.box.balls) {
            for (let l of this.box.links) {
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
}

