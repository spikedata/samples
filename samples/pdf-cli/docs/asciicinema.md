# script

```sh
# pre-setup
mkdir -p /tmp/demo/small
cp /spike/demo/small/absa*.pdf /tmp/demo/small
cd /tmp/demo
npm init -y
npm i -S @spike/pdf-cli
cd small

# script
asciinema rec -i 1
ll
npx spike-pdf-cli single --file absa.2017-01.pdf
ll
head absa.2017-01.csv
npx spike-pdf-cli folder --folder .
ll
npx spike-pdf-cli combine --folder . -o combined.csv --sortAsc date
ll
cat combined.csv
ctrl-d

# copy
cp /tmp/tmpd5kqfmcm-ascii.cast /spike/v9/samples/samples/pdf-cli/docs/ascii.cast
asciinema play !$
```
