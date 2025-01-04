export let glo = 
{
    W: 0.5,     // conservation of energу when two balls strikes ( 1 - no loss)
    Wl: 0.95,   // conservation of energу when link reacts ( 1 - no loss)

    K: 100,     // modulus of elasticity of a ball 
    
    g: 0.0005,  // acceleration of gravity  
    
    INTERVAL: 10,
    chronos: 0,      // in ticks (1 sec = 1000/INTERVAL ticks)

    REPEATER: 2,

    Kvelo: 100,      // for velocity drawing
    // pixInMeter: 1000,
    Kg: 1000,        // for gravity range
}

export const doc = 
{
    canvas: <HTMLCanvasElement>document.getElementById("canvas"),
    canvas2: <HTMLCanvasElement>document.getElementById("canvas2"),
    mousePosSpan: <HTMLSpanElement>document.getElementById("mousePosSpan"),
    infoSpan: <HTMLSpanElement>document.getElementById("infoSpan"),
    createModeButton: <HTMLSpanElement>document.getElementById("createModeButton"),
    traceModeButton: <HTMLSpanElement>document.getElementById("traceModeButton"),
    modeButton: <HTMLButtonElement>document.getElementById("modeButton"),
    prettyButton: <HTMLButtonElement>document.getElementById("prettyButton"),
    updateButton: <HTMLButtonElement>document.getElementById("updateButton"),
    eraseButton: <HTMLButtonElement>document.getElementById("eraseButton"),
    helpButton: <HTMLButtonElement>document.getElementById("helpButton"),
    graviRange: <HTMLInputElement>document.getElementById("graviRange"),  
    waistRange: <HTMLInputElement>document.getElementById("waistRange"),
    waistLinkRange: <HTMLInputElement>document.getElementById("waistLinkRange"),
    rigidRange: <HTMLInputElement>document.getElementById("rigidRange"),
    graviValue: <HTMLLabelElement>document.getElementById("graviValue"),
    waistValue: <HTMLLabelElement>document.getElementById("waistValue"),
    waistLinkValue: <HTMLLabelElement>document.getElementById("waistLinkValue"),
    rigidValue: <HTMLLabelElement>document.getElementById("rigidValue"),
    scenesDiv: <HTMLDivElement>document.getElementById("scenesDiv"),
    sceneSelect: <HTMLSelectElement>document.getElementById("sceneSelect"),
    
    modeGlif: <HTMLSpanElement>document.getElementById("modeGlif"),
    restartButton: <HTMLButtonElement>document.getElementById("restartButton"),
    ballBoard: <HTMLDivElement>document.getElementById("ballBoard"),
    lineBoard: <HTMLDivElement>document.getElementById("lineBoard"),
    applyBallButton: <HTMLButtonElement>document.getElementById("applyBallButton"),
    applyLineButton: <HTMLButtonElement>document.getElementById("applyLineButton"),
    redBallImg: <HTMLImageElement>document.getElementById("redBallImg"),
    greenBallImg: <HTMLImageElement>document.getElementById("greenBallImg"),
    blueBallImg: <HTMLImageElement>document.getElementById("blueBallImg"),
    goldBallImg: <HTMLImageElement>document.getElementById("goldBallImg"),
    saveSceneButton: <HTMLButtonElement>document.getElementById("saveSceneButton"),
    loadSceneButton: <HTMLButtonElement>document.getElementById("loadSceneButton"),
    savedSceneArea: <HTMLTextAreaElement>document.getElementById("savedSceneText"),  
    
    header: <HTMLHeadingElement>document.getElementById("header"),
}
