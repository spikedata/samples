import DropArea from "./dropArea";
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
      await uploadPdf(i, file, base64Txt);
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

init();
