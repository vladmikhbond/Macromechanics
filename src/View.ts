import {glo} from "./globals.js";
import {Box} from "./Box.js";
import { Geometry as G, Point } from "./Geometry.js";

export class View 
{
    box: Box;

    constructor(box: Box) {
        this.box = box;
    }

    drawAll() {
        const box = this.box;
        const ctx = <CanvasRenderingContext2D>glo.canvas.getContext("2d");
        ctx.lineWidth = 0.5;

        ctx.clearRect(0, 0, glo.canvas.width, glo.canvas.height);
        let k = 20;
    
        // draw box
        ctx.strokeStyle = "black";
        ctx.strokeRect(box.x, box.y, box.width, box.height);
    
        // draw balls
        for (let ball of box.balls) {
            ctx.lineWidth = ball === box.selectedBall ? 1 : 0.5;
            ctx.beginPath();
            ctx.strokeStyle = ball.color;
            let x = box.x + ball.x, y = box.y + ball.y;
            ctx.arc(x, y, ball.radius, 0, Math.PI * 2);
            ctx.arc(x, y, ball.radius + 1, 0, Math.PI * 2);
            ctx.moveTo(x, y);
            ctx.lineTo(x + ball.vx * k, y + ball.vy * k );
            ctx.stroke();
        }
    
        // draw lines
        ctx.strokeStyle = "blue";
        for (let l of box.lines) {
            ctx.lineWidth = l === box.selectedLine ? 1.5 : 0.5;
            ctx.beginPath();
            ctx.moveTo(box.x + l.x1, box.y + l.y1);
            ctx.lineTo(box.x + l.x2, box.y + l.y2);
            ctx.stroke();
        }
        
    
        // print sum energy
        ctx.fillText("E = " + box.sumEnergy, 20, 20 );
    }

    drawGrayLine(p0: Point, p: Point) {
        const ctx = <CanvasRenderingContext2D>glo.canvas.getContext("2d");
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(this.box.x + p0.x, this.box.y + p0.y);
        ctx.lineTo(this.box.x + p.x, this.box.y + p.y);
        ctx.stroke();
    }

    drawGrayCircle(p0: Point, p: Point) {
        const ctx = <CanvasRenderingContext2D>glo.canvas.getContext("2d");
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        let x = this.box.x + p0.x, y = this.box.y + p0.y;
        let r = Math.round(G.distance(p0, p));
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        // print sum energy
        ctx.fillText("R = " + r, this.box.x + p.x, this.box.y + p.y );
    }


}
