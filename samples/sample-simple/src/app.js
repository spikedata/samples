const config = require("./config");
const StatementsApi = require("@spike/api-statements");

async function run({ TOKEN, FILE, PASS }) {
  try {
    // request
    console.log(`requesting ${StatementsApi.constants.url} ...`);
    const spikeResponse = await StatementsApi.pdf.request2(TOKEN, FILE, PASS);

    // NOTE:
    // - the .js sample does not benefit from typechecking
    // - try sample-simple-ts to get intellisense on the spikeResponse object

    // process response
    if (spikeResponse.type === StatementsApi.constants.TYPES.SUCCESS) {
      console.log("JSON", JSON.stringify(spikeResponse, null, 2));
      console.log("SUCCESS");
    } else {
      console.error("ERROR:", StatementsApi.constants.TYPES[spikeResponse.type] + ":" + spikeResponse.code);
    }
  } catch (e) {
    if (e instanceof StatementsApi.PdfTooLargeError) {
      console.error("EXCEPTION: the pdf is too large");
    } else if (e instanceof StatementsApi.InputValidationError) {
      console.error("EXCEPTION: invalid inputs:\n ", e.validationErrors.join("\n "));
    } else if (e.isAxiosError) {
      if (!e.response) {
        // net connection error (e.g. down, timeout) or > axios maxBodyLength limit
        // e : AxiosResponse
        console.error("EXCEPTION: net connection error:", e.code || e.message);
      } else {
        // http status error (e.g. 500 internal server error, 413 too big)
        // e : AxiosResponse
        console.error("EXCEPTION: http status error:", e.response.status, e.response.statusText);
      }
    } else {
      // exception in your code inside the try-catch block?
      console.error("EXCEPTION: unknown exception:", e);
    }
  }
}

run(config);
