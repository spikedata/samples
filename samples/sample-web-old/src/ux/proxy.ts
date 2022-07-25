import axios from "axios";
import * as StatementsApi from "@spike/api-statements";

// NOTE:
// - the proxy makes a call to the proxy server (http://localhost:5000/pdf)
// - /pdf makes the call to the spike api and returns the result
// - this means that your Spike TOKEN is hidden i.e. not accessible in the front-end code

// this is just for testing
// set `_PROXY_BEHAVIOUR = 0|1|2;` in the console
enum ProxyBehaviour {
  normal,
  mock,
  error,
}
let _PROXY_BEHAVIOUR: ProxyBehaviour;

// eslint-disable-next-line prefer-const
_PROXY_BEHAVIOUR = ProxyBehaviour.normal;

export default async function proxy(buffer: Buffer, file?: string, pass?: string) {
  switch (_PROXY_BEHAVIOUR) {
    case ProxyBehaviour.normal:
      return await real(buffer, file, pass);
    case ProxyBehaviour.mock:
      throw new Error("problem");
    case ProxyBehaviour.error:
      return mock(buffer, file, pass);
  }
}

async function real(buffer: Buffer, file?: string, pass?: string) {
  try {
    // request
    console.log(`requesting ${location.origin}/pdf ...`);
    const proxyResponse = await request(buffer, file, pass);

    // process response
    if (proxyResponse.serverToSpikeError) {
      throw proxyResponse;
    } else if (proxyResponse.type === StatementsApi.constants.TYPES.SUCCESS) {
      return proxyResponse;
    } else {
      return `ERROR: ${StatementsApi.constants.TYPES[proxyResponse.type]}: ${proxyResponse.code}`;
    }
  } catch (e) {
    if (e instanceof StatementsApi.PdfTooLargeError) {
      return "EXCEPTION: the pdf is too large";
    } else if (e instanceof StatementsApi.InputValidationError) {
      return `EXCEPTION: invalid inputs:\n ${e.validationErrors.join("\n ")}`;
    } else if (e.serverToSpikeError) {
      return `EXCEPTION: server -> spike: connection error : ${e.serverToSpikeError.message}`;
    } else {
      if (!e.response) {
        // net connection error (e.g. down, timeout) or > axios maxBodyLength limit
        // e : AxiosResponse
        return "EXCEPTION: net connection error";
      } else {
        // http status error (e.g. 500 internal server error, 413 too big)
        // e : AxiosResponse
        return `EXCEPTION: http status error: ${e.response.status} ${e.response.statusText}`;
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mock(_buffer: Buffer, _file?: string, _pass?: string) {
  return {
    requestId: "10000000-0000-4000-a000-000000000001",
    code: "pdf/success/bank-statement-normal",
    type: 2,
    data: {
      file: "1.pdf",
      statement: {
        bank: "ABS.0",
        accountNumber: "9017446437",
        dates: {
          issuedOn: "2018-09-02T00:00:00",
          from: "2018-08-01T00:00:00",
          to: "2018-08-31T00:00:00",
        },
        nameAddress: ["Mr. J Smith", "10 Main Road", "Cape Town", "8001"],
      },
      transactions: [
        {
          id: 1,
          date: "2017-09-12T00:00:00.000Z",
          description: ["Deposit"],
          amount: 1600.01,
          balance: 1600.01,
        },
        {
          id: 2,
          date: "2017-09-12T00:00:00.000Z",
          description: ["#Monthly Account Fee"],
          amount: -100,
          balance: 1000.01,
        },
        {
          id: 3,
          date: "2017-09-12T00:00:00.000Z",
          description: ["Woolworths"],
          amount: -500,
          balance: 1100.01,
        },
      ],
      valid: true,
    },
  };
}

async function request(buffer: Buffer, file?: string, pass?: string) {
  // inputs
  const inputs = StatementsApi.pdf.create(file, pass, buffer); // throws StatementsApi.InputValidationError||PdfTooLargeError

  // request to proxy (not Spike API directly)
  const MAX = 6 * 1024 * 1024;
  const url = "/pdf";
  const response = await axios.post(url, inputs, {
    headers: {
      "Content-Type": "application/json",
    },
    maxContentLength: MAX,
  });
  if (response.status === 200) {
    return response.data;
  }
  throw response;
}
