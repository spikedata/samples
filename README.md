# Spike public repo

Contains various sample apps which demonstrate how to use the [Spike API](https://docs.spikedata.co.za).

## Setup

```sh
git clone https://github.com/spikedata/samples.git
cd samples
yarn install
yarn build
```

## Samples

| Name                                                     | Overview                                                                                                                                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [curl](./samples/curl/README.md)                         | sends a single pdf to the `/pdf` endpoint using curl and prints the response                                                                                                                    |
| [sample-simple](./samples/sample-simple/README.md)       | sends a single pdf to the `/pdf` endpoint and prints the response                                                                                                                               |
| [sample-simple-ts](./samples/sample-simple-ts/README.md) | above sample written in typescript - demonstrates benefit of using [@spike/api-statements](https://www.npmjs.com/package/@spike/api-statements) (i.e. intellisense) instead of direct requests. |
| [sample-web](./samples/sample-web/README.md)             | shows how to use the[@spike/api-statements](https://www.npmjs.com/package/@spike/api-statements) in a web app                                                                                   |
| [pdf-cli](./samples/pdf-cli/README.md)                   | the source code for the [spike-pdf-cli](https://www.npmjs.com/package/@spike/pdf-cli) command line utitily which can convert pdfs or folders of pdfs                                            |
