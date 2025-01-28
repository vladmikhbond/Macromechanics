import { Line } from "./Line.js";
import {Ball} from "./Ball.js";

export class Point {
    x: number;
    y: number;
 
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;        
    }    
}

export class Geometry {
    // Distance between two points
    //
    static distance (a: Point, b: Point) {
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    // Скалярное произведение векторов
    //
    static scalar(a: Point, b: Point)
    {
        return a.x * b.x + a.y * b.y;
    }

    // Угол вектора (a, b) по отношению к оси Ox.
    //
    static angle(a: Point, b: Point)
    {
        let dx = b.x - a.x;
        let dy = b.y - a.y; // ось Oy вниз
        return Math.atan2(dy, dx);
    }

    // поворот вектора (x, y) на угол alpha
    //
    static turn(a: Point, alpha: number) {
        let x1 = a.x * Math.cos(alpha) + a.y * Math.sin(alpha)
        let y1 =-a.x * Math.sin(alpha) + a.y * Math.cos(alpha)
        return new Point(x1, y1);
    }

    // расстояние от точки до бесконечной прямой
    //
    static distToInfiniteLine(p: Point, line: Line) {
        let a = line.A, b = line.B, c = line.C;
        return Math.abs(a * p.x + b * p.y + c) /  Math.sqrt(a * a + b * b);
    }

    // Точка пересечения прямой line и перпендикуляра к ней, опущенного из точки p.
    //
    static cross(p: Point, line: Line) {

        let k = line.k;
        let b = line.b;
        // точка пересечения перепендикуляра и прямой
        let dot;

        if (line.x1 === line.x2) {
            // прямая вертикальна
            dot = {x: line.x1, y: p.y};
        } else if (line.y1 === line.y2) {
            // прямая горизонтальна
            dot = {x: p.x, y: line.y1};
        } else {
            // уравнение перпендикуляра, проходящего через точку p={x, y): y = k1 * x + b1
            let k1 = -1 / k;
            let b1 = p.y - k1 * p.x;
            // уравнение прямой: y = k2 * x + b2
            let k2 = k;
            let b2 = b;
            dot = { x: (b1 - b2) / (k2 - k1), y: (k2 * b1 - k1 * b2) / (k2 - k1) };
        }

        // точка пересечения лежит в пределах отрезка
        let p1 = line.p1, p2 = line.p2;
        if ((p1.x <= dot.x && dot.x <= p2.x || p2.x <= dot.x && dot.x <= p1.x) &&
            (p1.y <= dot.y && dot.y <= p2.y || p2.y <= dot.y && dot.y <= p1.y) )
            return dot;
        // точка пересечения за пределами отрезка
        return null;

    }

    // Единичный вектор из p1 в p2
    //
    static unit(p1: Point, p2: Point, dist: number)
    {
        let dx = p2.x - p1.x, dy = p2.y - p1.y;
        if (!dist) {
            dist = Math.sqrt(dx * dx + dy * dy);
        }    
        return { x: dx / dist, y: dy / dist };
    }

    // Перетин кола і відрізка прямої
    // Повертає масив [x1, y1, x2, y2] - координати точок перетину або null, якщо перетину немає
    // Якщо границя відрізка лежить в колі, то точка перетину - це границя відрізка.
    static lineBallIntersect(line:Line, ball: Ball) {
        let lk = line.k;
        let lb = line.b;
        let x_1:number, y_1:number, x_2:number, y_2:number;

        if (line.x1 == line.x2) {
            // лінія вертикальна
            let discr = ball.radius**2 - (line.x1 - ball.x)**2;
            if (discr < 0) return null;
            x_1 = x_2 = line.x1;
            y_1 = ball.y - Math.sqrt(discr);
            y_2 = ball.y + Math.sqrt(discr);
            // врахування кінців лінії
            if (y_1 > line.y2 || y_2 < line.y1) 
                return null;
            if (line.y1 > y_1) {
                x_1 = line.x1;
                y_1 = line.y1;     
            }
            if (line.y2 < y_2) {
                x_2 = line.x2;
                y_2 = line.y2;     
            }
        } else {
            // лінія похила або горизонтальна
            let a = 1 + lk**2;
            let b = 2 * (-ball.x + lk * (lb - ball.y));
            let c = ball.x**2 + (lb - ball.y)**2 - ball.radius**2;
            let discr = b**2 - 4*a*c;
            if (discr < 0) return null;
            x_1 = (-b - Math.sqrt(discr))/(2*a);
            x_2 = (-b + Math.sqrt(discr))/(2*a);
            y_1 = lk * x_1 + lb;
            y_2 = lk * x_2 + lb;
            // врахування кінців лінії
            if (x_1 > line.x2 || x_2 < line.x1) 
                return null;
            if (line.x1 > x_1) {
                x_1 = line.x1;
                y_1 = line.y1;     
            }
            if (line.x2 < x_2) {
                x_2 = line.x2;
                y_2 = line.y2;     
            }
        }
        return [x_1, y_1, x_2, y_2];
    }



}
