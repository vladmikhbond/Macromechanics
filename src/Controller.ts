import { glo } from "./globals.js"; 
import { Box, Mode, CreateMode } from "./Box.js";
import { View } from "./View.js";
import { Geometry as G, Point } from "./Geometry.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";

export class Controller {
     
    box: Box;
    view: View;

    constructor(box: Box, view: View) {
        this.box = box;
        this.view = view;
        this.buttonListeners();
        this.keyBoardListeners();
        this.mouseListeners();

        this.ballHandlers()
    }


    buttonListeners() 
    {
        // mode toggle
        glo.modeButton.addEventListener("click", () => {
            const names = ["Stop", "Play"];
            glo.modeButton.innerHTML = names[this.box.mode];
            this.box.mode = (this.box.mode + 1) % names.length;
            this.view.drawAll();
        });

        // createMode toggle
        glo.createButton.addEventListener("click", () => {
            const names = ["Ball", "Line"];
            const box = this.box;
            box.createMode = (box.createMode + 1) % names.length;
            glo.createButton.innerHTML = names[box.createMode];

            // mouse handlers
            if (box.createMode === CreateMode.Ball) {
                this.ballHandlers();
            } else if (box.createMode === CreateMode.Line) {
                this.lineHandlers();
            }
        });

        // update selected ball
        glo.updateButton.addEventListener("click", () => {
            let o = JSON.parse(glo.ballDefinition.value);
            Object.assign(this.box.selectedBall!, o);
            this.view.drawAll();
        });
    }
    
    keyBoardListeners() 
    {
        document.addEventListener("keydown", (e) => {
            const box = this.box;
            switch(e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    if (box.mode === Mode.Play) {
                        box.step();
                    } else {
                        // to toggle mode
                        glo.modeButton.dispatchEvent(new Event("click"));
                    }
                    break;
                case 'Delete':
                    if (box.createMode === CreateMode.Ball) {
                        box.deleteSelectedBall();
                    } else if (box.createMode === CreateMode.Line) {
                        box.deleteSelectedLine();
                    }
                    this.view.drawAll();
                    break;
            }

        });

    }

    mouseListeners() 
    {
        const box = this.box;
        // select object
        glo.canvas.addEventListener("click", (e) => {
            let p = {x: e.pageX - glo.canvas.offsetLeft - box.x,
                y: e.pageY - glo.canvas.offsetTop - box.y };

            // select ball
            for (let b of box.balls) {
                if (G.distance(p, b ) < b.radius) {
                    box.selectedBall = b;
                    this.view.drawAll();
                    glo.ballDefinition.value = b.toString();
                    break;
                }
            }
            // select line
            for (let l of box.lines) {
                if (G.distToInfiniteLine(p, l) < 5) {
                    box.selectedLine = l;
                    this.view.drawAll();
                    break;
                }
            }
            // // select link
            // for (let link of box.links) {
            //     let l = new Line(link.x1, link.y1, link.x2, link.y2 );
            //     if (G.distToInfiniteLine(p, l) < 5) {
            //         sel = link;
            //         break;
            //     }
            // }


    });

    }

    ballHandlers() {
        let p0: Point | null = null;

        glo.canvas.onmousedown = (e) => {
            p0 = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                  y: e.pageY - glo.canvas.offsetTop - this.box.y };
        }

        glo.canvas.onmousemove = (e) => {
            if (!p0)
                return;
            let p: Point = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                            y: e.pageY - glo.canvas.offsetTop - this.box.y };
            this.view.drawAll();
            this.view.drawGrayCircle(p0, p);
        }

        glo.canvas.onmouseup = (e) => {
            if (p0 === null)
                return;
            let p: Point = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                y: e.pageY - glo.canvas.offsetTop - this.box.y };
            let r = G.distance(p0, p);
            if (r > 2) {
                let ball = new Ball(p0.x, p0.y, r, "red", 0, 0);
                this.box.addBall(ball);
                this.box.selectedBall = ball;
                glo.ballDefinition.value = ball.toString();
            }
            p0 = null;
            this.view.drawAll();
        }
    }

    lineHandlers() {
        let p0: Point | null = null;

        glo.canvas.onmousedown = (e) => {
            p0 = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                y: e.pageY - glo.canvas.offsetTop - this.box.y };
        }

        glo.canvas.onmousemove = (e) => {
            if (!p0)
                return;
            let p = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                y: e.pageY - glo.canvas.offsetTop - this.box.y };
            this.view.drawAll();
            this.view.drawGrayLine(p0, p);
        }

        glo.canvas.onmouseup = (e) => {
            if (p0 === null)
                return;
            let p = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                y: e.pageY - glo.canvas.offsetTop - this.box.y };
            if (G.distance(p0, p) > 2) {

                let l = new Line(p0.x, p0.y, p.x, p.y);
                this.box.addLine(l);
                this.box.selectedLine = l;
            }
            p0 = null;
            this.view.drawAll();
        }
    }


    start() {
        setInterval( () => {
            this.view.drawAll();
            this.box.step();
        }, glo.INTERVAL);
    }
}