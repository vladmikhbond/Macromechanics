import { doc } from "./globals.js"; 
import { Box } from "./Box.js";  
import { View } from "./View.js";
import { Controller } from "./Controller.js";


let box = new Box(0, 0, doc.canvas.width, doc.canvas.height );
let view = new View(box);
new Controller(box, view);


// loadGalery();
//box.calibrate(drawAll);
