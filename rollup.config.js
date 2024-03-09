import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import wasm from '@rollup/plugin-wasm';
import multiEntry from 'rollup-plugin-multi-entry';

export default [
  {
    treeshake: false,
    input: 'src/index.ts',
    output: {
      dir: 'build',
      declarationDir: 'build',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
    },
    plugins: [
      multiEntry(),
      resolve(),
      commonjs(),
      json(),
      wasm(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        exclude: '**/*.spec.(ts)',
        declarationDir: 'build',
      }),
    ],
  },
];
