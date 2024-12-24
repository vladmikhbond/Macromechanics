import { glo } from "./globals.js"; 
import { Geometry as G, Point} from "./Geometry.js"; 
import {Box} from "./Box.js";  

export class Dot extends Point {
    fromLink: boolean; // 

    constructor (p: Point, fromLink = false) {
        super(p.x, p.y);
        this.fromLink = fromLink;
    }     
}

export class Ball 
{
    x:number; y:number; radius:number; color:string; vx:number; vy:number; m:number;
    box: Box | null = null;
    fx = 0;
    fy = 0;
    dots: Dot[] = []

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


    // m*|v| 
    get impulse() {
        let ball = this;
        return ball.m * Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    }


    toString(): string {
        let b = this;
        return JSON.stringify({ 
            x: +(b.x.toFixed(2)), y: +(b.y.toFixed(2)),
            vx: +(b.vx.toFixed(2)), vy: +(b.vy.toFixed(2)),
            radius: +(b.radius.toFixed(2)), color:b.color, m: +(b.m.toFixed(2))}, null, ' ');
    }

    static fromString(s: string): Ball {
        let o = JSON.parse(s);
        return new Ball(o.x, o.y, o.radius, o.color, o.vx, o.vy, o.m);
    }

    // вызывается, когда собраны точки касания
    move(ax: number, ay: number) {
        let ball = this;
        if (ball.color === "blue")
            return;

        // суммируем ускорения от реакций точек касания
        for (let dot of ball.dots) {
            let bolDotDistance = G.distance(ball, dot);
            let dr = ball.radius - bolDotDistance;
            // единичный вектор
            let u = G.unit(dot, ball, bolDotDistance);

            // coeff. conservation energy for link or for ball/line 
            let w = dot.fromLink ? glo.Wl : glo.W; 

            // модуль упругости зависит от фазы - сжатие или расжатие шара
            let scalar = G.scalar(new Point(ball.vx, ball.vy), u);

           

            let k = scalar > 0 ? glo.K * w : glo.K;

            ax += k * dr * u.x;
            ay += k * dr * u.y;
        }

        // изменение скорости
        ball.vx += ax;
        ball.vy += ay;
        // изменение координат
        ball.x += ball.vx;
        ball.y += ball.vy;
    }

}
