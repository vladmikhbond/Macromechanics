import { Geometry, Point} from "./Geometry.js"; 
import { Line } from "./Line.js"; 
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
        let potential = b.m * Geometry.g * (b.y - b.box!.height + b.radius);
        return kinetic + potential;
    }

    step() {
        let b = this;

        b.fx = 0;
        b.fy = b.m * Geometry.g;  // тяготение

        // собираем на шар точки касания с линиями
        b.dots = [];
        for (let l of b.box!.lines.concat(b.box!.border) ) {
            let p = Geometry.cross(b, l);
            if (Geometry.distance(p, b) < b.radius) {
                b.dots.push(p);
            }
        }

        // вычисляем силу
        for (let p of b.dots) {
            let d = Geometry.distance(b, p);
            let r = b.radius - d;
            let u = {x: (b.x - p.x) / d, y: (b.y - p.y) / d }; // ед.вектор
            // модуль упругости зависит от фазы - сжатие или расжатие шара
            let k = Geometry.scalar({x: b.vx, y: b.vy}, u) > 0 ? Geometry.K * Geometry.W: Geometry.K;
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

}

