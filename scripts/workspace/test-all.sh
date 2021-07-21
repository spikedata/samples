#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status
set -x # echo on

FULLSCRIPTPATH=$(readlink --canonicalize $0) # full path, in case ./script.sh used
WORKSPACE_DIR=$(dirname $FULLSCRIPTPATH)
SCRIPTS_DIR=$(dirname $WORKSPACE_DIR)
MONOREPO_ROOT=$(dirname $SCRIPTS_DIR)

PACKAGESTXT=$SCRIPTS_DIR/packages.txt

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# libs
PACKAGES=`grep -v ^\# "$PACKAGESTXT" | tr -s '\n' ' '`

for i in $PACKAGES
do
  DIR=${MONOREPO_ROOT}/${i}
  if [ ! -d "$DIR" ]; then
    set +x
    printf "${RED}------------------------------------------\n${DIR}${NC} : missing\n"
    set -x
    continue
  fi
  cd $DIR
  set +x
  printf "${GREEN}------------------------------------------\n${DIR}\n------------------------------------------\n${NC}"
  set -x
  yarn test
done
