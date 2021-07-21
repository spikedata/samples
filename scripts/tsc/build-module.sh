#!/bin/bash
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DARKGRAY='\033[0;90m'
NC='\033[0m' # No Color

usage() {
  echo "usage: $0 {pkg-dir}"
};

if [ -z "$1" ]
then
  usage
  exit -1
fi

FULLSCRIPTPATH=$(readlink --canonicalize $0) # full path, in case ./script.sh used
MONOREPOROOT=$(dirname $(dirname $(dirname $FULLSCRIPTPATH)))
PKGDIR=$1

# update path
PATH=$PATH:${MONOREPOROOT}/node_modules/.bin:${PKGDIR}/node_modules/.bin

# tsconfig
cd $PKGDIR
if [ -f tsconfig.module.json ]
then
  TC=tsconfig.module.json
else
  # don't do this - tsc will build all .ts files in the workspace
  # TC=${MONOREPOROOT}/tsconfig.module.json
  printf "${RED}file not found: ${PKGDIR}/tsconfig.module.json${NC}\n"
  exit -1
fi

# transpile
printf "${YELLOW}transpile${NC}\n"
rm -rf ${PKGDIR}/build/module
printf "${DARKGRAY}tsc -p ${TC}${NC}\n"
tsc -p ${TC}

# transform import paths
printf "${YELLOW}transform import paths${NC}\n"
printf "${DARKGRAY}find ${PKGDIR}/build/module -iname \*.js -exec sh -c 'mv "$1" "${1%.js}.mjs"' _ {} \;${NC}\n"
find ${PKGDIR}/build/module -iname \*.js -exec sh -c 'mv "$1" "${1%.js}.mjs"' _ {} \;
shopt -s globstar
printf "${DARKGRAY}jscodeshift ${PKGDIR}/build/module/**/*.mjs -t ${MONOREPOROOT}/codemod/fix-mjs-import-paths.js > /dev/null${NC}\n"
jscodeshift ${PKGDIR}/build/module/**/*.mjs -t ${MONOREPOROOT}/codemod/fix-mjs-import-paths.js > /dev/null
