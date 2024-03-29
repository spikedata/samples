import config from "./config";
import * as StatementsApi from "@spike/api-statements";
import { AxiosError } from "axios";

interface RunInputs {
  TOKEN: string;
  FILE: string;
  PASS?: string;
}
async function run(i: RunInputs) {
  try {
    // request
    console.log(`requesting ${StatementsApi.constants.host}${StatementsApi.constants.Endpoint.pdf2} ...`);
    const spikeResponse = await StatementsApi.pdf.request2(i.TOKEN, i.FILE, i.PASS);

    // process response
    if (spikeResponse.type === StatementsApi.constants.TYPES.SUCCESS) {
      console.log("JSON", JSON.stringify(spikeResponse, null, 2));
      console.log("SUCCESS");

      // cast spikeResponse in order to get intellisense
      const success = spikeResponse as StatementsApi.response.PdfSuccessCommonResponse;
      console.log("accountHolder:", success.data.statement.nameAddress);
      console.table(success.data.transactions);
    } else {
      console.error("ERROR:", spikeResponse.code);
      // cast spikeResponse in order to get intellisense
      const error = spikeResponse as StatementsApi.response.PdfErrorResponse;
      console.error("BLAME:", StatementsApi.constants.BLAME[error.blame]);
    }
  } catch (e) {
    if (e instanceof StatementsApi.PdfTooLargeError) {
      console.error("EXCEPTION: the pdf is too large");
    } else if (e instanceof StatementsApi.InputValidationError) {
      console.error("EXCEPTION: invalid inputs:\n ", e.validationErrors.join("\n "));
    } else {
      const ex = e as AxiosError;
      if (!ex.response) {
        // net connection error (e.g. down, timeout) or > axios maxBodyLength limit
        // e : AxiosResponse
        console.error("EXCEPTION: net connection error:", ex.code || ex.message);
      } else {
        // http status error (e.g. 500 internal server error, 413 too big)
        // e : AxiosResponse
        console.error("EXCEPTION: http status error:", ex.response.status, ex.response.statusText);
      }
    }
  }
}

run(config);
