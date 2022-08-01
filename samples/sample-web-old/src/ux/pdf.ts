// NOTE: needs <script defer src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.550/pdf.js"></script>
// see: $/sample-web/src/server/public/index.html
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
