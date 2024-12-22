import { Line } from "./Line.js";

export class Point {
    x: number;
    y: number;
    w? : number;  // пружність зв'язку, якщо точка на зв'язаній кулі 
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;        
    }
     
     
}


export class Geometry {
    // Distance between two points
    //
    static distance (a: Point, b: Point) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
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

}
