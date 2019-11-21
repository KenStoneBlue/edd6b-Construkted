import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

const globals = {
    cesium: 'Cesium',
};

module.exports = {
    input: pkg.main,
    external: ['cesium'],
    output: {
        file: 'build/CesiumIonSDKPlugin.js',
        format: 'umd',
        globals: globals
    },
    plugins: [
        postcss({
        extensions: [ '.css' ],
        }),
        resolve({
            browser: true,
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
        }),
    ],
};