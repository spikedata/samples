import * as StatementsApi from "@spike/api-statements";
import EXAMPLES from "@spike/api-statements/examples/gen/v2common.js"; // we include examples of all error and success types in this file indexed by .code - see @spike/api-statements/src/response.js : PdfCodes
import { v4 as uuidv4 } from "uuid";
import { WrapperBehaviour, REQUEST_TYPE, TOKEN } from "../config";

if (!TOKEN && (REQUEST_TYPE === WrapperBehaviour.test || REQUEST_TYPE === WrapperBehaviour.prod)) {
  alert("TOKEN missing\n\nYou need to enter your token in config.js.");
}

/*
This file implements a wrapper around the @spike/api-statements which is useful for:

- doing mock invocations - i.e. just returning a pre-canned EXAMPLE
- testing local error conditions - e.g. like network problems, or pdf too large
- making a prod request to the Spike servers
- making a test request to the Spike servers
*/

//#region request

export interface PdfLocalException {
  requestId: string;
  type: "localError";
  code: "localError";
  error: string;
}

function createPdfLocalException(error: string): PdfLocalException {
  return {
    requestId: uuidv4(),
    type: "localError",
    code: "localError",
    error,
  };
}

export type ApiResult = StatementsApi.response.PdfCommonResponse | PdfLocalException;
export async function request(
  token: string,
  buffer: string | Buffer,
  file?: string,
  pass?: string
): Promise<ApiResult> {
  switch (REQUEST_TYPE) {
    case WrapperBehaviour.prod:
    case WrapperBehaviour.test:
      return await req(token, buffer, file, pass);
    case WrapperBehaviour.mock:
      return mock(buffer, file, pass);
    case WrapperBehaviour.error:
      throw new Error("problem");
  }
}

async function req(token: string, buffer: string | Buffer, file?: string, pass?: string): Promise<ApiResult> {
  try {
    if (REQUEST_TYPE === WrapperBehaviour.test) {
      return await StatementsApi.pdf.request2Test(token, file, pass, buffer);
    } else {
      return await StatementsApi.pdf.request2(token, file, pass, buffer);
    }
  } catch (e) {
    if (e instanceof StatementsApi.PdfTooLargeError) {
      return createPdfLocalException("the pdf is too large");
    } else if (e instanceof StatementsApi.InputValidationError) {
      console.error(`invalid inputs:\n ${e.validationErrors.join("\n ")}`);
      return createPdfLocalException("an internal error occurred - invalid inputs");
    } else {
      const ex = e as any;
      if (!ex.response) {
        // net connection error (e.g. down, timeout) or > axios maxBodyLength limit
        // e : AxiosResponse
        return createPdfLocalException("A network connection error occurred - are you connected to the internet?");
      } else {
        // http status error (e.g. 500 internal server error, 413 too big)
        // e : AxiosResponse
        console.error(`http status error: ${ex.response.status} ${ex.response.statusText}`);
        return createPdfLocalException(`An unknown network error occurred: http status = ${ex.response.statusText}`);
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mock(_buffer: string | Buffer, _file?: string, _pass?: string): StatementsApi.response.PdfCommonResponse {
  // return EXAMPLES["pdf/success/bank-statement-normal"].result;
  // return EXAMPLES["pdf/success/bank-statement-no-balance"].result;
  // return EXAMPLES["pdf/success/credit-card-breakdown"].result;
  // return EXAMPLES["pdf/success/credit-card-breakdown-multi-user"].result;
  return EXAMPLES["pdf/success/credit-card-simple"].result;
}

//#endregion

//#region isEncrypted

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const isBase64EncodedPdf = function (base64Txt: string) {
  return base64Txt.slice(0, 5) == "JVBER"; // Buffer.from("%PDF").toString('base64')
};

export enum PasswordCheck {
  InvalidPdf = -1,
  NotEncrypted = 0,
  PasswordRequired = 1,
  PasswordIncorrect = 2,
  PasswordCorrect = 3,
  CheckFailed = 4,
}

const Pdf2JsExceptions = {
  PasswordRequired: {
    name: "PasswordException",
    message: "No password given",
  },
  PasswordIncorrect: {
    name: "PasswordException",
    message: "Incorrect Password",
  },
};

export async function isEncrypted(base64Txt: string, pass?: string): Promise<PasswordCheck> {
  if (!isBase64EncodedPdf(base64Txt)) {
    return PasswordCheck.InvalidPdf;
  }

  const bufferArray = _base64ToArrayBuffer(base64Txt);
  try {
    // window.pdfjsLib = <script defer src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.550/pdf.js"></script>
    await window.pdfjsLib.getDocument({ data: bufferArray, password: pass });
    return pass ? PasswordCheck.PasswordCorrect : PasswordCheck.NotEncrypted;
  } catch (ex: any) {
    if (
      ex.name === Pdf2JsExceptions.PasswordRequired.name &&
      ex.message === Pdf2JsExceptions.PasswordRequired.message
    ) {
      return PasswordCheck.PasswordRequired;
    }
    if (
      ex.name === Pdf2JsExceptions.PasswordIncorrect.name &&
      ex.message === Pdf2JsExceptions.PasswordIncorrect.message
    ) {
      return PasswordCheck.PasswordIncorrect;
    }
    console.error("Pdf.JS exception", ex);
    return PasswordCheck.CheckFailed;
  }
}

function _base64ToArrayBuffer(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

//#endregion
