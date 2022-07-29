const StatementsApi = require("@spike/api-statements");
const { TOKEN } = require("../config");

module.exports = async (req, res) => {
  const { file, pass, buffer } = req.body; // body = SpikeApi.shape["client-gw/pdf"]
  const proxyResponse = await pdfProxy(TOKEN, file, pass, buffer);
  return res.json(proxyResponse);
};

async function pdfProxy(TOKEN, FILE, PASS, BUFFER) {
  try {
    // request
    console.log(`requesting ${StatementsApi.constants.url} ...`);
    const spikeResponse = await StatementsApi.pdf.request1(TOKEN, FILE, PASS, BUFFER);

    // NOTE:
    // - the .js sample does not benefit from typechecking
    // - try sample-simple-ts to get intellisense on the spikeResponse object

    // process response
    if (spikeResponse.type === StatementsApi.constants.TYPES.SUCCESS) {
      console.log("SUCCESS");
    } else {
      console.error("ERROR:", StatementsApi.constants.TYPES[spikeResponse.type] + ":" + spikeResponse.code);
    }
    return spikeResponse;
  } catch (e) {
    if (e instanceof SpikeApi.PdfTooLargeError) {
      console.error("EXCEPTION: the pdf is too large");
      return e;
    } else if (e instanceof SpikeApi.InputValidationError) {
      console.error("EXCEPTION: invalid inputs:\n ", e.validationErrors.join("\n "));
      return e;
    } else {
      if (!e.response) {
        console.error("EXCEPTION: server -> api : net connection error:", e);
      } else {
        console.error("EXCEPTION: server -> api : http status error:", e.response.status, e.response.statusText);
      }
      delete e.config; // make sure tokens from the axios request are not exposed to the frontend
      return { serverToSpikeError: e };
    }
  }
}
