import { glo, doc } from "./globals.js";

import { Box, Mode} from "./Box.js";
import { Controller } from "./Controller.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";
import { Problem } from "./Problem.js";
import { PrettyMode } from "./View.js";

// Відповідає за збереження сцен і за задачі
//
export class ControllerStore 
{
    box: Box;
    controller: Controller;
    problems: Problem[] = [];
    
    constructor(box: Box, controller: Controller) {
        this.box = box;

        this.controller = controller;
        this.addEventListeners(); 
        this.loadStore();
    }

    async loadStore() {
        try {
            const response = await fetch("./problems.dat");
            if (!response.ok) {
                throw new Error(`Помилка завантаження файлу: ${response.statusText}`);
            }
            const text = await response.text();
            const regex = /TITLE:((.|\r|\n)*?)COND:((.|\r|\n)*?)INIT:((.|\r|\n)*?)ANSWER:((.|\r|\n)*?)---/gm
            const matches = [...text.matchAll(regex)];
            this.problems = matches.map(m => new Problem(m));

            // UI
            const options: HTMLOptionElement[] = this.problems.map((p, i) => new Option(p.title, i.toString()));
            doc.sceneSelect.innerHTML = '';
            doc.sceneSelect.append(...options); 
            doc.sceneSelect.selectedIndex = 0; 
            doc.sceneSelect.dispatchEvent(new Event('change'));
        } 
        catch (error: any) {
            console.error('Помилка:', error.message);
        }
    }

    addEventListeners() 
    {      

        doc.saveSceneButton.addEventListener("click", () => {
            doc.savedSceneArea.value = ControllerStore.sceneToJson(this.box);
        });

        doc.loadSceneButton.addEventListener("click", () => {
            ControllerStore.restoreSceneFromJson(doc.savedSceneArea.value, this.box);
            // view 
            this.controller.resetUI()
            this.controller.mode = Mode.Stop;
        });

        const loadProblemInitScene = () => {
            // 
            let idx = +doc.sceneSelect.value;
            if (idx == 0) {
                this.controller.clearScene();
                doc.problemBoard.style.display = 'none';
                return;
            }    
            let problem = this.problems[idx];
            ControllerStore.restoreSceneFromJson(problem.init, this.box);

            // UI & view 
            this.controller.resetUI();
            doc.condDiv.innerHTML = problem.cond;
            doc.problemBoard.style.display = 'block'; 
            doc.problemBoard.style.backgroundColor = 'rgba(241, 241, 10, 0.1)';
            doc.answerText.style.display = problem.isAnswerNumber ? 'inline' : 'none';
        }

        doc.sceneSelect.addEventListener("change", loadProblemInitScene);

        doc.sceneSelect.addEventListener("click", loadProblemInitScene);

        doc.answerButton.addEventListener("click", (e) => {              
            this.checkAnswer();    
        });

    }

    static sceneToJson(box: Box): string 
    {
        box.balls.forEach(b => {b.box = null; b.clearDots();});
        let o = {
            balls: box.balls.map(b =>{ return {x: b.x, y: b.y, vx: b.vx, vy: b.vy, m: b.m, radius: b.radius, color: b.color, } }),
            lines: box.lines,
            links: box.links.map(l => [l.b1.x, l.b1.y, l.b2.x, l.b2.y]),
            g: glo.g, W: glo.W, Wl: glo.Wl, Wf: glo.Wf, K: glo.K, 
        };
        let json = JSON.stringify(o);
        box.balls.forEach(b => b.box = box);  
        return json;  
    }

    static restoreSceneFromJson(json: string, box: Box): void 
    {
        const o = JSON.parse(json);
        // restore balls
        box.balls = o.balls.map((b: any) => new Ball(b.x, b.y, b.radius, b.color, b.vx, b.vy, b.m));
        box.balls.forEach(b => b.box = box);
        // restore lines
        box.lines = o.lines.map((l: any) => new Line(l.x1, l.y1, l.x2, l.y2));
        // restore links
        box.links = [];
        o.links.forEach((arr: number[]) => {
            let b1 = box.ballUnderPoint({ x: arr[0], y: arr[1] });
            let b2 = box.ballUnderPoint({ x: arr[2], y: arr[3] });
            if (b1 && b2) {
                box.links.push(new Link(b1, b2));
            }
        });
        // restore globals
        glo.g = o.g;
        glo.W = o.W;
        glo.Wl = o.Wl;
        glo.Wf = o.Wf;
        glo.K = o.K;
    }

    checkAnswer() {
        let id = +doc.sceneSelect.value;
        let problem = this.problems[id];
        let testOk = false;
        // 
        if (problem.isAnswerNumber) 
        {
            const MAX_ERROR = 0.03;  // 3%               
            let epsilon = Math.abs((+doc.answerText.value - +problem.answer) / +problem.answer);
            testOk = doc.answerText.value == problem.answer || epsilon < MAX_ERROR
        } 
        else 
        {
            const testFunction = new Function('t, b', `
                return ${problem.answer}
            `);
            let sceneJson = ControllerStore.sceneToJson(this.controller.box);
            for (let t = 1; t <= 1000; t++) {
                this.controller.step();
                if (testFunction(t, this.controller.box.balls[0])) {
                    testOk = true;
                    break;
                }
            }
            ControllerStore.restoreSceneFromJson(sceneJson, this.controller.box);
            this.controller.view.drawAll();
        }

        doc.problemBoard.style.backgroundColor = testOk ?
            'rgba(29, 252, 0, 0.256)' : 
            'rgba(241, 241, 10, 0.1)';
    }
       
}

