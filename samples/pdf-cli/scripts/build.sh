#!/bin/bash
FULLSCRIPTPATH=$(readlink --canonicalize $0) # full path, in case ./script.sh used
BASEDIR=$(dirname $FULLSCRIPTPATH)

cd $BASEDIR/..

# bundle code using @vercel/ncc (see https://github.com/yargs/yargs/blob/master/docs/bundling.md)
npx ncc build ./src/run.js -o ./dist

# transpile using babel
npx babel ./dist/index.js > ./dist/run.js
rm ./dist/index.js
npx uglifyjs --compress --mangle -- ./dist/run.js