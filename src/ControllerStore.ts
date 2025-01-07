import { glo, doc } from "./globals.js";

import { Box, Mode, CreateMode } from "./Box.js";
import { Controller } from "./Controller.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";

export class ControllerStore 
{
    box: Box;
    controller: Controller;
    
    constructor(box: Box, controller: Controller) {
        this.box = box;

        this.controller = controller;
        this.addEventListeners(); 
        this.loadStore();
    }

    async loadStore() {
        try {
            const response = await fetch("./store.txt");
            if (!response.ok) {
                throw new Error(`Помилка завантаження файлу: ${response.statusText}`);
            }
            const text = await response.text();
            const regex = /^---(.*)\r\n(.*)/gm;        // 1gr - text, 2gr - value
            const matches = [...text.matchAll(regex)];
            const options: HTMLOptionElement[] = matches.map(m => new Option(m[1], m[2]));
            doc.sceneSelect.innerHTML = '';
            doc.sceneSelect.append(...options);  
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

        const saveScene = () => {
            ControllerStore.restoreSceneFromJson(doc.sceneSelect.value, this.box);
            // view 
            this.controller.resetUI()
            this.controller.mode = Mode.Stop;
            this.controller.view.clearTrace();
        }

        doc.sceneSelect.addEventListener("change", saveScene);

        doc.sceneSelect.addEventListener("click", saveScene);

    
    }

    static sceneToJson(box: Box): string 
    {
        box.balls.forEach(b => b.box = null);
        let o = {
            balls: box.balls,
            lines: box.lines,
            links: box.links.map(l => [l.b1.x, l.b1.y, l.b2.x, l.b2.y]),
            g: glo.g, W: glo.W,  Wl: glo.Wl, K: glo.K, 
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
        glo.K = o.K;
    }

}
