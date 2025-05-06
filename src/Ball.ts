import { glo } from "./globals.js"; 
import { Geometry as G, Point} from "./Geometry.js"; 
import {Box} from "./Box.js";  
import { Link } from "./Link.js";
import { Line } from "./Line.js";

export class Dot extends Point {

    from: Ball | Line | Link; // від якого об'єкта створена точка 

    constructor (x: number, y: number, from: Ball | Line | Link) {
        super(x, y);
        this.from = from;
    }     
}

// Ball - куля.
// move() - переміщення кулі. Викликається, коли зібрані усі точки дотику
export class Ball 
{
    x: number; y: number; radius: number; color: string; vx: number; vy: number; m: number;
    box: Box | null = null;
    ax = 0; 
    ay = 0;
    
    dots: Dot[] = [];
    dotShadows: Dot[] = [];
    
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
    get defEnergy() {
        const b = this;
        let e = 0;
        b.dots.forEach(dot => {
            let c = new Point(b.x - b.vx/2, b.y - b.vy/2);  
            let ballDotDistance = G.distance(c, dot);
            // деформація кулі
            let deform = b.radius - ballDotDistance;            
            e += glo.K * (deform)**2 / 2;
        });
        return e;   
    }
                        
    addDot(x: number, y: number, from: Ball | Line | Link ) {
        //  
        if (!this.dotShadows.find(d => d.from === from)) {
            if (from instanceof Ball)
                glo.strikeCounter += 0.5;
            if (from instanceof Line)
                glo.strikeCounter += 1;
        }
            
        //
        let dot = new Dot(x, y, from);
        this.dots.push(dot);
    }

    clearDots() {
        this.dotShadows = this.dots;
        this.dots = [];
    }


    // Переміщення кулі. 
    // Викликається, коли зібрані усі точки дотику
    move() {
        // сумарна сила
        let fx = 0, fy = 0;
        let ball = this;
        if (ball.color === "blue")
            return;
        // складаємо прискорення від кожної точки дотику
        for (let dot of ball.dots) {
            let ballDotDistance = G.distance(ball, dot);
            // деформація кулі
            let deform = ball.radius - ballDotDistance;
            // одиничний вектор напряму від точки дотику до центру кулі
            let u = G.unit(dot, ball, ballDotDistance);
            // коєфіцієнт збереження енергії при дотику від лінку або від (кулі | лінії)
            let w = dot.from instanceof Link ? glo.Wk : glo.W;
            // втрата енергії при дотику 
            let scalarProduct = G.scalar(new Point(ball.vx, ball.vy), u);
            let k = scalarProduct > 0 ? w : 1; // у фазі зменшення деформації
            // let k = scalarProduct < 0 ? 1/w : 1;   // у фазі збільшення деформації         
            // прискорення від точки дотику
            let f = glo.K * w * k * deform;
            fx += f * u.x;
            fy += f * u.y;
        }
        // сила спротиву повітря
        if (glo.Wf > 0) {
            let k = ball.radius * glo.Wf;
            fx -= ball.vx * k;
            fy -= ball.vy * k;
        }
        // миттєве прискорення
        let ax = fx / ball.m;
        let ay = fy / ball.m + glo.g;
         
        // зміна швидкості
        ball.vx += ax;
        ball.vy += ay;

        // зміна координат
        ball.x += ball.vx;
        ball.y += ball.vy;
    }

}
