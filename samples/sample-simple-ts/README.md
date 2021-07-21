# Spike API

Sample app demonstrating how to access Spike API. See full [docs](https://docs.spikedata.co.za/) online.

This sample converts one of the pdfs in the `./data` folder to json using the all web functions using hardcoded login credentials

## Requirements

- [nodejs](https://nodejs.org/en/) v8+
  - async/await used

## Register

- First register for an account on [spike](https://spikedata.co.za/)
- Get your token from the [settings](https://app.spikedata.co.za/dash/settings/) page - you'll use them below

## How to run

```sh
git clone https://github.com/spikedata/samples
cd samples
yarn install

# configure sample
cd samples/sample-simple-ts
code ./src/config.ts # edit config.js and enter your token

# run = convert ./data/example.pdf
yarn start
# you may want to open ./data/example.pdf in a pdf viewer at this point and compare the output visually
```

# Run other example pdfs

Open [config.js](./src/config.ts) and change to any of the example pdfs. NB you can change to your own pdf if you like.

| pdf                      | notes                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `./data/example.pdf`     | this is the default pdf which is converted above - it is not encrypted                                  |
| `./data/encrypted.pdf`   | a password protected pdf - the password is in [password.txt](./data/password.txt)                       |
| `./data/too-big.pdf`     | this pdf is too large, it will not reach our servers - AWS will return a HTTP 413 (`Payload Too Large`) |
| `./data/way-too-big.pdf` |                                                                                                         |
