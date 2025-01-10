import { glo } from "./globals.js"; 
import { Geometry as G, Point} from "./Geometry.js"; 
import {Box} from "./Box.js";  

export class Dot extends Point {
    fromLink: boolean; // 

    constructor (x: number, y: number, fromLink = false) {
        super(x, y);
        this.fromLink = fromLink;
    }     
}

// Ball - куля.
// move() - переміщення кулі. Викликається, коли зібрані усі точки дотику
export class Ball 
{
    x: number; y: number; radius: number; color: string; vx: number; vy: number; m: number;
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
        // якщо маса не задана, то вона пропорційна площа кулі
        this.m = m ? m : r * r;
    }

    get kinEnergy() {
        let b = this;
        return b.m * (b.vx * b.vx + b.vy * b.vy) / 2;
    }
    get potEnergy() {
        const b = this, h = b.box!.height - b.radius - b.y;   
        return b.m * glo.g * h;    
    }

    // m*|v| 
    get impulse() {
        let ball = this;
        return ball.m * Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    }


    // Переміщення кулі. 
    // Викликається, коли зібрані усі точки дотику
    move() {
        // сумарне прискорення
        let ax = 0, ay = glo.g;
        let ball = this;
        if (ball.color === "blue")
            return;

        // складаємо прискорення від кожної точки дотику
        for (let dot of ball.dots) {
            let ballDotDistance = G.distance(ball, dot);
            // деформація кулі
            let deform = ball.radius - ballDotDistance;
            // одиничный вектор напряму від точки дотику до центру кулі
            let u = G.unit(dot, ball, ballDotDistance);
            
            // коєфіцієнт збереження енергії при дотику від ланки або від кулі
            let w = dot.fromLink ? glo.Wl : glo.W; 

            // втрата енергії при дотику 
            let scalarProduct = G.scalar(new Point(ball.vx, ball.vy), u);
            let k = scalarProduct > 0 ? w : 1;   // у фазі зменшення деформації

            // w = scalarProduct < 0 ? 1/w : 1;   // у фазі збільшення деформації
            // w = scalarProduct > 0 ? w : 1;     // у фазі зменшення деформації
           

            // прискорення від точки дотику
            let a = glo.K * w * k * deform / ball.m; 
            ax += a * u.x;
            ay += a * u.y;
        }

        // зміна швидкості
        ball.vx += ax;
        ball.vy += ay;
        // зміна координат
        ball.x += ball.vx;
        ball.y += ball.vy;
    }

}
