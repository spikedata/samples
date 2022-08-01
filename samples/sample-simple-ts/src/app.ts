import config from "./config";
import * as StatementsApi from "@spike/api-statements";

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
      const success = spikeResponse as StatementsApi.response.PdfSuccessResponse;
      switch (success.data.type) {
        case StatementsApi.response.PdfDataType.BankStatementNoBalance:
        case StatementsApi.response.PdfDataType.BankStatementNormal:
        case StatementsApi.response.PdfDataType.CreditCardSimple:
        case StatementsApi.response.PdfDataType.CreditCardBreakdown:
          // typescript has control flow analysis: so intellisense knows that success.data.statement is StatementInfo | CreditCardStatementInfo here
          console.log("accountHolder:", success.data.statement.nameAddress);
          break;
        case StatementsApi.response.PdfDataType.CreditCardBreakdownMultiUser:
          // typescript has control flow analysis: so intellisense knows that success.data is a CreditCardBreakdownMultiUser here
          for (let i = 0; i < success.data.all.length; ++i) {
            console.log(`accountHolder ${i}:`, success.data.all[i].statement.nameAddress);
          }
          break;
      }
    } else {
      console.error("ERROR:", StatementsApi.constants.TYPES[spikeResponse.type] + ":" + spikeResponse.code);
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
      if (!e.response) {
        // net connection error (e.g. down, timeout) or > axios maxBodyLength limit
        // e : AxiosResponse
        console.error("EXCEPTION: net connection error:", e.code || e.message);
      } else {
        // http status error (e.g. 500 internal server error, 413 too big)
        // e : AxiosResponse
        console.error("EXCEPTION: http status error:", e.response.status, e.response.statusText);
      }
    }
  }
}

run(config);
