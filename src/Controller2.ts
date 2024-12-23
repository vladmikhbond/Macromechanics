import { glo, doc } from "./globals.js"; 
import { Geometry as G, Point } from "./Geometry.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";
import { Box, Mode, CreateMode } from "./Box.js";
import { PrettyMode, View } from "./View.js";

export class Controller2 
{
    box: Box;
    view: View;
       
    constructor(box: Box, view: View) {
        this.box = box;
        this.view = view;
   
        
        
    }
}