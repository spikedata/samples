# Spike API

Sample app demonstrating how to access Spike API. See full [docs](https://docs.spikedata.co.za/) online.

This sample uses curl to send a request to the `/pdf` endpoint. You need to obtain an [authorization token](https://docs.spikedata.co.za/developer-guide/authorization/) before you can run it.

## Requirements

- bash
- base64
- curl

## Register

- First register for an account on [spike](https://spikedata.co.za/)
- Get your token from the [settings](https://app.spikedata.co.za/dash/settings/) page - you'll use them below

## How to run

```sh
# get sample repo
git clone https://github.com/spikedata/samples
cd samples/samples/curl
# save your token to ./token
./spike-statements-api.sh ./token ../data/example.pdf
```

# Run other example pdfs

Open [config.js](./src/config.js) and change to any of the example pdfs. NB you can change to your own pdf if you like.

| pdf                      | notes                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `./data/example.pdf`     | this is the default pdf which is converted above - it is not encrypted                                  |
| `./data/encrypted.pdf`   | a password protected pdf - the password is in [password.txt](./data/password.txt)                       |
| `./data/too-big.pdf`     | this pdf is too large, it will not reach our servers - AWS will return a HTTP 413 (`Payload Too Large`) |
| `./data/way-too-big.pdf` |                                                                                                         |
