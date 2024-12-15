import { Line } from "./Line.js"; 
import {Box} from "./Box.js"; 
import {Ball} from "./Ball.js"

const box = new Box(100, 100, 600, 400);

box.addBall(new Ball(100, 100, 30, 'red', 0, -4));
box.addBall(new Ball(200, 200, 50, 'black', 4, 0));

box.addLine(new Line(0, 0, 100, 400));
box.addLine(new Line(100, 400, 600, 0));

box.start();