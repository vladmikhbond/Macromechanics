import { glo, doc } from "./globals.js";
import { Geometry as G, Point } from "./Geometry.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";
import { Box, Mode, CreateMode } from "./Box.js";
import { PrettyMode, TraceMode, View } from "./View.js";
import { ControllerStore } from "./ControllerStore.js";

export class Controller 
{
    box: Box;
    view: View;
    controllerStore: ControllerStore;
    private intervalId = 0;   // base field for mode property
    private sceneJson = ""; 
    private _mousePos = new Point(0, 0);
    private _createMode = CreateMode.Ball;


    constructor(box: Box, view: View) {
        this.box = box;
        this.view = view;
        this.controllerStore = new ControllerStore(box, this);

        // set state of UI
        this.mode = Mode.Stop;
        this.createMode = CreateMode.Ball;
        this.addButtonClickListeners();
        this.addChangeListeners();
        this.addKeyboardListeners();
        this.addSpanClickListeners();

        this.resetUI();  // last command of the constructor
    }

    resetUI() {
        this.view.drawAll();
        doc.graviRange.value = glo.g.toString();
        doc.waistRange.value = glo.W.toString();
        doc.waistLinkRange.value = glo.Wk.toString();
        doc.waistFrictRange.value = glo.Vis.toString();
        doc.rigidRange.value = Math.log2(glo.K).toString();

        doc.graviRange.dispatchEvent(new Event("change"));
        doc.waistRange.dispatchEvent(new Event("change"));
        doc.waistLinkRange.dispatchEvent(new Event("change"));
        doc.waistFrictRange.dispatchEvent(new Event("change"));
        doc.rigidRange.dispatchEvent(new Event("change"));
        
        this.mode = Mode.Stop;
        this.view.clearTrace();
    }

    step() { 
        glo.chronos++;
        this.box.balls.forEach( b => b.move() )
        this.box.collectDots();
        this.view.drawAll();
        
        if (glo.chronos % 100 === 0) {
            this.view.showTimeAndEnergy();
        }
    }

    clearScene() {
        this.box.balls = [];
        this.box.lines = [];
        this.box.links = [];
        this.mode = Mode.Stop;
        this.createMode = CreateMode.Ball;
        glo.chronos = 0;
        this.view.drawAll();
    }

    // Встановлює поле box.selected і показує панель параметрів для обраної кулі або лінії.
    //
    set selected(obj: Ball | Line | Link | null) {
        // inner function - show a param
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
            show(doc.canvas.height - obj.y, 'yText');
            show(obj.vx, 'vxText'); 
            show(-obj.vy, 'vyText');
            let el = document.getElementById('colorText') as HTMLSelectElement;
            el.value = obj.color;            
        }
        else if (obj instanceof Line) {
            doc.ballBoard.style.display = 'none';
            doc.lineBoard.style.display = 'block';
            show(obj.x1, 'x1Text'); 
            show(doc.canvas.height - obj.y1, 'y1Text');
            show(obj.x2, 'x2Text'); 
            show(doc.canvas.height - obj.y2, 'y2Text');
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
            this.sceneJson = ControllerStore.sceneToJson(this.box);
            glo.chronos = 0;
        } else {
            clearInterval(this.intervalId);
            this.intervalId = 0;
            this.view.showTimeAndEnergy();
        }
        // UI
        let icon = mode === Mode.Play ? "stop-fill.svg" : "play-fill.svg";
        (doc.modeButton.children[0] as HTMLImageElement).src = "static/assets/icons/" + icon;
    }
    get mode(): Mode {
        return this.intervalId ? Mode.Play : Mode.Stop;
    }


    set createMode(v: CreateMode) 
    {
        // clear selection 
        if (this._createMode != v) {
            this.selected = null;
        }
        this._createMode = v;
        // change UI
        doc.createModeButton.innerHTML =
            v === CreateMode.Ball ? "<b>B</b>all"
                : v === CreateMode.Line ? "<b>L</b>ine"
                    : v === CreateMode.Link ? "Lin<b>K</b>" : "";

        // switch mouse handlers
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
        // show metering
        doc.mousePosSpan.innerHTML = `x=${point.x.toFixed(0)} y=${(doc.canvas.height - point.y).toFixed(0)}`;
    }
    get mousePos(): Point {
        return this._mousePos
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

        doc.traceModeButton.addEventListener("click", () => {
            if (this.view.traceMode === TraceMode.No) {
                this.view.traceMode = TraceMode.Yes;
                doc.traceModeButton.innerHTML = "T"
            } else {
                this.view.traceMode = TraceMode.No;
                this.view.clearTrace();
                doc.traceModeButton.innerHTML = "N"
            }
        });

        // play-stop toggle
        doc.modeButton.addEventListener("click", () => {
            this.mode = this.mode == Mode.Stop ? Mode.Play : Mode.Stop
        });

        // restart button
        doc.restartButton.addEventListener("click", () => {
            if (this.sceneJson) {
                ControllerStore.restoreSceneFromJson(this.sceneJson, this.box);
                this.resetUI();
            }
            this.mode = Mode.Stop;
        });

        // druft-pretty toggle
        doc.prettyButton.addEventListener("click", () => {
            this.view.prettyMode = this.view.prettyMode === PrettyMode.Draft
                ? PrettyMode.Beauty
                : PrettyMode.Draft;
            // UI
            let icon = this.view.prettyMode === PrettyMode.Beauty ? "circle.svg" : "circle-fill.svg";
            (doc.prettyButton.children[0] as HTMLImageElement).src = "static/assets/icons/" + icon;

            this.view.drawAll();
        });

        
        // help
        doc.helpButton.addEventListener("click", () => {
            window.open("static/help.html", );            
        });
    

        // inner function
        function value(id: string): string {
            return (document.getElementById(id) as HTMLInputElement).value;
        }

        doc.applyBallButton.addEventListener("click", () => {
            const ball = this.selected as Ball;
            if (ball) {
                ball.m = +value('massaText');
                ball.radius = +value('radiusText'); ball.color = value('colorText');
                ball.x = +value('xText'); 
                ball.y = doc.canvas.height - +value('yText');
                ball.vx = +value('vxText'); 
                ball.vy = -value('vyText');
            }
            this.view.drawAll();
        });

        doc.applyLineButton.addEventListener("click", () => {
            const line = this.selected as Line;
            if (line) {
                line.setInvariant(
                    +value('x1Text'), 
                    doc.canvas.height - +value('y1Text'), 
                    +value('x2Text'), 
                    doc.canvas.height - +value('y2Text'));
            }
            this.view.drawAll();
        });

    }

    addSpanClickListeners() {
        const handler = (e: Event) => {
            let parentStyle = (e.target as HTMLSpanElement).parentElement!.style;
            if (parentStyle.right == 'unset') {
                parentStyle.right = '0';
                parentStyle.left = 'unset';
            } else {
                parentStyle.right = 'unset';
                parentStyle.left = '0';
            }
        };

        doc.ballBoard.children[0].addEventListener('click', handler);
        doc.lineBoard.children[0].addEventListener('click', handler);
        doc.problemBoard.children[0].addEventListener('click', handler);
    }



    addChangeListeners() {
        //------------------- input_change --------------------------------------

        doc.graviRange.addEventListener("change", () => {
            glo.g = +doc.graviRange.value;
            doc.graviValue.innerHTML = "G=" + glo.g.toFixed(3);
        });

        doc.waistRange.addEventListener("change", () => {
            glo.W = +doc.waistRange.value;
            doc.waistValue.innerHTML = "W=" + doc.waistRange.value;
        });

        doc.waistLinkRange.addEventListener("change", () => {
            glo.Wk = +doc.waistLinkRange.value;
            doc.waistLinkValue.innerHTML = "W<sub>k</sub>=" + doc.waistLinkRange.value;
        });

        doc.waistFrictRange.addEventListener("change", () => {
            glo.Vis = +doc.waistFrictRange.value;
            doc.waistFrictValue.innerHTML = "V=" + doc.waistFrictRange.value;
        });

        doc.rigidRange.addEventListener("change", () => {
            glo.K = 2**+doc.rigidRange.value;
            doc.rigidValue.innerHTML = "K=" + glo.K;
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
                case 's': case 'S': case 'і': case 'І':
                    this.step();
                    this.view.showTimeAndEnergy();
                    this.mode = Mode.Stop;
                    this.selected = this.selected;
                    break;

                // copy selected ball
                case 'c': case 'C': case 'с': case 'С':
                    if (e.ctrlKey) {
                        break;
                    }
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
                    doc.traceModeButton.dispatchEvent(new Event('click'));
                    // this.view.traceMode = this.view.traceMode === TraceMode.No ? TraceMode.Yes : TraceMode.No;
                    // if (this.view.traceMode === TraceMode.No) {
                    //     this.view.clearTrace();
                    // }
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

            ///// Перемикання //////
            let obj = this.box.objectUnderPoint(p0);
            this.selected = obj;

            if (obj instanceof Ball) {
                ball = obj;
            } else if (obj instanceof Line) {
                this.createMode = CreateMode.Line;
            } else if (obj instanceof Link) {
                this.createMode = CreateMode.Link;
            }
            ////////////////////////

            if (ball) {
                // в p0 смещение курсора от центра шара
                p0 = { x: ball.x - p0.x, y: ball.y - p0.y };
            }
            
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
            let line: Line | null = null;
            
            ///// Перемикання //////
            let obj = this.box.objectUnderPoint(p0);
            this.selected = obj;

            if (obj instanceof Ball) {
                this.createMode = CreateMode.Ball;
            } else if (obj instanceof Line) {
                line = obj;
            } else if (obj instanceof Link) {
                this.createMode = CreateMode.Link;
            }
            ////////////////////////   
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

                let link: Link|null = null;

                ///// Перемикання //////
                let obj = this.box.objectUnderPoint(p);
                this.selected = obj;

                if (obj instanceof Ball) {
                    this.createMode = CreateMode.Ball;
                } else if (obj instanceof Line) {
                    this.createMode = CreateMode.Line;
                } else if (obj instanceof Link) {
                    link = obj;
                }
                ////////////////////////

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
