import { glo } from "./globals.js"; 
import { Geometry as G, Point } from "./Geometry.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";
import { Box, Mode, CreateMode } from "./Box.js";
import { View } from "./View.js";

export class Controller 
{
    box: Box;
    view: View;
    
    private _mousePos: Point | null = null;
    private intervalId = 0;

    
    constructor(box: Box, view: View) {
        this.box = box;
        this.view = view;
   
        // set state of UI
        this._mousePos = new Point(0, 0); // relative to the box
        this.mode = Mode.Stop;
        this.createMode = CreateMode.Ball;

        glo.infoSpan.title = "Клавиши:\
    \nB - balls\
    \nL - lines\
    \nK - links\
    \nC - copy selected\
    \nF - fixed ball\
    \nS - step\
    \nT - calibrate\
    \nDel - delete selected\
    ";
        //
        this.addListeners();

    }

    set mode(mode: Mode) {
        if (mode === Mode.Play && this.intervalId === 0) {
            // this.intervalId = setInterval(() => {this.box.step()}, glo.INTERVAL);
            this.intervalId = setInterval(this.box.step.bind(this.box), glo.INTERVAL);
        } else {
            clearInterval(this.intervalId);
            this.intervalId = 0;
        }
        // UI
        const classAttrNames = ["glyphicon glyphicon-play", "glyphicon glyphicon-pause"];
        glo.modeGlif.className = classAttrNames[mode];
        this.view.drawAll();
    }

    get mode(): Mode {
        return this.intervalId ? Mode.Play : Mode.Stop;
    }


    set createMode(v: CreateMode) {
        glo.infoSpan.innerHTML = 
              v === CreateMode.Ball ? "Ball"
            : v === CreateMode.Line ? "Line"
            : v === CreateMode.Link ? "Link" : "";

        // mouse handlers
        if (v === CreateMode.Ball) {
            this.setBallHandlers();
        } else if (v === CreateMode.Line) {
            this.setLineHandlers();
        }  else if (v === CreateMode.Link) {
            this.setLinkHandlers();
        }
    }

    set mousePos(v: Point) {
        this._mousePos = v;
        glo.mousePosSpan.innerHTML = `x=${v.x} y=${v.y}`;
    }
    get mousePos(): Point | null {
        return this._mousePos;
    }

    set g(v: string) {
        glo.g = +v;
        glo.graviValue.innerHTML = "G = " + (glo.g / 0.002).toFixed(2);
        glo.graviRange.value = v;
    }
    set W(v: string) {
        glo.W = +v;
        glo.waistValue.innerHTML = "W = " + v;
        glo.waistRange.value = v;
    }
    set K(v: string) {
        glo.K = +v;
        glo.rigidValue.innerHTML = "K = " + v;
        glo.rigidRange.value = v;
    }

    addListeners() 
    {
        glo.canvas.addEventListener("changed", () => {
            this.view.drawAll();
        });
    
        //------------------- button_click --------------------------------------

        // play-stop toggle
        glo.modeButton.addEventListener("click", () => {
            this.mode = this.mode == Mode.Stop ? Mode.Play : Mode.Stop
        });
   
    
        // restart button
        glo.restartButton.addEventListener("click", () => {
            // if (this.curentScene) {
            //     this.curentScene.restore();   
            // }
            this.mode = Mode.Stop;
        });

        // ugly-pretty toggle
        glo.prettyButton.addEventListener("click", () =>
        {
            glo.PRETTY = (glo.PRETTY + 1)  % 2;
            this.view.drawAll();
        });

        // clear screen
        glo.eraseButton.addEventListener("click", () =>
        {
            this.box.balls = [];
            this.box.lines = [];
            this.box.links = [];
            this.mode = Mode.Stop;
            this.createMode = CreateMode.Ball;
            glo.chronos = 0;
            this.view.drawAll();
        });

        //------------------- input_change --------------------------------------

            // update selected ball
        glo.ballDefinition.addEventListener("change", () => {
            if (this.box.selected &&  this.box.selected instanceof Ball) {
                let o = JSON.parse(glo.ballDefinition.value);
                Object.assign(this.box.selected, o);
                this.view.drawAll();
            }
        });
        
        glo.graviRange.addEventListener("change", () =>
        {
            glo.g = +glo.graviRange.value;
            glo.graviValue.innerHTML = "G = " + (glo.g / 0.002).toFixed(2);

        });

        glo.waistRange.addEventListener("change", () =>
        {
            glo.W = +glo.waistRange.value;
            glo.waistValue.innerHTML = "W = " + glo.waistRange.value;
        });

        glo.rigidRange.addEventListener("change", () =>
        {
            glo.K = +glo.rigidRange.value;
            glo.rigidValue.innerHTML = "K = " + glo.rigidRange.value;
        });

        //----------------------------- document_keydown ----------------------------

        document.addEventListener("keydown", (e) => {
            if (document.activeElement === glo.ballDefinition)
                return;
            switch(e.key) {
                // stop=play toggle
                case 'Enter':
                    this.mode = this.mode == Mode.Stop ? Mode.Play : Mode.Stop
                    break;

                // step execution
                case 's': case 'S': case 'ы': case 'Ы':
                    this.box.step();
                    this.mode = Mode.Stop;
                    if (this.box.selected)
                        glo.ballDefinition.value = this.box.selected.toString();
                    break;

                // copy selected ball
                case 'c': case 'C': case 'с': case 'С':
                    if (this.box.selected && this.box.selected.constructor === Ball) {
                        let s = this.box.selected;
                        let p = this.mousePos!;
                        let b = new Ball(p.x, p.y, s.radius, s.color, s.vx, s.vy, s.m);
                        this.box.addBall(b);
                        this.box.selected = b;
                        this.view.drawAll();
                    }
                    break;

                // toggle ball color
                case 'f': case 'F': case 'а': case 'А':
                let sel = this.box.selected;
                if (!sel)
                    break;
                if (sel.constructor === Ball) {
                    sel.color = sel.color === "red" ? "blue" : "red";
                    this.view.drawAll();
                } else if (sel.constructor === Link) {
                    sel.transparent = ! sel.transparent;
                    this.view.drawAll();
                }
                break;

                // calibrate
                case 't': case 'T': case 'е': case 'Е':
                //this.box.calibrate(this.view.drawAll());
                break;

                // balls
                case 'b': case 'B': case 'и': case 'И':
                this.createMode = CreateMode.Ball;
                break;

                // lines
                case 'l': case 'L': case 'д': case 'Д':
                this.createMode = CreateMode.Line;
                break;

                // links
                case 'k': case 'K': case 'л': case 'Л':
                this.createMode = CreateMode.Link;
                break;

                // delete selected object
                case 'Delete':
                    if (!this.box.selected)
                        break;
                    if (this.box.selected.constructor === Ball)
                        this.box.deleteBall(this.box.selected);
                    else if (this.box.selected.constructor === Line)
                        this.box.deleteLine(this.box.selected);
                    else if (this.box.selected.constructor === Link)
                        this.box.deleteLink(this.box.selected);
                    this.box.selected = null;
                    this.view.drawAll();
                    break;
            }
        });

    }

    setBallHandlers() {
        let p0: Point | null = null;   // в p0 смещение курсора от центра шара
        let ball: Ball | null = null;
        let ballVelo: Ball | null = null;
        let isMousePressed = false;
        //let mode = "velo";  // "velo", "ball", "new"
    
        glo.canvas.onmousedown = (e) => {
            isMousePressed = true;
            p0 = {x: e.pageX - glo.canvas.offsetLeft - this.box.x, 
                  y: e.pageY - glo.canvas.offsetTop - this.box.y };
            ballVelo = this.box.ballVeloUnderPoint(p0);
            if (ballVelo) {
                // mode = "velo";
                return;
            }
            ball = this.box.ballUnderPoint(p0);
            if (ball) {
                // в p0 смещение курсора от центра шара
                p0 = {x: ball.x - p0.x, y: ball.y - p0.y};
                this.box.selected = ball;
                this.view.drawAll();
            }
            
        };
    
        glo.canvas.onmousemove = (e) => {
            if (!isMousePressed) return;

            let p = {x: e.pageX - glo.canvas.offsetLeft - this.box.x, y: e.pageY - glo.canvas.offsetTop - this.box.y };
            this.mousePos = p;
            // change mouse cursor on velo
            glo.canvas.style.cursor = this.box.ballVeloUnderPoint(p) ? "pointer" : "auto";

            if (ballVelo) {
                ballVelo.vx = (p.x - ballVelo.x) / glo.Kvelo;
                ballVelo.vy = (p.y - ballVelo.y) / glo.Kvelo;
                this.view.drawAll();
                return;
            }
            if (ball) {
                ball.x = p.x + p0!.x;
                ball.y = p.y + p0!.y;
                this.view.drawAll();
                return;
            }
            this.view.drawAll();
            this.view.drawGrayCircle(p0!, p);
        };
    
        glo.canvas.onmouseup = (e) => {

            if (!ball && !ballVelo) {
                // create a new ball
                let p = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                         y: e.pageY - glo.canvas.offsetTop - this.box.y };

                let r = G.distance(p0!, p);
                if (r > 2) {
                    let newBall = new Ball(p0!.x, p0!.y, r, "red", 0, 0);
                    this.box.addBall(newBall);
                    this.box.selected = newBall;
                    glo.ballDefinition.value = newBall.toString();
                }
            }            
            this.view.drawAll();
            isMousePressed = false;
        }
    }
    
    setLineHandlers() {
        let p0: Point | null = null;
    
        glo.canvas.onmousedown = (e) => {
            p0 = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                  y: e.pageY - glo.canvas.offsetTop - this.box.y };
            let line = this.box.lineUnderPoint(p0);
            if (line){
                this.box.selected = line;
                this.view.drawAll();
            }
        };
    
        glo.canvas.onmousemove = (e) => {
            let p = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                     y: e.pageY - glo.canvas.offsetTop - this.box.y };
            if (p0) {
                this.view.drawAll();
                this.view.drawGrayLine(p0, p);
            }
            this.mousePos = p;
        };
    
        glo.canvas.onmouseup = (e) => {
            if (p0 === null)
                return;
            let p = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                y: e.pageY - glo.canvas.offsetTop - this.box.y };
            if (G.distance(p0, p) > 2) {
    
                let l = new Line(p0.x, p0.y, p.x, p.y);
                this.box.addLine(l);
                this.box.selected = l;
            }
            p0 = null;
            this.view.drawAll();
        };
    }
    
    
    setLinkHandlers() {
        let lastClickedBall: Ball | null = null;
    
        glo.canvas.onmousedown = (e) => {
            
            let p = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                     y: e.pageY - glo.canvas.offsetTop - this.box.y };

            let ball = this.box.ballUnderPoint(p);

            if (ball === null || ball === lastClickedBall) {
                return;
            }
            if (lastClickedBall === null) {
                lastClickedBall = ball;
                return;
            }
            
            let link = new Link(lastClickedBall, ball);
            this.box.addLink(link);
            this.box.selected = link;
            lastClickedBall = null;
            this.view.drawAll();
        };
    
        glo.canvas.onmousemove = (e) => {
            this.mousePos = {x: e.pageX - glo.canvas.offsetLeft - this.box.x,
                y: e.pageY - glo.canvas.offsetTop - this.box.y };
        };
    
        glo.canvas.onmouseup = (e) => {
        }
    }
    
    

}






