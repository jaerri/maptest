import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    format: "esm",
    outfile: "./public/index.js",
    minify: process.argv.includes('--production'),
    define: {
        'process.env.NODE_ENV': '"production"',
    },
});