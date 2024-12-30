import { glo, doc } from "./globals.js";
import { Geometry as G, Point } from "./Geometry.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";
import { Box, Mode, CreateMode } from "./Box.js";
import { PrettyMode, TraceMode, View } from "./View.js";

export class Controller {
    box: Box;
    view: View;
    private intervalId = 0;   // base field for mode
    private sceneJson = "";
    private _mousePos = new Point(0, 0);
    private _createMode = CreateMode.Ball;
    


    constructor(box: Box, view: View) {
        this.box = box;
        this.view = view;

        // set state of UI
        this.mode = Mode.Stop;
        this.createMode = CreateMode.Ball;
        this.addButtonClickListeners();
        this.addChangeListeners();
        this.addKeyboardListeners();
        this.resetUI();  // last action
    }

    step() { 
        this.box.step(); 
        this.view.drawAll(); 
        if (glo.chronos % 100 === 0) {
            let seconds = (glo.chronos/ 1000 * glo.INTERVAL).toFixed(0);
            let [ek, ep] = this.box.sumEnergy;
            // let impulse = this.box.sumImpulse.toFixed(2);
            doc.infoSpan.innerHTML = `Time: ${seconds}    
            Ek + Ep: ${ek.toFixed(2)} + ${ep.toFixed(2)} = ${(ek + ep).toFixed()}  `;

        }   
    }


    // Встановлює поле box.selected і відкриває панель параметрів для обраної кулі або лінії.
    set selected(obj: Ball | Line | Link | null) {
        // inner function
        function show(val: number | string, id: string) {
            if (typeof val == 'number')
                val = val.toFixed(2);
            let el = document.getElementById(id) as HTMLInputElement;
            el.value = val;
        }

        this.box.selected = obj;

        if (obj instanceof Ball) {
            doc.ballBoard.style.display = 'block';
            doc.lineBoard.style.display = 'none';

            show(obj.m, 'massaText');
            show(obj.radius, 'radiusText'); 
            show(obj.x, 'xText'); 
            show(obj.y, 'yText');
            show(obj.vx, 'vxText'); 
            show(obj.vy, 'vyText');
            let el = document.getElementById('colorText') as HTMLSelectElement;
            el.value = obj.color;            
        }
        else if (obj instanceof Line) {
            doc.ballBoard.style.display = 'none';
            doc.lineBoard.style.display = 'block';
            show(obj.x1, 'x1Text'); show(obj.y1, 'y1Text');
            show(obj.x2, 'x2Text'); show(obj.y2, 'y2Text');
        }
        else 
        {
            doc.ballBoard.style.display = 'none';
            doc.lineBoard.style.display = 'none';
        };
        this.view.drawAll();
    }
    get selected() {
        return this.box.selected;
    }

    set mode(mode: Mode) {
        if (mode === Mode.Play && this.intervalId === 0) {
            this.intervalId = setInterval(() => {
                this.step();
            }, glo.INTERVAL);
            this.sceneJson = this.box.toJson();
        } else {
            clearInterval(this.intervalId);
            this.intervalId = 0;
        }
        // UI
        let icon = mode === Mode.Play ? "stop-fill.svg" : "play-fill.svg";
        (doc.modeButton.children[0] as HTMLImageElement).src = "/assets/icons/" + icon;
        this.view.drawAll();
    }
    get mode(): Mode {
        return this.intervalId ? Mode.Play : Mode.Stop;
    }


    set createMode(v: CreateMode) {
        this._createMode = v;
        doc.createModeButton.innerHTML =
            v === CreateMode.Ball ? "<b>B</b>all"
                : v === CreateMode.Line ? "<b>L</b>ine"
                    : v === CreateMode.Link ? "Lin<b>K</b>" : "";

        // mouse handlers
        if (v === CreateMode.Ball) {
            this.setBallHandlers();
        } else if (v === CreateMode.Line) {
            this.setLineHandlers();
        } else if (v === CreateMode.Link) {
            this.setLinkHandlers();
        }
    }

    set mousePos(point: Point) {
        this._mousePos = point;
        doc.mousePosSpan.innerHTML = `x=${point.x.toFixed(0)} y=${point.y.toFixed(0)}`;
    }
    get mousePos(): Point {
        return this._mousePos
    }

    set g(v: string) {
        glo.g = +v;
        doc.graviValue.innerHTML = "G = " + glo.g.toFixed(3);
        doc.graviRange.value = v;
    }
    set W(v: string) {
        glo.W = +v;
        doc.waistValue.innerHTML = "W = " + v;
        doc.waistRange.value = v;
    }
    set K(v: string) {
        glo.K = +v;
        doc.rigidValue.innerHTML = "K = " + v;
        doc.rigidRange.value = v;
    }

    addButtonClickListeners() 
    {      
        doc.createModeButton.addEventListener("click", () => {
            this.createMode = this._createMode === CreateMode.Ball
                ? CreateMode.Line
                : this._createMode === CreateMode.Line
                    ? CreateMode.Link
                    : CreateMode.Ball;
        });

        // play-stop toggle
        doc.modeButton.addEventListener("click", () => {
            this.mode = this.mode == Mode.Stop ? Mode.Play : Mode.Stop
        });

        // restart button
        doc.restartButton.addEventListener("click", () => {
            if (this.sceneJson) {
                this.box.fromJson(this.sceneJson);
                this.resetUI();
            }
            this.mode = Mode.Stop;
        });

        // ugly-pretty toggle
        doc.prettyButton.addEventListener("click", () => {
            this.view.prettyMode = this.view.prettyMode === PrettyMode.Draft
                ? PrettyMode.Beauty
                : PrettyMode.Draft;
            this.view.drawAll();
        });

        // clear screen
        doc.eraseButton.addEventListener("click", () => {
            this.box.balls = [];
            this.box.lines = [];
            this.box.links = [];
            this.mode = Mode.Stop;
            this.createMode = CreateMode.Ball;
            glo.chronos = 0;
            this.view.drawAll();
        });

        // help
        doc.helpButton.addEventListener("click", () => {
            window.open("./help.html", );
            
        });
    

        // inner function
        function read(id: string): string {
            return (document.getElementById(id) as HTMLInputElement).value;
        }

        doc.applyBallButton.addEventListener("click", () => {
            const ball = this.selected as Ball;
            if (ball) {
                ball.m = +read('massaText');
                ball.radius = +read('radiusText'); ball.color = read('colorText');
                ball.x = +read('xText'); ball.y = +read('yText');
                ball.vx = +read('vxText'); ball.vy = +read('vyText');
            }
            this.view.drawAll();
        });

        doc.applyLineButton.addEventListener("click", () => {
            const line = this.selected as Line;
            if (line) {
                line.x1 = +read('x1Text'); line.y1 = +read('y1Text');
                line.x2 = +read('x2Text'); line.y2 = +read('v2Text');
            }
            this.view.drawAll();
        });

        doc.saveSceneButton.addEventListener("click", () => {
            doc.savedSceneArea.value = this.box.toJson();
        });


        doc.loadSceneButton.addEventListener("click", () => {
            this.box.fromJson(doc.savedSceneArea.value);
            // view 
            this.resetUI()
            this.mode = Mode.Stop;
        });

    }

    resetUI() {
        this.view.drawAll();
        doc.graviRange.value = glo.g.toString();
        doc.waistRange.value = glo.W.toString();
        doc.waistLinkRange.value = glo.Wl.toString();
        doc.rigidRange.value = glo.K.toString();

        doc.graviRange.dispatchEvent(new Event("change"));
        doc.waistRange.dispatchEvent(new Event("change"));
        doc.waistLinkRange.dispatchEvent(new Event("change"));
        doc.rigidRange.dispatchEvent(new Event("change"));           
    }

    addChangeListeners() {
        //------------------- input_change --------------------------------------

        doc.graviRange.addEventListener("change", () => {
            glo.g = +doc.graviRange.value;
            doc.graviValue.innerHTML = "G = " + (glo.g * glo.Kg).toFixed(1);

        });

        doc.waistRange.addEventListener("change", () => {
            glo.W = +doc.waistRange.value;
            doc.waistValue.innerHTML = "W = " + doc.waistRange.value;
        });

        doc.waistLinkRange.addEventListener("change", () => {
            glo.Wl = +doc.waistLinkRange.value;
            doc.waistLinkValue.innerHTML = "Wl = " + doc.waistLinkRange.value;
        });

        doc.rigidRange.addEventListener("change", () => {
            glo.K = +doc.rigidRange.value;
            doc.rigidValue.innerHTML = "K = " + doc.rigidRange.value;
        });

        //----------------------------- document_keydown ----------------------------
    }
    addKeyboardListeners() {
        document.addEventListener("keydown", (e) => {
            switch (e.key) {
                // stop=play toggle
                case 'Enter':
                    this.mode = this.mode == Mode.Stop ? Mode.Play : Mode.Stop
                    break;

                // step execution
                case 's': case 'S': case 'ы': case 'Ы':
                    this.step();
                    this.mode = Mode.Stop;
                    break;

                // copy selected ball
                case 'c': case 'C': case 'с': case 'С':
                    if (this.selected instanceof Ball) {
                        let s = this.selected;
                        let ball = new Ball(this.mousePos.x, this.mousePos.y, s.radius, s.color, s.vx, s.vy, s.m);
                        this.box.addBall(ball);
                        this.selected = ball;
                        this.view.drawAll();
                    }
                    break;

                // toggle ball color
                case 'f': case 'F': case 'а': case 'А':
                    let sel = this.selected;
                    if (!sel)
                        break;
                    if (sel.constructor === Ball) {
                        sel.color = sel.color === "red" ? "blue" : "red";
                        this.view.drawAll();
                    } else if (sel.constructor === Link) {
                        sel.transparent = !sel.transparent;
                        this.view.drawAll();
                    }
                    break;

                // trace mode
                case 't': case 'T': case 'е': case 'Е':
                    this.view.traceMode = this.view.traceMode === TraceMode.No ? TraceMode.Yes : TraceMode.No;
                    if (this.view.traceMode === TraceMode.No) {
                        this.view.clearTrace();
                    }
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
                    if (!this.selected)
                        break;
                    if (this.selected.constructor === Ball)
                        this.box.deleteBall(this.selected);
                    else if (this.selected.constructor === Line)
                        this.box.deleteLine(this.selected);
                    else if (this.selected.constructor === Link)
                        this.box.deleteLink(this.selected);
                    this.selected = null;
                    this.view.drawAll();
                    break;
            }
        });

    }

    private cursorPoint(event: MouseEvent) {
        const canvasRect = doc.canvas.getBoundingClientRect();
        return {
            x: event.x - canvasRect.left - this.box.x,
            y: event.y - canvasRect.top - this.box.y
        };
    }

    setBallHandlers() {
        let p0: Point | null = null;   // в p0 смещение курсора от центра шара
        let ball: Ball | null = null;
        let ballVelo: Ball | null = null;
        let isMousePressed = false;

        doc.canvas.onmousedown = (e) => {
            isMousePressed = true;

            p0 = this.cursorPoint(e);
            ballVelo = this.box.ballVeloUnderPoint(p0);
            if (ballVelo) {
                return;
            }
            ball = this.box.ballUnderPoint(p0);
            if (ball) {
                // в p0 смещение курсора от центра шара
                p0 = { x: ball.x - p0.x, y: ball.y - p0.y };
                this.selected = ball;
            } else {
                if (this.selected instanceof Ball) {
                    this.selected = null;
                }
            }
            // this.view.drawAll();
        };

        doc.canvas.onmousemove = (e) => {
            let p = this.cursorPoint(e);
            this.mousePos = p;

            if (!isMousePressed) return;

            // change mouse cursor on velo
            // doc.canvas.style.cursor = this.box.ballVeloUnderPoint(p) ? "pointer" : "auto";

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
            // creating a new ball
            this.view.drawAll();
            this.view.drawGrayCircle(p0!, p);
        };

        doc.canvas.onmouseup = (e) => {

            if (!ball && !ballVelo) {
                let p = this.cursorPoint(e);
                let r = G.distance(p0!, p);
                if (r > 2) {
                    // create a new ball
                    let newBall = new Ball(p0!.x, p0!.y, r, "red", 0, 0);
                    this.box.addBall(newBall);
                    this.selected = newBall;
                }
            }
            this.view.drawAll();
            isMousePressed = false;
        }
    }

    setLineHandlers() {
        let p0: Point | null = null;

        doc.canvas.onmousedown = (e) => {
            p0 = this.cursorPoint(e);
            let line = this.box.lineUnderPoint(p0);
            if (line) {
                this.selected = line;
            } else {
                if (this.selected instanceof Line) {
                    this.selected = null;
                }
            }
            // this.view.drawAll();
        };

        doc.canvas.onmousemove = (e) => {
            let p = this.cursorPoint(e);
            this.mousePos = p;

            if (p0) {
                this.view.drawAll();
                this.view.drawGrayLine(p0, p);
            }

        };

        doc.canvas.onmouseup = (e) => {
            if (p0 === null)
                return;
            let p = this.cursorPoint(e);
            if (G.distance(p0, p) > 2) {

                let l = new Line(p0.x, p0.y, p.x, p.y);
                this.box.addLine(l);
                this.selected = l;
            }
            p0 = null;
            this.view.drawAll();
        };
    }

    setLinkHandlers() {
        let lastClickedBall: Ball | null = null;

        doc.canvas.onmousedown = (e) => {

            let p = this.cursorPoint(e);

            let ball = this.box.ballUnderPoint(p);

            if (ball === null || ball === lastClickedBall) {
                let link = this.box.linkUnderPoint(p);
                if (link) {
                    this.selected = link;
                } else {
                    if (this.selected instanceof Link) {
                        this.selected = null;
                    }
                }
                return;
            }
            if (lastClickedBall === null) {
                lastClickedBall = ball;
                return;
            }

            let link = new Link(lastClickedBall, ball);
            this.box.addLink(link);
            this.selected = link;
            lastClickedBall = null;
            this.view.drawAll();
        };

        doc.canvas.onmousemove = (e) => {
            this.mousePos = this.cursorPoint(e);
        };

        doc.canvas.onmouseup = (e) => {
        }
    }

}
