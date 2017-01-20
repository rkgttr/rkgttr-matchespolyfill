/**
 * rkgttr-matchespolyfill
 *
 * Copyright © 2016 Erik Guittiere. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

 'use strict';

 const fs = require('fs');
 const del = require('del');
 const rollup = require('rollup');
 const babel = require('rollup-plugin-babel');
 const pkg = require('../package.json');

 let promise = Promise.resolve();

 // Clean up the output directory
 promise = promise.then(() => del(['dist/*']));

 // Compile source code into a distributable format with Babel
 ['es', 'cjs', 'umd'].forEach((format, index) => {
   promise = promise.then(() => rollup.rollup({
     entry: 'src/index.js',
     external: Object.keys(pkg.dependencies),
     plugins: index > 0 ? [babel({
       exclude: 'node_modules/**'
     })] : [],
   }).then(bundle => bundle.write({
     dest: `dist/${format === 'cjs' ? 'index' : `index.${format}`}.js`,
     format,
     sourceMap: false,
     moduleName: format === 'umd' ? pkg.name.replace(/-([a-z])/g, g => g[1].toUpperCase()) : undefined,
   })));
 });

 // Copy package.json and LICENSE.txt
 promise = promise.then(() => {
   delete pkg.private;
   delete pkg.devDependencies;
   delete pkg.scripts;
   delete pkg.eslintConfig;
   delete pkg.babel;
   fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
   fs.writeFileSync('dist/LICENSE.txt', fs.readFileSync('LICENSE.txt', 'utf-8'), 'utf-8');
   fs.writeFileSync('dist/README.md', fs.readFileSync('README.md', 'utf-8'), 'utf-8');
 });

 promise.catch(err => console.error(err.stack));