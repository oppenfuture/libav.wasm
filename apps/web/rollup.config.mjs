import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import externals from 'rollup-plugin-node-externals'
import copy from 'rollup-plugin-copy'

const plugins = [
  nodeResolve(),
  commonjs(),
  esbuild({
    target: 'es2017',
    minify: false,
    define: {
    },
  }),
];

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'esm',
    },
    plugins,
    external:['path','fs','ws']
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.iife.js',
      format: 'iife',
    },
    plugins,
  }
];
