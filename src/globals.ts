export const glo = 
{
    W: 0.8,   // 1 - W = loss of energу when two balls strikes 
    K: 1000,  // modulus of elasticity
    
    g: 0.5,  // 0.05;
    INTERVAL: 30,
    
    canvas: <HTMLCanvasElement>document.getElementById("canvas")!,
    modeButton: <HTMLButtonElement>document.getElementById("modeButton")!,
    createButton: <HTMLButtonElement>document.getElementById("createButton")!,
    updateButton: <HTMLButtonElement>document.getElementById("updateButton")!,
    ballDefinition: <HTMLInputElement>document.getElementById("ballDefinition")!,
    
    
    
}