import { glo } from "./globals.js"; 
import { Geometry as G, Point } from "./Geometry.js"; 
import {Box} from "./Box.js";  

export class Ball 
{
    x:number; y:number; radius:number; color:string; vx:number; vy:number; m:number;
    box: Box | null = null;
    fx = 0;
    fy = 0;
    dots: Point[] = []

    constructor(x:number, y:number, r:number, c:string, vx:number, vy:number, m=0) {
        this.x = x;
        this.y = y;
        this.radius = r;
        this.color = c;
        this.vx = vx;
        this.vy = vy;
        // если масса не задана, она равна квадрату радиуса
        this.m = m ? m : r * r;
    }

    get Energy() {
        let b = this;
        let kinetic = b.m * (b.vx * b.vx + b.vy * b.vy) / 2;
        let potential = b.m * glo.g * (b.y - b.box!.height + b.radius);
        return kinetic + potential;
    }


    // вызывается, когда собраны точки касания
    move() {
        let b = this;

        // вычисляем равнодействующую силу
        b.fx = 0;
        b.fy = b.m * glo.g;  // тяготение

        // сила реакции точек касания
        for (let p of b.dots) {
            let d = G.distance(b, p);
            let r = b.radius - d;
            let u = {x: (b.x - p.x) / d, y: (b.y - p.y) / d }; // ед.вектор
            // модуль упругости зависит от фазы - сжатие или расжатие шара
            let k = G.scalar({x: b.vx, y: b.vy}, u) > 0 ? glo.K * glo.W: glo.K;
            let fx = k * r * u.x;
            let fy = k * r * u.y;
            b.fx += fx;
            b.fy += fy;
        }

        // изменение скорости
        b.vx += b.fx / b.m;
        b.vy += b.fy / b.m;

        // изменение координат
        b.x += b.vx;
        b.y += b.vy;
    }

    dotWith(b2: Ball) {
        let b1 = this;
        let d = G.distance(b1, b2);
        // шары далеко
        if (d > b1.radius + b2.radius )
            return;
        // отношение расстояние от b1 до точки касания к расстоянию между шарами
        let k = (d + b1.radius - b2.radius) / (2 * d);
        // координаты точки касания
        let x = b1.x + (b2.x - b1.x) * k;
        let y = b1.y + (b2.y - b1.y) * k;
        return {x, y};
    }
    
    toString(): string {
        let b = this;
        return JSON.stringify({ x: +(b.x.toFixed(2)), y: +(b.y.toFixed(2)),
            vx: +(b.vx.toFixed(2)), vy: +(b.vy.toFixed(2)),
            radius: +(b.radius.toFixed(2)), color:b.color, m: +(b.m.toFixed(2))}, null, ' ');
    }

    static fromString(s: string): Ball {
        let o = JSON.parse(s);
        return new Ball(o.x, o.y, o.radius, o.color, o.vx, o.vy, o.m);
    }
}

