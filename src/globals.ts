export let glo = 
{
    W: 0.5,      // conservation of energу when two balls strikes ( 1 - no loss)
    Wk: 0.95,    // conservation of energу when link reacts ( 1 - no loss)
    Vis: 0,      // drag coeff   ( 0 - no drag)

    K: 100,     // modulus of elasticity of a ball 
    
    g: 0.005,  // acceleration of gravity  
    
    INTERVAL: 10,
    chronos: 0,      // time in ticks (1 sec = 1000/INTERVAL ticks)

    showBallDeform: true,  // show the deformation of a ball
    Kvelo: 100,      // for velocity drawing
    Kg: 1000,        // for gravity range

    strikeCounter: 0,
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
    helpButton: <HTMLButtonElement>document.getElementById("helpButton"),
    graviRange: <HTMLInputElement>document.getElementById("graviRange"),  
    waistRange: <HTMLInputElement>document.getElementById("waistRange"),
    waistLinkRange: <HTMLInputElement>document.getElementById("waistLinkRange"),
    waistFrictRange: <HTMLInputElement>document.getElementById("waistFrictRange"),
    rigidRange: <HTMLInputElement>document.getElementById("rigidRange"),
    graviValue: <HTMLLabelElement>document.getElementById("graviValue"),
    waistValue: <HTMLLabelElement>document.getElementById("waistValue"),
    waistLinkValue: <HTMLLabelElement>document.getElementById("waistLinkValue"),
    waistFrictValue: <HTMLLabelElement>document.getElementById("waistFrictValue"),
    rigidValue: <HTMLLabelElement>document.getElementById("rigidValue"),
    rangesDiv: <HTMLDivElement>document.getElementById("rangesDiv"),
    scenesDiv: <HTMLDivElement>document.getElementById("scenesDiv"),
    sceneSelect: <HTMLSelectElement>document.getElementById("sceneSelect"),
    
    modeGlif: <HTMLSpanElement>document.getElementById("modeGlif"),
    restartButton: <HTMLButtonElement>document.getElementById("restartButton"),
    problemBoard: <HTMLDivElement>document.getElementById("problemBoard"),
    ballBoard: <HTMLDivElement>document.getElementById("ballBoard"),
    lineBoard: <HTMLDivElement>document.getElementById("lineBoard"),
    condDiv: <HTMLDivElement>document.getElementById("condDiv"),
    answerText: <HTMLInputElement>document.getElementById("answerText"),
    answerButton: <HTMLButtonElement>document.getElementById("answerButton"),
    applyBallButton: <HTMLButtonElement>document.getElementById("applyBallButton"),
    applyLineButton: <HTMLButtonElement>document.getElementById("applyLineButton"),
    redBallImg: <HTMLImageElement>document.getElementById("redBallImg"),
    greenBallImg: <HTMLImageElement>document.getElementById("greenBallImg"),
    blueBallImg: <HTMLImageElement>document.getElementById("blueBallImg"),
    goldBallImg: <HTMLImageElement>document.getElementById("goldBallImg"),
    saveSceneButton: <HTMLButtonElement>document.getElementById("saveSceneButton"),
    loadSceneButton: <HTMLButtonElement>document.getElementById("loadSceneButton"),
    savedSceneArea: <HTMLTextAreaElement>document.getElementById("savedSceneText"),  
    adminButton: <HTMLButtonElement>document.getElementById("adminButton"),
    adminSpan: <HTMLSpanElement>document.getElementById("adminSpan"),
    addProblemButton: <HTMLButtonElement>document.getElementById("addProblemButton"),
    editProblemButton: <HTMLButtonElement>document.getElementById("editProblemButton"),
    delProblemButton: <HTMLButtonElement>document.getElementById("delProblemButton"),
    
    header: <HTMLHeadingElement>document.getElementById("header"),   // 
}
