#!/bin/bash
BASEDIR=$(dirname $0)
BASEDIR=$(dirname $BASEDIR)

CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cp /spike/dev/spike-pdf/data/core/supported/bank-statement/normal/SASFIN/sasfin.pdf $BASEDIR/user4
printf "Added ${CYAN}user4/sasfin.pdf${NC}\n"

echo Push enter to end...
read