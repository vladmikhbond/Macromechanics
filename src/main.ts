import { doc, glo } from "./globals.js"; 
import { Box } from "./Box.js";  
import { View } from "./View.js";
import { Controller } from "./Controller.js";

import { ControllerStore } from "./ControllerStore.js";

let box = new Box(0, 0, doc.canvas.width, doc.canvas.height );
let view = new View(box);
let controller = new Controller(box, view);





// function validation(probId: number) {
//     let problem = controller.controllerStore.problems[probId]
//     ControllerStore.restoreSceneFromJson(problem.init, controller.box);
//     const test = new Function('t, b', 
//         `console.log(t, b.vy);
//         return ${problem.answer} `
//     );

    
//     //view.drawAll();
//     for (let s = 0; s < 100; s++) {
        
//         controller.step();
//         if (test(glo.chronos, box.balls[0])) {
//             console.log(1111111111111);
//             break;
//         }

//     }
//     console.log(2222222222222);

   

// }

