import DropArea from "./dropArea";
import * as SpikePdf from "./pdf";
import proxy from "./proxy";

const _pass = undefined; // change this if you have a password protected pdf

function init() {
  new DropArea("drop-area", onDrop);
  document?.getElementById("fileElem")?.addEventListener("change", onChoosePdfs, false);
}

function onDrop(files) {
  handleFiles(files);
}

function onChoosePdfs(e) {
  handleFiles(e.target.files);
}

function handleFiles(files) {
  files = [...files];
  files.forEach(async (file, i) => {
    await readFile(i, file);
  });
}

function readFile(i, file): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async function (event) {
      if (!event.target) {
        output(`invalid file ${file.name}: FileReader returned null`);
        return reject();
      }
      const base64Txt = (event.target.result as string).replace(/^data:application\/pdf;base64,/, "");
      if (await checkPdf(file, base64Txt)) {
        await uploadPdf(i, file, base64Txt);
      }
      resolve(); // don't bother with reject() - errors already handled by uploadPdf()
    };
    reader.readAsDataURL(file);
  });
}

async function uploadPdf(i, file, base64Txt) {
  console.log(`${i} ${file.name}`);
  output(`sending ${file.name}: POST ${location.origin}/pdf ...`);
  const res = await proxy(base64Txt, file.name, _pass);
  output(res);
}

function output(val) {
  const el = document.getElementById("json-output");
  if (el) el.innerText = val ? JSON.stringify(val, null, 2) : "";
}

async function checkPdf(file, base64Txt) {
  const password = undefined; // TODO: implement UI to capture password
  const passwordCheck = await SpikePdf.isEncrypted(base64Txt, password);
  switch (passwordCheck) {
    case SpikePdf.PasswordCheck.PasswordCorrect:
    case SpikePdf.PasswordCheck.NotEncrypted:
      return true;
    case SpikePdf.PasswordCheck.InvalidPdf:
      alert("invalid pdf");
      return false;
    case SpikePdf.PasswordCheck.PasswordRequired:
      alert("password required\n\nTODO: implement UI to enter password");
      return false;
    case SpikePdf.PasswordCheck.CheckFailed:
      alert("unexpected error");
      return false;
    case SpikePdf.PasswordCheck.PasswordIncorrect:
      alert("password incorrect, please try again");
      return false;
    default:
      alert("code out of date with PasswordCheck: " + passwordCheck);
      return false;
  }
}

init();
