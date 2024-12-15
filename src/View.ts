import {Box} from "./Box.js";

const canvas = <HTMLCanvasElement>document.getElementById("canvas");

export function drawAll(box: Box) {
    const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let k = 20;

    // draw box
    ctx.strokeStyle = "black";
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // draw balls
    for (let b of box.balls) {
        ctx.beginPath();
        ctx.strokeStyle = b.color;
        let x = box.x + b.x, y = box.y + b.y;
        ctx.arc(x, y, b.radius, 0, Math.PI * 2);
        ctx.arc(x, y, b.radius + 1, 0, Math.PI * 2);
        ctx.moveTo(x, y);
        ctx.lineTo(x + b.vx * k, y + b.vy * k );
        ctx.stroke();
    }

    // draw lines
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    for (let l of box.lines) {
        ctx.moveTo(box.x + l.x1, box.y + l.y1);
        ctx.lineTo(box.x + l.x2, box.y + l.y2);
    }
    ctx.stroke();

    // print sum energy
    ctx.fillText("E = " + box.SumEnergy, 20, 20 );

}
