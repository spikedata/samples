# @spike/pdf-cli

`@spike/pdf-cli` allows you to to extract transactions from South African bank statements (pdfs). The list of supported pdf formats can be found here:

- [supported bank statements](https://app.spikedata.co.za/docs/solutions/statement-processing/statement-library.html)
- [supported credit card statements](https://app.spikedata.co.za/docs/solutions/statement-processing/creditcard-library.html)

## Usage

NOTE: `@spike/pdf-cli` is installed as an executable script called `spike-pdf-cli` (see [package.json:bin](https://github.com/spikedata/samples/blob/master/samples/pdf-cli/package.json))

```log
spike-pdf-cli <command>

Commands:
  spike-pdf-cli configure  Configure the tool with your keys
  spike-pdf-cli folder     Recurse through a folder and process all .pdfs found
  spike-pdf-cli single     Process a single .pdf
  spike-pdf-cli combine    combine .json output from previously processed pdfs into a single .csv

Options:
  --version  Show version number                                                           [boolean]
  --help     Show help                                                                     [boolean]
```

## Demo

[![asciicast](https://asciinema.org/a/417070.svg)](https://asciinema.org/a/417070)

## Video

This video shows the `@spike/pdf-cli` in action. NOTE: the link below opens in YouTube - make sure that you have YouTube > Setting > Quality = 1080p (or at least 720p) in order to see the text in the video.

[![How to use the desktop pdf converter](http://img.youtube.com/vi/IA85VADi-6g/0.jpg)](https://www.youtube.com/watch?v=IA85VADi-6g "How to use the desktop pdf converter")

## Spike API

Behind the scenes `@spike/pdf-cli` uses `@spike/api` in order to extract transactions. This involves sending your pdfs to our servers where the parsing and extracting takes place. `@spike/pdf-cli` simply contains functionality to find pdfs on your local filesystem, send them to the Spike servers, and process the json responses.

More info on the `@spike/api` can be found here:

- [@spike/api](https://www.npmjs.com/package/@spike/api)
- [api docs](https://app.spikedata.co.za/docs/code/api/pdf/)

## Source code

You can access the source code for `@spike/pdf-cli` in the Spike public monorepo:

```bash
# clone source code and install package dependencies:
git clone https://github.com/spikedata/samples
cd samples
yarn

# run
node ./samples/pdf-cli/src/run --help
```
