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


    // вызывается, когда собраны точки касания
    move(ax: number, ay: number) {
        let ball = this;
        if (ball.color === "blue")
            return;

        // суммируем ускорения от реакций точек касания
        for (let dot of ball.dots) {
            let bolDotDistance = G.distance(ball, dot);
            // differential of radius
            let dr = ball.radius - bolDotDistance;
            // единичный вектор от точки  касания к центру шара
            let u = G.unit(dot, ball, bolDotDistance);

            // coeff. conservation energy for link or for ball/line 
            let w = dot.fromLink ? glo.Wl : glo.W; 

            // потери зависят от фазы - сжатие или расжатие шара (scalar < 0 - сжатие)
            let scalar = G.scalar(new Point(ball.vx, ball.vy), u);
            w = scalar > 0 ? w : 1;
 

            ax += glo.K * w * dr * u.x / ball.m;
            ay += glo.K * w * dr * u.y / ball.m;
        }

        // изменение скорости
        ball.vx += ax;
        ball.vy += ay;
        // изменение координат
        ball.x += ball.vx;
        ball.y += ball.vy;
    }

}
