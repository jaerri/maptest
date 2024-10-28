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
    draw(): void {
        let perlin: Perlin = new Perlin();
        let nodes: Array<[number, number]> = [];
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
function traceNodes(nodes: Array<[number, number]>): PIXI.Graphics {
    let line = new PIXI.Graphics()
        .setStrokeStyle({color: 0x00ee00, width: 2})
        .moveTo(nodes[0][0], HEIGHT-nodes[0][1]);
    for (let i=1; i<nodes.length; i++) {
        line.lineTo(nodes[i][0], HEIGHT-nodes[i][1]).stroke();
    }
    return line;
}

let mapgen = new PerlinMap();
const variableList = { 
    'noise-x': 'x',
    'noise-y': 'y',
    'noise-scale': 'scale',
    'noise-octaves': 'octaves',
    'noise-lacunarity': 'lacunarity',
    'noise-persistence': 'persistence',
    'noise-resolution': 'resolution',
}
const labelList = {
    'noise-persistence-label': 'noise-persistence',
    'noise-resolution-label': 'noise-resolution',
}
function parseHTMLIds<T>(id: string): T {
    return document.getElementById(id)! as T;
}
type getsetter<T> = {
    get: () => T;
    set: (value: T) => void;
}
let variableEls = new Map<HTMLInputElement, getsetter<number>>();
let labelEls = new Map<HTMLElement, getsetter<number>>();
function onChange() {
    variableEls.forEach((getset, el) => {
        getset.set(parseFloat(el?.value));
    });
    labelEls.forEach((getset, el) => {
        el.innerHTML = getset.get().toString();
    });
    mapgen.draw();
}
for (let id in variableList) {
    let key = variableList[id as keyof typeof variableList] as keyof typeof mapgen;
    let el = parseHTMLIds<HTMLInputElement>(id);
    variableEls.set(el, {
            get: () => mapgen[key] as number,
            set: (value: number) => (mapgen as any)[key] = value
        }
    );
    el.addEventListener("change", onChange);
}
for (let id in labelList) {
    let key = id as keyof typeof labelList;
    labelEls.set(
        parseHTMLIds<HTMLElement>(id),
        variableEls.get(parseHTMLIds<HTMLInputElement>(labelList[key]))!
    );
}
onChange();