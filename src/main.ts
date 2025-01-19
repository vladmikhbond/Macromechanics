import { doc, glo } from "./globals.js"; 
import { Box } from "./Box.js";  
import { View } from "./View.js";
import { Controller } from "./Controller.js";

import { ControllerStore } from "./ControllerStore.js";

let box = new Box(0, 0, doc.canvas.width, doc.canvas.height );
let view = new View(box);
let controller = new Controller(box, view);

// test_2(100, 2, 1020);     //  0.007250210171999116 16
// test_2(100, 2, 1.e5);     // -0.003665396307427765 1559
// test_2(100, 2, 1.e6);     // -0.001563030423734093 13858

   test_1(100, 345+2.5, 5)  // striking

function test_2(k: number, v: number, steps: number) {
    let json = '{"balls":[{"box":null,"ax":0,"ay":0,"dots":[],"x":209,"y":111,"radius":12,"color":"red","vx":2,"vy":0,"m":1000}],"lines":[{"x1":113.44444274902344,"y1":79.56944274902344,"x2":135.44444274902344,"y2":210.56944274902344},{"x1":135.44444274902344,"y1":210.56944274902344,"x2":274.44444274902344,"y2":214.56944274902344},{"x1":301.44444274902344,"y1":29.569442749023438,"x2":305.44444274902344,"y2":133.56944274902344},{"x1":105.53332901000977,"y1":97.87499237060547,"x2":211.53332901000977,"y2":5.874992370605469},{"x1":190.53332901000977,"y1":11.874992370605469,"x2":322.53332901000977,"y2":44.87499237060547},{"x1":260.53332901000977,"y1":227.87499237060547,"x2":314.53332901000977,"y2":103.87499237060547}],"links":[],"g":0,"W":1,"Wl":1,"Wf":1,"K":100}';
    ControllerStore.restoreSceneFromJson(json, controller.box);
    glo.K = k;
    controller.resetUI();
    view.drawAll();
    let b1 = box.balls[0];
    b1.vx = v;
    b1.vy = 0;
    glo.strikeCounter = 0;
    for (let s = 0; s < steps; s++) {
        controller.step();
    }
    let newV = b1.impulse / b1.m;
    let err = (newV - v) / glo.strikeCounter**0.5;

    console.log(err, glo.strikeCounter);
}

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
