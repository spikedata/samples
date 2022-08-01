#!/bin/bash
#
# usage: spike-statements-api.sh /path/to/token /path/to/your.pdf [password]
# requires: base64, curl
#
set -e # Exit immediately if a command exits with a non-zero status

FULLSCRIPTPATH=$(readlink --canonicalize $0) # full path, in case ./script.sh used
BASEDIR=$(dirname $FULLSCRIPTPATH)
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
GREEN='\033[0;32m'
DARKGRAY='\033[0;90m'
NC='\033[0m' # No Color

usage() {
  printf "${RED}usage: $0 {TOKEN} {FILE} {PASS?}${NC}\n"
};

if [ -z "$1" ]
then
  usage
  exit -1
fi

if [ -z "$2" ]
then
  usage
  exit -1
fi

TOKENPATH=$1
FILE=$2 # e.g. e.g. ./absa.2017-01.pdf
PASS=$3

URL=https://api.spikedata.co.za/pdf2
FILENAME=$(basename $FILE)
TOKEN=$(cat $TOKENPATH)

# body - see spike-api-public/client-gw/pdf.js - for the request body schema
BUFFER=`base64 -w 0 $FILE`
TEMPDIR=$(mktemp -d /tmp/XXXX)
DATAFILE=$TEMPDIR/request.json
echo "{
  \"file\": \"$FILENAME\",
  \"buffer\": \"$BUFFER\",
  \"pass\": \"$PASS\"
}" > $DATAFILE
printf "${YELLOW}"
echo "curl -X POST \"${URL}\" -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" --data @$DATAFILE -sD -"
printf "${NC}"
curl -X POST "${URL}" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" --data @$DATAFILE -sD -
echo