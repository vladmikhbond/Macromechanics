import {glo, doc} from "./globals.js";
import {Box} from "./Box.js";
import { Geometry as G, Point } from "./Geometry.js";


export enum PrettyMode {Draft, Beauty};

export class View 
{
    box: Box;

    prettyMode = PrettyMode.Draft;

    constructor(box: Box) {
        this.box = box;
    }

    drawAll(lineWidth=0.5)
    {
        if (this.prettyMode)
            return this.drawPretty();
    
        const ctx = doc.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, doc.canvas.width, doc.canvas.height);
        ctx.lineWidth = lineWidth;
    
        // draw box
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
    
        // draw scale
        // for (let y = this.box.height, n = 0; y >= 0; y -= glo.pixInMeter, n++) {
        //     ctx.fillText(n.toString(), 0, y + this.box.y );
        // }
        //ctx.stroke();
    
        // draw balls
        for (let b of this.box.balls) {
            ctx.lineWidth = this.box.selected === b ? 3 * lineWidth : lineWidth;
            ctx.strokeStyle = b.color;
            ctx.beginPath();
            let x = this.box.x + b.x, y = this.box.y + b.y;
            if (b.dots && b.dots.length > 0) {
                let dot = b.dots[0];
                // показываем деформацию
                let alpha = Math.atan2(dot.y - b.y, dot.x - b.x);
                let kr = (G.distance(dot, b) / b.radius) ** 0.5; // зведення **0.5 наближає kr до 1 
                //kr = 1 + (kr - 1) / 10;  /////////////////////////////////////
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(alpha);
                ctx.scale(kr, 1/kr);
                ctx.rotate(-alpha);
                ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
                ctx.restore();        }
            else
            {
                ctx.arc(x, y, b.radius, 0, Math.PI * 2);
            }
            // draw velocity
            ctx.strokeRect(x + b.vx * glo.Kvelo - 0.5, y + b.vy * glo.Kvelo - 0.5, 1, 1);
            ctx.moveTo(x, y);
            ctx.lineTo(x + b.vx * glo.Kvelo, y + b.vy * glo.Kvelo );
            ctx.stroke();
        }
    
        // draw dots (for debug)
        for (let b of this.box.balls) {
            if (!b.dots) continue;
            for (let d of b.dots) {
                if (!d) continue;
                ctx.strokeStyle = 'black';
                let x = this.box.x + d.x, y = this.box.y + d.y;
                ctx.strokeRect(x-0.5, y-0.5, 1, 1);
            }
        }
    
        // draw lines
        ctx.strokeStyle = "blue";
        for (let l of this.box.lines) {
            ctx.lineWidth = this.box.selected === l ? 3 * lineWidth : lineWidth;
            ctx.beginPath();
            ctx.moveTo(this.box.x + l.x1, this.box.y + l.y1);
            ctx.lineTo(this.box.x + l.x2, this.box.y + l.y2);
            ctx.stroke();
        }
    
        // draw links
        for (let l of this.box.links) {
            ctx.lineWidth = this.box.selected === l ? 3 * lineWidth : lineWidth;
            ctx.strokeStyle = l.transparent ? "lightgray" : "gray";
            ctx.beginPath();
            ctx.moveTo(this.box.x + l.x1, this.box.y + l.y1);
            ctx.lineTo(this.box.x + l.x2, this.box.y + l.y2);
            ctx.stroke();
        }
    
        // draw text
        let seconds = (glo.chronos/ 1000 * glo.INTERVAL).toFixed(2);
        const x = 10, y = 590;
        ctx.fillText("T = " + seconds, x, y);
        ctx.fillText("E = " + this.box.sumEnergy, x + 100, y);
    }

    drawPretty() {

        const ctx = doc.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, doc.canvas.width, doc.canvas.height);

        // draw box
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);

        // draw links
        ctx.lineWidth = 3;
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        for (let link of this.box.links) {
            if (link.transparent)
                continue;
            ctx.moveTo(this.box.x + link.x1, this.box.y + link.y1);
            ctx.lineTo(this.box.x + link.x2, this.box.y + link.y2);
        }
        ctx.stroke();


        // draw balls
        for (let b of this.box.balls) {
            ctx.save();
            let img = b.color === "red" ? doc.redBallImg : b.color === "blue" ? doc.blueBallImg : doc.greenBallImg;
            let x = this.box.x + b.x, y = this.box.y + b.y;

            if (b.dots && b.dots.length > 0) {
                let dot = b.dots[0];
                // показываем деформацию
                let alpha = Math.atan2(dot.y - b.y, dot.x - b.x);
                let kr = (G.distance(dot, b) / b.radius)**0.5;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(alpha);
                ctx.scale(kr, 1 / kr);
                ctx.rotate(-alpha);

                ctx.translate(-b.radius, -b.radius);
                let k = 2 * b.radius / img.width;
                ctx.scale(k, k);
            }
            else
            {
                ctx.translate(x - b.radius, y - b.radius);
                let k = 2 * b.radius / img.height;
                ctx.scale(k, k);
            }
            ctx.drawImage(img, 0, 0);
            ctx.restore();
        }

        // draw lines
        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        for (let line of this.box.lines) {
            ctx.moveTo(this.box.x + line.x1, this.box.y + line.y1);
            ctx.lineTo(this.box.x + line.x2, this.box.y + line.y2);
        }
        ctx.stroke();

        // print info
        let sec = glo.chronos / 1000 * glo.INTERVAL | 0;
        ctx.fillText("T = " + sec, 20, 20 );
    }
    

    drawGrayLine(p0: Point, p: Point) {
        const ctx = <CanvasRenderingContext2D>doc.canvas.getContext("2d");
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(this.box.x + p0.x, this.box.y + p0.y);
        ctx.lineTo(this.box.x + p.x, this.box.y + p.y);
        ctx.stroke();
    }

    drawGrayCircle(p0: Point, p: Point) {
        const ctx = <CanvasRenderingContext2D>doc.canvas.getContext("2d");
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
