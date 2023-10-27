import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import wasm from '@rollup/plugin-wasm';
import multiEntry from 'rollup-plugin-multi-entry';

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap: true,
    },
    plugins: [
      multiEntry(),
      resolve(),
      commonjs(),
      wasm(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        exclude: '**/*.spec.(ts)',
        declarationDir: 'dist',
      }),
    ],
  },
];
