import { doc, glo } from "./globals.js"; 
import { Box } from "./Box.js";  
import { View } from "./View.js";
import { Controller } from "./Controller.js";

import { ControllerStore } from "./ControllerStore.js";

let box = new Box(0, 0, doc.canvas.width, doc.canvas.height );
let view = new View(box);
let controller = new Controller(box, view);


//    for (let x = 0; x <= 5; x++) {
//       test_1(100, 345+x, 5)  // striking
//    }

//    test_1(100, 345, 5)  // striking

 
// test_3(100, 1000010)   
    
function test_1(k: number, x: number, v: number) {
    let json = '{"balls":[{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"x":345.1,"y":250,"radius":200,"color":"red","vx":-5,"vy":0,"m":1000}],"lines":[{"x1":145,"y1":24.41,"x2":145,"y2":489.41}],"links":[],"g":0,"W":1,"Wl":1,"Wf":1,"Wf":1,"K":100}';
    ControllerStore.restoreSceneFromJson(json, controller.box);
    glo.K = k;
    controller.resetUI();
    
    let ball = box.balls[0];
    ball.x = x;
    ball.vx = -v;
    view.drawAll();
    for (let s = 0; s < 50; s++) {
        let prevX = ball.x
        controller.step();
        let def = 0;
        if (ball.dots.length > 0) {
            def = ball.dots[0].x - (prevX - ball.radius)
        }     
        console.log(`${s}\t${prevX}\t${def}\t${ball.vx}\t`);
    }

    console.log(`---\t${-x + 345}\t${(ball.vx - v) / v}\t`)

}


function test_3(k: number, steps: number) {
    let json = '{"balls":[{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":116.72000009155275,"y":169.28000018310541,"radius":25,"color":"red","vx":0.720000015258789,"vy":0.580000030517578,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":242.26000152587892,"y":144.48000305175782,"radius":25,"color":"red","vx":0.81,"vy":-0.22,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":370.32000152587887,"y":176.18000305175775,"radius":25,"color":"red","vx":0.32,"vy":0.73,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":449.0200015258788,"y":243.32000305175774,"radius":25,"color":"red","vx":0.77,"vy":-0.08,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":458.86000152587906,"y":366.4200030517577,"radius":25,"color":"red","vx":0.41,"vy":0.77,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":408.62000152587893,"y":456.8000030517578,"radius":25,"color":"red","vx":0.87,"vy":-0.5,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":312.00000152587904,"y":484.2000030517577,"radius":25,"color":"red","vx":0.1,"vy":-1.1,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":199.88000152587898,"y":467.24000305175787,"radius":25,"color":"red","vx":0.58,"vy":-0.76,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":130.14000152587892,"y":368.6800030517579,"radius":25,"color":"red","vx":0.79,"vy":-0.52,"m":1000},{"box":null,"ax":0,"ay":0,"testC":0,"testT":0,"dots":[],"dotShadows":[],"x":103.16000152587887,"y":268.8000030517578,"radius":25,"color":"red","vx":0.46,"vy":0.5,"m":1000}],"lines":[{"x1":190.4000015258789,"y1":69.80000305175781,"x2":403.4000015258789,"y2":70.80000305175781},{"x1":404.4000015258789,"y1":70.80000305175781,"x2":538.4000015258789,"y2":206.8000030517578},{"x1":538.4000015258789,"y1":206.8000030517578,"x2":543.4000015258789,"y2":416.8000030517578},{"x1":427.4000015258789,"y1":535.8000030517578,"x2":543.4000015258789,"y2":415.8000030517578},{"x1":179.4000015258789,"y1":550.8000030517578,"x2":427.4000015258789,"y2":535.8000030517578},{"x1":66.4000015258789,"y1":439.8000030517578,"x2":179.4000015258789,"y2":550.8000030517578},{"x1":34.400001525878906,"y1":277.8000030517578,"x2":66.4000015258789,"y2":439.8000030517578},{"x1":34.400001525878906,"y1":277.8000030517578,"x2":56.400001525878906,"y2":141.8000030517578},{"x1":56.400001525878906,"y1":141.8000030517578,"x2":192.4000015258789,"y2":68.80000305175781}],"links":[],"g":0,"W":1,"Wl":1,"Wf":1,"K":128}';
    ControllerStore.restoreSceneFromJson(json, controller.box);
    glo.K = k;
    controller.resetUI();
    view.drawAll();
    
    glo.strikeCounter = 0;
    let E = box.energy[0];
    for (let s = 0; s < steps; s++) {
        controller.step();
    }
    let finalE = box.energy[0];
    let errs = (finalE - E) / E ;
    let err = errs / Math.sqrt(glo.strikeCounter);

    console.log(`${steps}\t ${E}\t ${finalE}\t ${errs}\t ${err}\t ${glo.strikeCounter}`);
    
    view.drawAll();
}

