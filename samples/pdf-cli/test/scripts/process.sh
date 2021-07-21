#!/bin/bash
# ---------------------------------------------------------
# .desktop setup
# ---------------------------------------------------------
set -e # Exit immediately if a command exits with a non-zero status
BASEDIR=$(dirname $0)       # ./test/scripts
BASEDIR=$(dirname $BASEDIR) # ./test
TESTDATADIR=$BASEDIR # ./test
BASEDIR=$(dirname $BASEDIR) # ./

# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
#node --version # uses `nvm alias default ...`

# ---------------------------------------------------------
# implementation
# ---------------------------------------------------------

node $BASEDIR/src/run.js folder --folder "$TESTDATADIR"
echo Enter to end...
read

