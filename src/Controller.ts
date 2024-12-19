import { glo } from "./globals.js"; 
import { Box, Mode, CreateMode } from "./Box.js";
import { View } from "./View.js";
import { Geometry as G, Point } from "./Geometry.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";

class Controller 
{
    box: Box;
    view: View;
    selected: Ball | Line | Link | null = null;
    private _mousePos: Point | null = null;
    private _createMode = CreateMode.Ball;
    private _g: number;
    private _W: number;
    private _K: number;
    

    constructor(box: Box, view: View) {
        this.box = box;
        this.view = view;

        this._g = glo.g;
        this._W = glo.W;
        this._K = glo.K;
        this._createMode = CreateMode.Ball;
   
        this._mousePos = new Point(0, 0); // relative to the box
        // this.currentScene;  

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

        this.setListeners();
    }


    // mode property
    set mode(v: Mode) {
        this.box.mode = v;
        const classNames = ["glyphicon glyphicon-pause", "glyphicon glyphicon-play"];
        glo.modeGlif.className = classNames[v];
        this.view.drawAll();
    }
    get mode() {
        return this.box.mode;
    }

    // createMode property
    set createMode(v) {
        this.box.createMode = v;
        glo.infoSpan.innerHTML = 
              v === CreateMode.Ball ? "Ball"
            : v === CreateMode.Line ? "Line"
            : v === CreateMode.Link ? "Link" : "";

        // mouse handlers
        if (v === CreateMode.Ball) {
            setBallHandlers();
        } else if (v === CreateMode.Line) {
            setLineHandlers();
        }  else if (v === CreateMode.Link) {
            setLinkHandlers();
        }
    }
    get createMode() {
        return this._createMode;
    }

    // mousePos property
    set mousePos(v: Point) {
        this._mousePos = v;
        glo.mousePosSpan.innerHTML = `x=${v.x} y=${v.y}`;
    }
    get mousePos(): Point | null {
        return this._mousePos;
    }

    // g property
    set g(v: string) {
        this._g = +v;
        glo.graviValue.innerHTML = "G = " + (this._g / 0.002).toFixed(2) + "g";
        glo.graviRange.value = v;
    }
    set W(v: string) {
        this._W = +v;
        glo.waistValue.innerHTML = "W = " + v;
        glo.waistRange.value = v;
    }
    set K(v: string) {
        this._K = +v;
        glo.rigidValue.innerHTML = "K = " + v;
        glo.rigidRange.value = v;
    }

    setListeners() {
        glo.canvas.addEventListener("changed", () => {
            this.view.drawAll();
        });
    
        // update selected ball
        glo.ballDefinition.addEventListener("change", () => {
            if (this.selected &&  this.selected instanceof Ball) {
                let o = JSON.parse(glo.ballDefinition.value);
                Object.assign(this.selected, o);
                this.view.drawAll();
            }
        });
    
        //------------------- buttons --------------------------------------

        // play-stop toggle
        glo.modeButton.addEventListener("click", () => {
            this.mode = (this.mode + 1) % 2;
            ////if (this.mode === Mode.Play)
                //// glo.curentScene = new Scene();
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
        eraseButton.addEventListener("click", () =>
        {
            this.box.balls = [];
            this.box.lines = [];
            this.box.links = [];
            this._W = glo.W;    // к.п.д. при соударении (1 - без потерь)
            this._K = glo.K;    // модуль упругости (1 - твердый)
            this._g = glo.g;  // 0.002 = 1g;
            this.mode = Mode.Stop;
            this.createMode = CreateMode.Ball;
            glo.chronos = 0;
            this.view.drawAll();
        });

    //------------------- input-range --------------------------------------

    graviRange.addEventListener("change", function ()
    {
        controller.g = this.value;
    });

    waistRange.addEventListener("change", function ()
    {
        W = +this.value;
        waistValue.innerHTML = "W = " + this.value;
    });

    rigidRange.addEventListener("change", function ()
    {
        K = +this.value;
        rigidValue.innerHTML = "K = " + this.value;
    });

    //----------------------------- keyboard ----------------------------

    document.addEventListener("keydown", function (e) {
        if (document.activeElement === ballDefinition)
            return;
        switch(e.key) {
            // stop=play toggle
            case 'Enter':
                controller.mode = (controller.mode + 1) % 2;
                break;

            // step execution
            case 's': case 'S': case 'ы': case 'Ы':
                box.mech.step(box);
                controller.mode = MODE_STOP;
                if (controller.selected)
                    ballDefinition.value = controller.selected.toString();
                break;

            // copy selected ball
            case 'c': case 'C': case 'с': case 'С':
                if (controller.selected && controller.selected.constructor === Ball) {
                    let s = controller.selected;
                    let p = controller.mousePos;
                    let b = new Ball(p.x, p.y, s.radius, s.color, s.vx, s.vy, s.m);
                    box.addBall(b);
                    controller.selected = b;
                    drawAll();
                }
                break;

            // toggle ball color
            case 'f': case 'F': case 'а': case 'А':
            let sel = controller.selected;
            if (!sel)
                break;
            if (sel.constructor === Ball) {
                sel.color = sel.color === "red" ? "blue" : "red";
                drawAll();
            } else if (sel.constructor === Link) {
                sel.transparent = ! sel.transparent;
                drawAll();
            }
            break;

            // calbrate
            case 't': case 'T': case 'е': case 'Е':
            box.calibrate(drawAll());
            break;

            // balls
            case 'b': case 'B': case 'и': case 'И':
            controller.createMode = CREATE_MODE_BALL;
            break;

            // lines
            case 'l': case 'L': case 'д': case 'Д':
            controller.createMode = CREATE_MODE_LINE;
            break;

            // links
            case 'k': case 'K': case 'л': case 'Л':
            controller.createMode = CREATE_MODE_LINK;
            break;

            // delete selected object
            case 'Delete':
                if (!controller.selected)
                    break;
                if (controller.selected.constructor === Ball)
                    box.deleteBall(controller.selected);
                else if (controller.selected.constructor === Line)
                    box.deleteLine(controller.selected);
                else if (controller.selected.constructor === Link)
                    box.deleteLink(controller.selected);
                controller.selected = null;
                drawAll();
                break;
        }
    });

    }


    controller.createMode=0
    //------------------------------ mouse ---------------------------

    // select object
    canvas.addEventListener("click", function (e) {
        let p = {x: e.pageX - this.offsetLeft - box.x,
            y: e.pageY - this.offsetTop - box.y };

        // select ball
        for (let b of box.balls) {
            if (G.dist(p, b ) < b.radius) {
                controller.selected = b;
                if (controller.createMode !== CREATE_MODE_LINK) {
                    controller.createMode = CREATE_MODE_BALL;
                }
                drawAll();
                ballDefinition.value = b.toString();
                break;
            }
        }
        // select line
        for (let l of box.lines) {
            if (G.distToInfiniteLine(p, l) < 5 && G.cross(p, l)) {
                controller.selected = l;
                controller.createMode = CREATE_MODE_LINE;
                drawAll();
                break;
            }
        }
        // select link
        for (let link of box.links) {
            let l = new Line(link.x1, link.y1, link.x2, link.y2 );
            if (G.distToInfiniteLine(p, l) < 5 && G.cross(p, l)) {
                controller.selected = link;
                controller.createMode = CREATE_MODE_LINK;
                drawAll();
                break;
            }
        }

    });

}










function setBallHandlers() {
    let p0 = null;
    let ball = null;
    let mode;  // "velo", "ball", "new"

    canvas.onmousedown = function(e) {
        p0 = {x: e.pageX - this.offsetLeft - box.x, y: e.pageY - this.offsetTop - box.y };
        ball = box.ballVeloUnderPoint(p0);
        if (ball) {
            mode = "velo";
            return;
        }
        ball = box.ballUnderPoint(p0);
        if (ball) {
            mode = "ball";
            // в p0 смещение курсора от центра шара
            p0 = {x: ball.x - p0.x, y: ball.y - p0.y};
            return;
        }
        mode = "new";
    };

    canvas.onmousemove = function(e) {
        let p = {x: e.pageX - this.offsetLeft - box.x, y: e.pageY - this.offsetTop - box.y };

        // change mouse cursor on velo
        canvas.style.cursor = box.ballVeloUnderPoint(p) ? "pointer" : "auto";

        switch (mode) {
            case "velo":
                ball.vx = (p.x - ball.x) / Kvelo;
                ball.vy = (p.y - ball.y) / Kvelo;
                drawAll();
                break;
            case "ball":
                ball.x = p.x + p0.x;
                ball.y = p.y + p0.y;
                drawAll();
                break;
            case "new":
                drawAll();
                drawGrayCircle(p0, p);
                break;
        }
        controller.mousePos = p;
    };

    canvas.onmouseup = function(e) {
        if (mode === "new"){
            // create ball
            let p = {x: e.pageX - this.offsetLeft - box.x,
                y: e.pageY - this.offsetTop - box.y };
            let r = G.dist(p0, p);
            if (r > 2) {
                let b = new Ball(p0.x, p0.y, r);
                box.addBall(b);
                controller.selected = b;
                ballDefinition.value = b.toString();
            }
        }
        mode = null;
        drawAll();
    }
}

function setLineHandlers() {
    let p0 = null;

    canvas.onmousedown = function(e) {
        p0 = {x: e.pageX - this.offsetLeft - box.x,
              y: e.pageY - this.offsetTop - box.y };
    };

    canvas.onmousemove = function(e) {
        let p = {x: e.pageX - this.offsetLeft - box.x,
            y: e.pageY - this.offsetTop - box.y };
        if (p0) {
            drawAll();
            drawGrayLine(p0, p);
        }
        controller.mousePos = p;
    };

    canvas.onmouseup = function(e) {
        if (p0 === null)
            return;
        let p = {x: e.pageX - this.offsetLeft - box.x,
            y: e.pageY - this.offsetTop - box.y };
        if (G.dist(p0, p) > 2) {

            let l = new Line(p0.x, p0.y, p.x, p.y);
            box.addLine(l);
            controller.selected = l;
        }
        p0 = null;
        drawAll();
    };
}

function setLinkHandlers() {
    let b0 = null;

    canvas.onmousedown = function(e) {

        let p = {x: e.pageX - this.offsetLeft - box.x,
            y: e.pageY - this.offsetTop - box.y };

        let b = box.ballUnderPoint(p);
        if (!b)
            return;
        if (!b0) {
            b0 = b;
        } else if (b0 !== b){
            let l = new Link(b0, b);
            box.addLink(l);
            controller.selected = l;
            b0 = null;
        }

    };

    canvas.onmousemove = function(e) {
        controller.mousePos = {x: e.pageX - this.offsetLeft - box.x,
            y: e.pageY - this.offsetTop - box.y };
    };

    canvas.onmouseup = function(e) {
    }
}

