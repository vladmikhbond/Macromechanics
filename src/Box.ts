import { Geometry as G, Point} from "./Geometry.js"; 
import { Ball } from "./Ball.js"
import { Line } from "./Line.js";
import { glo } from "./globals.js"; 

export enum Mode {Stop, Play};
export enum CreateMode {Ball, Line};

export class Box {
    x: number;
    y: number;
    height: number;
    width: number;
    balls: Ball[] = [];
    lines: Line[] = [];
    border: Line[];

    selectedBall: Ball | null = null;
    selectedLine: Line | null = null;

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

    intervalId = 0;

    get sumEnergy() {
        let e = 0;
        this.balls.forEach( b => e += b.Energy);
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
        if (this.selectedBall === b)
            this.selectedBall = null;
    }

    deleteSelectedBall() {
        if (this.selectedBall) {
            this.deleteBall(this.selectedBall);
            this.selectedBall = null;
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

//#endregion

//#region Line Suit

    addLine(l: Line) {
        this.lines.push(l);
    }

    deleteLine(l: Line) {
        let idx = this.lines.indexOf(l);
        if (idx === -1)
            return;
        this.lines.splice(idx, 1);
        if (this.selectedLine === l)
            this.selectedLine = null;
    }

    deleteSelectedLine() {
        if (this.selectedLine) {
            this.deleteLine(this.selectedLine);
        }
    }

//#endregion    

    // собирает на шары точки касания с отрезками (в т.ч. с границами)
    dotsFromLines() {
        for (let b of this.balls) {
            b.dots = [];
            for (let l of this.lines.concat(this.border) ) {
                if (G.distToInfiniteLine(b, l) < b.radius) {
                    let p = G.cross(b, l);
                    if (p) {
                        // точка пересечения перпендикуляра в пределах отрезка
                        b.dots.push(p);
                    } else {
                        // точка пересечения за пределами отрезка
                        if (G.distance(b, l.p1) < b.radius)
                            b.dots.push(l.p1);
                        if (G.distance(b, l.p2) < b.radius)
                            b.dots.push(l.p2);
                    }
                }
             }
        }
    }


    // собирает на шары точки касания с шарами
    dotsFromBalls() {
        for (let i = 0; i < this.balls.length - 1; i++ ) {
            for (let j = i + 1; j < this.balls.length; j++ ) {
                let b1 = this.balls[i], b2 = this.balls[j];
                let dot = touch(b1, b2);
                if (dot) {
                    b1.dots.push(dot);
                    b2.dots.push(dot);
                }
            }
        }


        // деформация  шара тем больше, чем больше масса противоположного шара
        // деформации задают не силы (они равны), а ускорения шаров
        function touch(b1: Ball, b2: Ball) {
            let d = G.distance(b1, b2);
            // шары далеко
            if (d > b1.radius + b2.radius )
                return;
            // ширина области деформации (области пересечения окружностей)
            let delta = b1.radius + b2.radius - d;
            // доля деформации для шара b1
            let delta1 = delta * b1.m / (b1.m + b2.m);

            // отношение расстояние от b1 до точки касания к расстоянию между шарами
            let k = (d - b2.radius + delta1) / d;

            // координаты точки касания
            let x = b1.x + (b2.x - b1.x) * k;
            let y = b1.y + (b2.y - b1.y) * k;
            return {x, y};
        }

    }


    step() {
        this.dotsFromLines();
        this.dotsFromBalls();
        this.balls.forEach( b => b.move());
    }


}
