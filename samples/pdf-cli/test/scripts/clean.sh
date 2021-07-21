#!/bin/bash
BASEDIR=$(dirname $0)
BASEDIR=$(dirname $BASEDIR)

find $BASEDIR -iname \*.csv -printf '%p\n' -exec rm {} \;
find $BASEDIR -iname \*.linejoined.txt -printf '%p\n' -exec rm {} \;
find $BASEDIR -iname \*.json -not -path "*settings.json" -printf '%p\n' -exec rm {} \;
rm $BASEDIR/user4/sasfin.pdf # added by add-file.desktop
