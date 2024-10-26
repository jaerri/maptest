new EventSource('/esbuild').addEventListener('change', () => location.reload())
import * as PIXI from "pixi.js";
import { Perlin } from "./perlin";

const app = new PIXI.Application();
await app.init({
    autoDensity: true,
    antialias: true,
    width: 640,
    height: 360
});
let WIDTH = app.screen.width, HEIGHT = app.screen.height;
globalThis.__PIXI_APP__ = app;
document.body.insertBefore(app.canvas, document.body.firstChild as ChildNode | null);

let mapCont: PIXI.Container;
function drawPerlin(start: number, end: number, step: number) {
    let perlin: Perlin = new Perlin();
    let nodes: Array<Array<number>> = [];
    let ratio = WIDTH/Math.abs(end-start);
    for (let i=0; i<=Math.abs(end-start)+step; i+=step) {
        nodes.push([i*ratio, perlin.noise(i+start, 0.32)*HEIGHT/2]);
    }
    if (mapCont) mapCont.destroy();
    mapCont = traceNodes(nodes);
    app.stage.addChild(mapCont);
} 
function traceNodes(nodes: Array<Array<number>>): PIXI.Container {
    let cont = new PIXI.Container();
    let line = new PIXI.Graphics()
        .setStrokeStyle({color: 0x00ee00, width: 2})
        .moveTo(nodes[0][0], HEIGHT-nodes[0][1]);
    for (let i=1; i<nodes.length; i++) {
        line.lineTo(nodes[i][0], HEIGHT-nodes[i][1]).stroke();
    }
    cont.addChild(line);
    return cont;
}
const noiseRangeStartEl = (document.getElementById("noise-range-start")! as HTMLInputElement);
const noiseRangeEndEl = (document.getElementById("noise-range-end")! as HTMLInputElement);
const noiseSamplestepEl = (document.getElementById("noise-samplestep")! as HTMLInputElement);
const noiseSamplestepLabelEl = (document.getElementById("noise-samplestep-label")! as HTMLSpanElement);
function onChange() {
    drawPerlin(
        parseInt(noiseRangeStartEl.value),
        parseInt(noiseRangeEndEl.value), 
        parseFloat(noiseSamplestepEl.value)
    );
    noiseSamplestepLabelEl.innerHTML = noiseSamplestepEl.value;
}
onChange();
noiseRangeStartEl!.addEventListener("change", onChange);
noiseRangeEndEl!.addEventListener("change", onChange);
noiseSamplestepEl!.addEventListener("change", onChange);