import del from 'delete';
import {
  dest,
  parallel,
  series,
  src,
} from 'gulp';
import ts from 'gulp-typescript';


const tsProject = ts.createProject('tsconfig.json');

export function clean(cb) {
  del(['build/'], cb);
}

export function compileTs() {
  return src(['src/**/*.ts', 'data/**/*.ts'], { base: './' })
    .pipe(tsProject())
    .js
    .pipe(dest('build/'));
}

export function moveFiles() {
  return src(['package.json', 'data/**/*'], { base: './' })
    .pipe(dest('build/'));
}

export default series(clean, parallel(compileTs, moveFiles));
