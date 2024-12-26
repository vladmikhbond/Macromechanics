export let glo = 
{
    W: 0.5,    // conservation of energу when two balls strikes ( 1 - no loss)
    Wl: 0.9,   // conservation of energу when link reacts ( 1 - no loss)

    K: 0.1,    // modulus of elasticity of a ball (1 - absolutely solid)
    
    g: 0.001,  // acceleration of gravity   0.002 = 1 g;
    

    INTERVAL: 30,
    chronos: 0,  // in ticks (1 sec = 1000/INTERVAL ticks)

    REPEATER: 1,


    
    Kvelo: 100,      // for velocity drawing
    pixInMeter: 1000,
    Kg: 0.002,
}

export const doc = 
{
    canvas: <HTMLCanvasElement>document.getElementById("canvas")!,
    modeButton: <HTMLButtonElement>document.getElementById("modeButton")!,
    createButton: <HTMLButtonElement>document.getElementById("createButton")!,
    prettyButton: <HTMLButtonElement>document.getElementById("prettyButton"),
    updateButton: <HTMLButtonElement>document.getElementById("updateButton"),
    eraseButton: <HTMLButtonElement>document.getElementById("eraseButton"),
    graviRange: <HTMLInputElement>document.getElementById("graviRange"),  //
    waistRange: <HTMLInputElement>document.getElementById("waistRange"),
    waistLinkRange: <HTMLInputElement>document.getElementById("waistLinkRange"),
    rigidRange: <HTMLInputElement>document.getElementById("rigidRange"),
    graviValue: <HTMLLabelElement>document.getElementById("graviValue"),
    waistValue: <HTMLLabelElement>document.getElementById("waistValue"),
    waistLinkValue: <HTMLLabelElement>document.getElementById("waistLinkValue"),
    rigidValue: <HTMLLabelElement>document.getElementById("rigidValue"),
    scenesDiv: <HTMLDivElement>document.getElementById("scenesDiv"),
    infoSpan: <HTMLSpanElement>document.getElementById("infoSpan"),
    mousePosSpan: <HTMLSpanElement>document.getElementById("mousePosSpan"),
    modeGlif: <HTMLSpanElement>document.getElementById("modeGlif"),

    restartButton: <HTMLButtonElement>document.getElementById("restartButton"),
    

    ballBoard: <HTMLDivElement>document.getElementById("ballBoard"),
    lineBoard: <HTMLDivElement>document.getElementById("lineBoard"),
    applyBallButton: <HTMLButtonElement>document.getElementById("applyBallButton"),
    applyLineButton: <HTMLButtonElement>document.getElementById("applyLineButton"),

    redBallImg: <HTMLImageElement>document.getElementById("redBallImg"),
    greenBallImg: <HTMLImageElement>document.getElementById("greenBallImg"),
    blueBallImg: <HTMLImageElement>document.getElementById("blueBallImg"),

    saveSceneButton: <HTMLButtonElement>document.getElementById("saveSceneButton"),
    loadSceneButton: <HTMLButtonElement>document.getElementById("loadSceneButton"),
    savedSceneArea: <HTMLTextAreaElement>document.getElementById("savedSceneText"),  
    

    // header: document.getElementById("header"),
    
}

export const world = {
    toString() {
        let w = {W: glo.W, K: glo.K, g: glo.g};
        return JSON.stringify(w);
    },

    fromString(s: string) {
        let o = JSON.parse(s);
        glo.W = o.W;
        glo.K = o.K;
        glo.g = o.g;
     }
};
