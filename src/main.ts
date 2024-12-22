import { doc } from "./globals.js"; 
import { Box } from "./Box.js";  
import { View } from "./View.js";
import { Controller } from "./Controller.js";

let box = new Box(10, 25, doc.canvas.width - 20, doc.canvas.height - 35 );
let view = new View(box);
new Controller(box, view);

// loadGalery();
//box.calibrate(drawAll);
