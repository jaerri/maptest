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
document.body.insertBefore(app.canvas, document.body.firstChild as ChildNode | null);
declare global { namespace globalThis { var __PIXI_APP__: PIXI.Application; } }
globalThis.__PIXI_APP__ = app;

let WIDTH = app.screen.width, HEIGHT = app.screen.height;

class PerlinMap {
    mapCont: PIXI.Graphics;
    x: number;
    y: number;
    scale: number;
    octaves: number;
    lacunarity: number;
    persistence: number;
    resolution: number;
    draw() {
        let perlin: Perlin = new Perlin();
        let nodes: Array<Array<number>> = [];
        for (let i=0; i<=WIDTH*(1+this.resolution); i+=WIDTH/(this.resolution)) {
            let total = 0;
            let freq = this.scale / 100; // default scale 
            let amp = 1;
            let maxIncremented = 0;
            for (let j=0; j<this.octaves; j++) {
                total+=perlin.noise((i+this.x)*freq, this.y) * amp * HEIGHT/2;
                maxIncremented+=amp;
                freq*=this.lacunarity;
                amp*=this.persistence;
            }
            nodes.push([i, HEIGHT/6 + total/maxIncremented]);
        }
        if (this.mapCont) this.mapCont.destroy();
        this.mapCont = traceNodes(nodes);
        app.stage.addChild(this.mapCont);
    }
}
function traceNodes(nodes: Array<Array<number>>): PIXI.Graphics {
    let line = new PIXI.Graphics()
        .setStrokeStyle({color: 0x00ee00, width: 2})
        .moveTo(nodes[0][0], HEIGHT-nodes[0][1]);
    for (let i=1; i<nodes.length; i++) {
        line.lineTo(nodes[i][0], HEIGHT-nodes[i][1]).stroke();
    }
    return line;
}

const inputList: {input: Array<HTMLInputElement>, label: Array<HTMLSpanElement>} = {
    input: [
        document.getElementById("noise-x")! as HTMLInputElement,
        document.getElementById("noise-y")! as HTMLInputElement,
        document.getElementById("noise-scale")! as HTMLInputElement,
        document.getElementById("noise-octaves")! as HTMLInputElement,
        document.getElementById("noise-lacunarity")! as HTMLInputElement,
        document.getElementById("noise-persistence")! as HTMLInputElement,
        document.getElementById("noise-resolution")! as HTMLInputElement,
    ], 
    label: [
        document.getElementById("noise-resolution-label")!,
        document.getElementById("noise-persistence-label")!
    ]
}

let mapgen = new PerlinMap();
function onChange() {
    mapgen.x = parseFloat(inputList.input[0].value), // x
    mapgen.y = parseFloat(inputList.input[1].value), // y
    mapgen.scale = parseFloat(inputList.input[2].value), // freq
    mapgen.octaves = parseFloat(inputList.input[3].value), // freq
    mapgen.lacunarity = parseFloat(inputList.input[4].value), // lacunarity
    mapgen.persistence = parseFloat(inputList.input[5].value), // persistence
    mapgen.resolution = parseFloat(inputList.input[6].value), // resolution
    inputList.label[0].innerHTML = inputList.input[6].value;
    inputList.label[1].innerHTML = inputList.input[5].value;
    mapgen.draw();
}
for (let inp of inputList.input) inp.addEventListener("change", onChange);
onChange();