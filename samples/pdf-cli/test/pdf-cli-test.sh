#!/bin/bash
set -e
SPIKE_ROOT_PRIV=$SPIKE_ROOT/priv
SPIKE_ROOT_PUB=$SPIKE_ROOT/samples
PDF_CLI_PROCESS_ALL=$SPIKE_ROOT_PUB/samples/pdf-cli/test/scripts/process-all-test.sh
GIT_CHECK_CHANGES=$SPIKE_ROOT_PRIV/scripts/git/git-check-error-if-changes.sh

FULLSCRIPTPATH=$(readlink --canonicalize $0) # full path, in case ./script.sh used
BASEDIR=$(dirname $FULLSCRIPTPATH)

YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
GREEN='\033[0;32m'
DARKGRAY='\033[0;90m'
NC='\033[0m' # No Color

runlog() {
  ARGS=$@ # so we can expand $@ with spaces between then in the printf line below
  printf "${DARKGRAY}${ARGS[*]}${NC}\n"
  # echo -e "${DARKGRAY}$@${NC}"
  eval $@
}

printf "${YELLOW}--------------------------------------------------\npdf-cli-test\n--------------------------------------------------\n${NC}"

runlog cd $BASEDIR
runlog $PDF_CLI_PROCESS_ALL
runlog find . -name \*.json -not -path "*settings*" -exec node ./replaceRequestId.js 00000000-0000-4000-a000-000000000001 {} \\\; # note: escape \ and ; when used via runlog
runlog $GIT_CHECK_CHANGES