import { doc, glo } from "./globals.js"; 
import { Box } from "./Box.js";  
import { View } from "./View.js";
import { Controller } from "./Controller.js";

//import { ControllerStore } from "./ControllerStore.js";

let box = new Box(0, 0, doc.canvas.width, doc.canvas.height );
let view = new View(box);
let controller = new Controller(box, view);
