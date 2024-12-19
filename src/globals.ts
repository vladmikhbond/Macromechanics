export const glo = 
{
    W: 0.5,    // W - conservation of energу when two balls strikes ( 1 - no loss)
    K: 0.1,    // modulus of elasticity (1 - absolutely solid)
    
    g: 0.001,  // acceleration of gravity   0.002 = 1 g;
    Wl: 0.99,  // 0.96 потери на связях  

    INTERVAL: 30,
    intervalId: null,
    chronos: 0,  // in ticks (1 sec = 1000/INTERVAL ticks)

    REPEATER: 1,
    PRETTY: 0,  // false

    // for velocity drawing
    Kvelo: 100,
    pixInMeter: 1000,


    canvas: <HTMLCanvasElement>document.getElementById("canvas")!,
    modeButton: <HTMLButtonElement>document.getElementById("modeButton")!,
    createButton: <HTMLButtonElement>document.getElementById("createButton")!,
    prettyButton: <HTMLButtonElement>document.getElementById("prettyButton"),
    updateButton: <HTMLButtonElement>document.getElementById("updateButton"),
    eraseButton: <HTMLButtonElement>document.getElementById("eraseButton"),
    saveSceneButton: <HTMLButtonElement>document.getElementById("saveSceneButton"),
    graviRange: <HTMLInputElement>document.getElementById("graviRange"),  //
    waistRange: <HTMLInputElement>document.getElementById("waistRange"),
    rigidRange: <HTMLInputElement>document.getElementById("rigidRange"),
    graviValue: <HTMLLabelElement>document.getElementById("graviValue"),
    waistValue: <HTMLLabelElement>document.getElementById("waistValue"),
    rigidValue: <HTMLLabelElement>document.getElementById("rigidValue"),
    ballDefinition: <HTMLInputElement>document.getElementById("ballDefinition"),
    scenesDiv: <HTMLDivElement>document.getElementById("scenesDiv"),
    infoSpan: <HTMLSpanElement>document.getElementById("infoSpan"),
    mousePosSpan: <HTMLSpanElement>document.getElementById("mousePosSpan"),
    modeGlif: <HTMLSpanElement>document.getElementById("modeGlif"),

    restartButton: <HTMLButtonElement>document.getElementById("restartButton"),

    // redBallImg: document.getElementById("redBallImg"),
    // blueBallImg: document.getElementById("blueBallImg"),
    // header: document.getElementById("header"),
    // exportScenesButton: document.getElementById("exportScenesButton"),
    // importScenesButton: document.getElementById("importScenesButton"),
    // scenesExportText: document.getElementById("scenesExportText"),  
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
