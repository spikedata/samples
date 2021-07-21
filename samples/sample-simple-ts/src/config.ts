import path from "path";

// TODO: inputs
const TOKEN = ""; // TODO: enter token
const FILE = path.join(path.dirname(process.argv[1]), "../../data/example.pdf");
// const FILE = path.join(path.dirname(process.argv[1]), "../../data/too-big.pdf"); // is sent, stopped by AWS
// const FILE = path.join(path.dirname(process.argv[1]), "../../data/way-too-big.pdf"); // not sent, stopped by axios
// const FILE = path.join(path.dirname(process.argv[1]), "../../data/encrypted.pdf"); // not sent, stopped by axios
const PASS = undefined;

export default {
  TOKEN,
  FILE,
  PASS,
};
